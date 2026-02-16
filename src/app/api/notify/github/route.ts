import { NextResponse } from "next/server";
import { waClient } from "@/lib/whatsapp-client";
import { db } from "@/index";
import {
  githubRepositories,
  whatsappGroups,
  notificationTemplates,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const notifySchema = z.object({
  token: z.string(),
  event: z.string(),
  repo: z.string(),
  title: z.string(),
  author: z.string(),
  url: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, event, repo, title, author, url } = notifySchema.parse(body);

    // 1. Validate Token & Repo
    const repository = await db.query.githubRepositories.findFirst({
      where: and(
        eq(githubRepositories.apiToken, token),
        eq(githubRepositories.repoName, repo),
        eq(githubRepositories.isActive, true),
      ),
    });

    if (!repository) {
      return NextResponse.json(
        { error: "Invalid token or repository" },
        { status: 401 },
      );
    }

    // 2. Get Active Groups
    const groups = await db.query.whatsappGroups.findMany({
      where: eq(whatsappGroups.isActive, true),
    });

    if (groups.length === 0) {
      return NextResponse.json({ message: "No active WhatsApp groups found" });
    }

    // 3. Get Template (Optional)
    const template = await db.query.notificationTemplates.findFirst({
      where: and(
        eq(notificationTemplates.eventType, event),
        eq(notificationTemplates.isActive, true),
      ),
    });

    // 4. Construct Message
    let message = "";
    if (template) {
      message = template.templateText
        .replace("{{repo}}", repo)
        .replace("{{title}}", title)
        .replace("{{author}}", author)
        .replace("{{url}}", url)
        .replace("{{event}}", event);
    } else {
      // Default fallback
      message = `📢 *${repo}*: ${title}\n\n👤 ${author}\n🔗 ${url}`;
    }

    // 5. Send to all groups
    const status = waClient.getStatus();
    if (!status.isReady) {
      // This is critical, we might want to return 503 but user might retry
      console.warn("WhatsApp client not ready, cannot send notification");
      return NextResponse.json(
        { error: "WhatsApp client not ready" },
        { status: 503 },
      );
    }

    const results = await Promise.allSettled(
      groups.map((g: typeof whatsappGroups.$inferSelect) =>
        waClient.sendGroupMessage(g.groupId, message),
      ),
    );

    const successes = results.filter((r) => r.status === "fulfilled").length;
    const failures = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      sentTo: successes,
      failed: failures,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as z.ZodError).issues },
        { status: 400 },
      );
    }
    console.error("Failed to process notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { sessionManager } from "@/lib/session-manager";
import { db } from "@/index";
import {
  githubRepositories,
  whatsappGroups,
  notificationTemplates,
  webhookEvents,
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

    // 2. Event Allowlist Check
    const allowedEvents = repository.allowedEvents;
    if (
      allowedEvents &&
      allowedEvents.length > 0 &&
      !allowedEvents.includes(event)
    ) {
      console.log(`Event ${event} not in allowlist for ${repo}`);
      return NextResponse.json({ message: "Event ignored by allowlist" });
    }

    // 3. Resolve Target Groups
    let targetGroups: string[] = [];
    if (repository.groupIds && repository.groupIds.length > 0) {
      targetGroups = repository.groupIds;
    } else {
      // Fallback to all active groups if no specific groups configured (Legacy behavior)
      const allGroups = await db.query.whatsappGroups.findMany({
        where: and(
          eq(whatsappGroups.isActive, true),
          eq(whatsappGroups.userId, repository.userId),
        ),
      });
      targetGroups = allGroups.map(
        (g: typeof whatsappGroups.$inferSelect) => g.groupId,
      );
    }

    if (targetGroups.length === 0) {
      return NextResponse.json({ message: "No target WhatsApp groups found" });
    }

    // 4. Resolve Template
    let templateText = repository.messageTemplate;

    if (!templateText) {
      // Fallback to global template
      const globalTemplate = await db.query.notificationTemplates.findFirst({
        where: and(
          eq(notificationTemplates.eventType, event),
          eq(notificationTemplates.isActive, true),
          eq(notificationTemplates.userId, repository.userId),
        ),
      });
      if (globalTemplate) {
        templateText = globalTemplate.templateText;
      }
    }

    // 5. Construct Message with Macros
    let message = "";
    if (templateText) {
      message = templateText
        .replace(/{{repo}}/g, repo)
        .replace(/{{title}}/g, title)
        .replace(/{{author}}/g, author)
        .replace(/{{url}}/g, url)
        .replace(/{{event}}/g, event)
        // New macros style {pr.field}
        .replace(/{pr\.repo}/g, repo)
        .replace(/{pr\.title}/g, title)
        .replace(/{pr\.author}/g, author)
        .replace(/{pr\.url}/g, url)
        .replace(/{pr\.event}/g, event);
    } else {
      // Default fallback
      message = `📢 *${repo}*: ${title}\n\n👤 ${author}\n🔗 ${url}`;
    }

    // 6. Send to resolved groups
    const client = sessionManager.getClient(repository.userId);
    const status = client.getStatus();
    if (!status.isReady) {
      console.warn("WhatsApp client not ready, cannot send notification");
      return NextResponse.json(
        { error: "WhatsApp client not ready" },
        { status: 503 },
      );
    }

    console.log(
      `Sending notification for ${repo} to ${targetGroups.length} groups`,
    );

    const results = await Promise.allSettled(
      targetGroups.map((groupId) => client.sendGroupMessage(groupId, message)),
    );

    const successes = results.filter((r) => r.status === "fulfilled").length;
    const failures = results.filter((r) => r.status === "rejected").length;

    await db.insert(webhookEvents).values({
      userId: repository.userId,
      repoName: repo,
      eventType: event,
      title,
      author,
      groupsSent: successes,
      groupsFailed: failures,
    });

    // 7. Trigger Internal Notification
    try {
      const { triggerNotification } = await import("@/actions/notifications");
      await triggerNotification(repository.userId, {
        type: `github:${event}`,
        title: `GitHub: ${repo}`,
        message: `${author} ${event.replace("_", " ")}: ${title}`,
        link: url,
        metadata: {
          repo,
          event,
          author,
          title,
        },
      });
    } catch (notificationError) {
      console.error(
        "Failed to trigger internal notification:",
        notificationError,
      );
      // Don't fail the webhook because of internal notification failure
    }

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

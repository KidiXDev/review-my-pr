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
import { DateTime } from "luxon";

import { GithubWebhookPayload } from "@/types/github";

export async function POST(request: Request) {
  try {
    const urlObj = new URL(request.url);
    const urlToken = urlObj.searchParams.get("token");

    let body: GithubWebhookPayload;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    let token = urlToken;
    let event = body.event;
    let repo = body.repo;
    let title = body.title;
    let author = body.author;
    let url = body.url;

    // Handle standard JSON payload (curl/legacy) if token not in URL
    if (!token && body.token) {
      token = body.token;
    }

    // Determine event type from header if available (GitHub Webhook)
    const githubEvent = request.headers.get("x-github-event");
    if (githubEvent) {
      event = githubEvent;

      // Attempt to extract details from GitHub webhook payload
      if (body.repository) {
        repo = body.repository.full_name;
      }

      if (body.sender) {
        author = body.sender.login;
      }

      if (githubEvent === "pull_request") {
        title = body.pull_request?.title;
        url = body.pull_request?.html_url;
        if (body.action) {
          if (body.action === "closed" && body.pull_request?.merged) {
            event = `${githubEvent}:merged`;
          } else {
            event = `${githubEvent}:${body.action}`;
          }
        }
      } else if (githubEvent === "issues") {
        title = body.issue?.title;
        url = body.issue?.html_url;
        if (body.action) {
          event = `${githubEvent}:${body.action}`;
        }
      } else if (githubEvent === "push") {
        title = body.head_commit?.message?.split("\n")[0] || "New Push";
        url = body.compare;
        author = body.pusher?.name || author;
      }
    }

    // Fallback/Validation
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    // Ensure we have the minimum required fields
    // If it was a legacy request, these should be satisfied.
    // If it was a real webhook, we tried to extract them.
    if (!repo || !event) {
      return NextResponse.json(
        { error: "Missing repo or event in payload" },
        { status: 400 },
      );
    }

    // Default values for missing optional fields to prevent crashes
    title = title || "Notification";
    author = author || "System";
    url = url || "";

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

    // 2.1. Author Allowlist Check
    const allowedAuthors = repository.allowedAuthors;
    if (
      allowedAuthors &&
      allowedAuthors.length > 0 &&
      (!author || !allowedAuthors.includes(author))
    ) {
      console.log(`Author ${author} not in allowlist for ${repo}`);
      return NextResponse.json({ message: "Author ignored by allowlist" });
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
    const detailedDateLanguage = repository.detailedDateLanguage || "en";

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
      const now = DateTime.now().setZone("Asia/Jakarta");
      const getDayStatus = (hour: number, lang: string) => {
        const isId = lang === "id";
        if (hour >= 0 && hour < 11) return isId ? "Pagi" : "Morning";
        if (hour >= 11 && hour < 15) return isId ? "Siang" : "Afternoon";
        if (hour >= 15 && hour < 18) return isId ? "Sore" : "Evening";
        return isId ? "Malam" : "Night";
      };

      const dateStr = now.toFormat("dd-MM-yyyy");
      const timeStr = now.toFormat("HH:mm");
      const dayStatus = getDayStatus(now.hour, detailedDateLanguage);

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
        .replace(/{pr\.event}/g, event)
        // Date macros
        .replace(/{date\.date}/g, dateStr)
        .replace(/{date\.time}/g, timeStr)
        .replace(/{date\.day_status}/g, dayStatus);
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

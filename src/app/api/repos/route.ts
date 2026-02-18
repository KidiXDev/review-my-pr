import { NextResponse } from "next/server";
import { db } from "@/index";
import { githubRepositories } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";
import { getRequiredSession } from "@/lib/get-session";

export async function GET() {
  try {
    const session = await getRequiredSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repos = await db
      .select()
      .from(githubRepositories)
      .where(eq(githubRepositories.userId, session.user.id))
      .orderBy(desc(githubRepositories.createdAt));
    return NextResponse.json(repos);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 },
    );
  }
}

const saveRepoSchema = z.object({
  repoName: z.string().includes("/"),
});

export async function POST(request: Request) {
  try {
    const session = await getRequiredSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { repoName } = saveRepoSchema.parse(body);

    const apiToken = randomBytes(32).toString("hex");

    await db.insert(githubRepositories).values({
      repoName,
      apiToken,
      userId: session.user.id,
      isActive: true,
    });

    try {
      const { triggerNotification } = await import("@/actions/notifications");
      await triggerNotification(session.user.id, {
        type: "repo:added",
        title: "Repository Added",
        message: `Successfully linked ${repoName} to your account.`,
        metadata: { repoName },
      });
    } catch (err) {
      console.error("Failed to trigger repo:added notification:", err);
    }

    return NextResponse.json({ success: true, apiToken });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as z.ZodError).issues },
        { status: 400 },
      );
    }
    console.error("Failed to save repo:", error);
    return NextResponse.json(
      { error: "Failed to save repository" },
      { status: 500 },
    );
  }
}

const deleteRepoSchema = z.object({
  id: z.string(),
});

export async function DELETE(request: Request) {
  try {
    const session = await getRequiredSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = deleteRepoSchema.parse(body);

    const [repo] = await db
      .select({ userId: githubRepositories.userId })
      .from(githubRepositories)
      .where(eq(githubRepositories.id, id));

    if (!repo || repo.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.delete(githubRepositories).where(eq(githubRepositories.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as z.ZodError).issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

const updateRepoSchema = z.object({
  id: z.string(),
  allowedEvents: z.array(z.string()).optional(),
  allowedAuthors: z.array(z.string()).optional(),
  groupIds: z.array(z.string()).optional(),
  messageTemplate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  try {
    const session = await getRequiredSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      allowedEvents,
      allowedAuthors,
      groupIds,
      messageTemplate,
      isActive,
    } = updateRepoSchema.parse(body);

    const [repo] = await db
      .select({ userId: githubRepositories.userId })
      .from(githubRepositories)
      .where(eq(githubRepositories.id, id));

    if (!repo || repo.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db
      .update(githubRepositories)
      .set({
        allowedEvents,
        allowedAuthors,
        groupIds,
        messageTemplate,
        isActive,
      })
      .where(eq(githubRepositories.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as z.ZodError).issues },
        { status: 400 },
      );
    }
    console.error("Failed to update repo:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

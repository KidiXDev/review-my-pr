import { NextResponse } from "next/server";
import { db } from "@/index";
import { githubRepositories } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";

export async function GET() {
  try {
    const repos = await db
      .select()
      .from(githubRepositories)
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
    const body = await request.json();
    const { repoName } = saveRepoSchema.parse(body);

    const user = await db.query.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "No user found" }, { status: 401 });
    }

    // Generate a secure random token
    const apiToken = randomBytes(32).toString("hex");

    await db.insert(githubRepositories).values({
      repoName,
      apiToken,
      userId: user.id,
      isActive: true,
    });

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
    const body = await request.json();
    const { id } = deleteRepoSchema.parse(body);

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

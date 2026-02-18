import { NextResponse } from "next/server";
import { db } from "@/index";
import { whatsappGroups, githubRepositories } from "@/db/schema";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { getRequiredSession } from "@/lib/get-session";

export async function GET(request: Request) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  try {
    const query = db
      .select()
      .from(whatsappGroups)
      .where(
        search
          ? and(
              eq(whatsappGroups.userId, session.user.id),
              ilike(whatsappGroups.name, `%${search}%`),
            )
          : eq(whatsappGroups.userId, session.user.id),
      )
      .orderBy(desc(whatsappGroups.createdAt));

    const groups = await query;

    // Fetch repositories to calculate usage counts
    const repos = await db
      .select({ groupIds: githubRepositories.groupIds })
      .from(githubRepositories)
      .where(eq(githubRepositories.userId, session.user.id));

    const usageMap = new Map<string, number>();
    repos.forEach((repo) => {
      repo.groupIds?.forEach((gid) => {
        usageMap.set(gid, (usageMap.get(gid) || 0) + 1);
      });
    });

    const groupsWithUsage = groups.map((g) => ({
      ...g,
      usageCount: usageMap.get(g.groupId) || 0,
    }));

    return NextResponse.json(groupsWithUsage);
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 },
    );
  }
}

import { z } from "zod";

const updateGroupSchema = z.object({
  groupId: z.string(),
  isActive: z.boolean(),
});

export async function PATCH(request: Request) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { groupId, isActive } = updateGroupSchema.parse(body);

    const [group] = await db
      .select()
      .from(whatsappGroups)
      .where(
        and(
          eq(whatsappGroups.userId, session.user.id),
          eq(whatsappGroups.groupId, groupId),
        ),
      );

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // If trying to deactivate, check if group is used in any repository
    if (isActive === false) {
      const usedInRepos = await db
        .select({
          id: githubRepositories.id,
          repoName: githubRepositories.repoName,
        })
        .from(githubRepositories)
        .where(
          and(
            eq(githubRepositories.userId, session.user.id),
            sql`${groupId} = ANY(${githubRepositories.groupIds})`,
          ),
        )
        .limit(1);

      if (usedInRepos.length > 0) {
        return NextResponse.json(
          {
            error:
              "Cannot deactivate group because it is currently used by one or more repositories.",
          },
          { status: 400 },
        );
      }
    }

    await db
      .update(whatsappGroups)
      .set({ isActive })
      .where(eq(whatsappGroups.id, group.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as z.ZodError).issues },
        { status: 400 },
      );
    }
    console.error("Failed to update group:", error);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 },
    );
  }
}

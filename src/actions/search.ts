"use server";

import { db } from "@/index";
import { githubRepositories, whatsappGroups } from "@/db/whatsapp-schema";
import { eq, ilike, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function searchGlobal(query: string) {
  if (!query || query.length < 2) return { repos: [], groups: [] };

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const searchPattern = `%${query}%`;

  const [repos, groups] = await Promise.all([
    db
      .select({
        id: githubRepositories.id,
        name: githubRepositories.repoName,
        type: sql<string>`'repo'`,
      })
      .from(githubRepositories)
      .where(
        and(
          eq(githubRepositories.userId, userId),
          ilike(githubRepositories.repoName, searchPattern),
        ),
      )
      .limit(5),
    db
      .select({
        id: whatsappGroups.id,
        name: whatsappGroups.name,
        type: sql<string>`'group'`,
      })
      .from(whatsappGroups)
      .where(
        and(
          eq(whatsappGroups.userId, userId),
          ilike(whatsappGroups.name, searchPattern),
        ),
      )
      .limit(5),
  ]);

  return {
    repos,
    groups,
  };
}

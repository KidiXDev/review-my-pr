import { NextResponse } from "next/server";
import { db } from "@/index";
import { whatsappGroups } from "@/db/schema";
import { and, desc, eq, ilike } from "drizzle-orm";
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
    return NextResponse.json(groups);
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/index";
import { whatsappGroups } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const groups = await db
      .select()
      .from(whatsappGroups)
      .orderBy(desc(whatsappGroups.createdAt));
    return NextResponse.json(groups);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 },
    );
  }
}

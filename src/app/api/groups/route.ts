import { NextResponse } from "next/server";
import { db } from "@/index";
import { whatsappGroups } from "@/db/schema";
import { desc, ilike } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  try {
    const query = db.select().from(whatsappGroups).$dynamic();

    if (search) {
      query.where(ilike(whatsappGroups.name, `%${search}%`));
    }

    query.orderBy(desc(whatsappGroups.createdAt));

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

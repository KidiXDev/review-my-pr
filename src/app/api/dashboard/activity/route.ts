import { NextResponse } from "next/server";
import { db } from "@/index";
import { webhookEvents } from "@/db/schema";
import { sql, gte } from "drizzle-orm";
import { subDays, format, eachDayOfInterval } from "date-fns";

export async function GET() {
  try {
    const sevenDaysAgo = subDays(new Date(), 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const rows = await db
      .select({
        date: sql<string>`to_char(${webhookEvents.createdAt}, 'YYYY-MM-DD')`,
        events: sql<number>`count(*)`,
        messages: sql<number>`coalesce(sum(${webhookEvents.groupsSent}), 0)`,
      })
      .from(webhookEvents)
      .where(gte(webhookEvents.createdAt, sevenDaysAgo))
      .groupBy(sql`to_char(${webhookEvents.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${webhookEvents.createdAt}, 'YYYY-MM-DD')`);

    const rowMap = new Map(rows.map((r) => [r.date, r]));

    const days = eachDayOfInterval({
      start: sevenDaysAgo,
      end: new Date(),
    });

    const data = days.map((day) => {
      const key = format(day, "yyyy-MM-dd");
      const row = rowMap.get(key);
      return {
        date: format(day, "EEE"),
        fullDate: key,
        events: Number(row?.events ?? 0),
        messages: Number(row?.messages ?? 0),
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch activity data:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity data" },
      { status: 500 },
    );
  }
}

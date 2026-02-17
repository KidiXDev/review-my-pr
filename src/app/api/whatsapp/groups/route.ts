import { NextResponse } from "next/server";
import { sessionManager } from "@/lib/session-manager";
import { db } from "@/index";
import { whatsappGroups } from "@/db/schema";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const client = sessionManager.getClient(userId);
    const status = client.getStatus();

    if (!status.isReady) {
      return NextResponse.json(
        { error: "WhatsApp client is not ready" },
        { status: 503 },
      );
    }

    const groups = await client.getAllGroups();

    const formattedGroups = groups.map((g) => ({
      id: g.id,
      name: g.subject,
      participantCount: g.participants.length,
    }));

    return NextResponse.json(formattedGroups);
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 },
    );
  }
}

const saveGroupSchema = z.object({
  groupId: z.string(),
  name: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { groupId, name } = saveGroupSchema.parse(body);
    const userId = session.user.id;

    await db.insert(whatsappGroups).values({
      groupId,
      name,
      userId: userId,
      isActive: true,
    });

    // Trigger internal notification
    try {
      const { triggerNotification } = await import("@/actions/notifications");
      await triggerNotification(userId, {
        type: "group:added",
        title: "Group Linked",
        message: `Successfully linked WhatsApp group "${name}".`,
        metadata: { groupId, name },
      });
    } catch (err) {
      console.error("Failed to trigger group:added notification:", err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as z.ZodError).issues },
        { status: 400 },
      );
    }
    console.error("Failed to save group:", error);
    return NextResponse.json(
      { error: "Failed to save group" },
      { status: 500 },
    );
  }
}

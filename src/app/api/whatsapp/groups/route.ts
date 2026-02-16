import { NextResponse } from "next/server";
import { waClient } from "@/lib/whatsapp-client";
import { db } from "@/index";
import { whatsappGroups } from "@/db/schema";
import { z } from "zod";

export async function GET() {
  try {
    const status = waClient.getStatus();
    if (!status.isReady) {
      return NextResponse.json(
        { error: "WhatsApp client is not ready" },
        { status: 503 },
      );
    }

    const groups = await waClient.getAllGroups();

    // Map to simpler object
    const formattedGroups = groups.map((g) => ({
      id: g.id._serialized,
      name: g.name,
      participantCount: (g as unknown as { participants: unknown[] })
        .participants.length,
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
    const body = await request.json();
    const { groupId, name } = saveGroupSchema.parse(body);

    // TODO: Get real userId from session. For now using a hardcoded or first user.
    // In a real app we would use auth() from better-auth
    const user = await db.query.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "No user found" }, { status: 401 });
    }

    await db.insert(whatsappGroups).values({
      groupId,
      name,
      userId: user.id,
      isActive: true,
    });

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

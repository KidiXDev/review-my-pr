import { NextResponse } from "next/server";
import { waClient } from "@/lib/whatsapp-client";
import { z } from "zod";

const sendTestSchema = z.object({
  groupId: z.string(),
  message: z
    .string()
    .default("This is a test notification from Review My PR bot."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { groupId, message } = sendTestSchema.parse(body);

    const status = waClient.getStatus();
    if (!status.isReady) {
      return NextResponse.json(
        { error: "WhatsApp client is not ready" },
        { status: 503 },
      );
    }

    await waClient.sendGroupMessage(groupId, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as z.ZodError).issues },
        { status: 400 },
      );
    }
    console.error("Failed to send test message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}

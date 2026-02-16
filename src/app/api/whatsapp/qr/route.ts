import { NextResponse } from "next/server";
import { waClient } from "@/lib/whatsapp-client";

export async function GET() {
  try {
    const qr = waClient.getLatestQR();
    const status = waClient.getStatus();

    // If connected, we might not have a QR, but that's fine.
    // If not connected and no QR, it might be initializing.

    return NextResponse.json({
      qr,
      ...status,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch WhatsApp status" },
      { status: 500 },
    );
  }
}

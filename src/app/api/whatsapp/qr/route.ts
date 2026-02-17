import { NextResponse } from "next/server";
import { sessionManager } from "@/lib/session-manager";
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

    const qr = client.getLatestQR();
    const status = client.getStatus();

    return NextResponse.json({
      qr,
      ...status,
    });
  } catch (error) {
    console.error("Failed to fetch WhatsApp status:", error);
    return NextResponse.json(
      { error: "Failed to fetch WhatsApp status" },
      { status: 500 },
    );
  }
}

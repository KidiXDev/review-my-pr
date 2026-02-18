import { NextResponse } from "next/server";
import { sessionManager } from "@/lib/session-manager";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const client = sessionManager.getClient(userId);

    await client.reload();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to retry WhatsApp connection:", error);
    return NextResponse.json(
      { error: "Failed to retry connection" },
      { status: 500 },
    );
  }
}

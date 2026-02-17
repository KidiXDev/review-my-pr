import { NextResponse } from "next/server";
import { sessionManager } from "@/lib/session-manager";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const groupIdsParam = url.searchParams.get("groupIds");

    if (!groupIdsParam) {
      return NextResponse.json(
        { error: "Missing groupIds parameter" },
        { status: 400 },
      );
    }

    const groupIds = groupIdsParam.split(",").filter(Boolean);

    if (groupIds.length === 0) {
      return NextResponse.json([]);
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

    const participantsMap = new Map<
      string,
      { id: string; phone: string; name: string; groupIds: string[] }
    >();

    for (const groupId of groupIds) {
      try {
        const members = await client.getGroupParticipants(groupId);
        for (const m of members) {
          const existing = participantsMap.get(m.id);

          if (existing) {
            if (!existing.groupIds.includes(groupId)) {
              existing.groupIds.push(groupId);
            }
            continue;
          }

          let phone = "";

          if (m.phoneNumber) {
            phone = m.phoneNumber.replace(/@s\.whatsapp\.net$/, "");
          } else if (m.id.endsWith("@lid")) {
            const resolved = await client.resolveLidToPhone(m.id);
            if (resolved) {
              phone = resolved.replace(/@s\.whatsapp\.net$/, "");
            } else {
              phone = m.id.replace(/@lid$/, "");
            }
          } else {
            phone = m.id.replace(/@s\.whatsapp\.net$/, "");
          }

          participantsMap.set(m.id, {
            id: m.id,
            phone,
            name: m.name || m.notify || m.verifiedName || phone,
            groupIds: [groupId],
          });
        }
      } catch (err) {
        console.error(
          `Failed to fetch participants for group ${groupId}:`,
          err instanceof Error ? err.message : err,
          err instanceof Error ? err.stack : "",
        );
      }
    }

    return NextResponse.json(Array.from(participantsMap.values()));
  } catch (error) {
    console.error("Failed to fetch group participants:", error);
    return NextResponse.json(
      { error: "Failed to fetch group participants" },
      { status: 500 },
    );
  }
}

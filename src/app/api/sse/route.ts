import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import redis from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const channel = `user:updates:${userId}`;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const initData = JSON.stringify({ type: "connected" });
      controller.enqueue(encoder.encode(`data: ${initData}\n\n`));

      const subscriber = redis.duplicate();

      subscriber.subscribe(channel, (err) => {
        if (err) {
          console.error("Failed to subscribe to Redis channel:", err);
          controller.close();
          return;
        }
      });

      subscriber.on("message", (chn, message) => {
        if (chn === channel) {
          try {
            // Ensure message is valid JSON before sending
            JSON.parse(message);
            controller.enqueue(encoder.encode(`data: ${message}\n\n`));
          } catch (e) {
            console.error("Invalid JSON message received from Redis:", e);
          }
        }
      });

      // Handle stream closure
      request.signal.addEventListener("abort", () => {
        subscriber.quit();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const channel = `user:notifications:${userId}`;

  let redisSub: ReturnType<typeof redis.duplicate> | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message to keep connection alive immediately
      const initData = `data: ${JSON.stringify({ type: "connected" })}\n\n`;
      controller.enqueue(encoder.encode(initData));

      redisSub = redis.duplicate();
      await redisSub.subscribe(channel);

      redisSub.on("message", (_channel, message) => {
        const data = `data: ${message}\n\n`;
        controller.enqueue(encoder.encode(data));
      });

      // Heartbeat to keep connection alive
      intervalId = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch {
          if (intervalId) clearInterval(intervalId);
        }
      }, 15000);
    },
    cancel() {
      if (intervalId) clearInterval(intervalId);
      if (redisSub) {
        redisSub.unsubscribe(channel);
        redisSub.quit();
      }
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

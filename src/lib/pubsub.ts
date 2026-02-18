import redis from "@/lib/redis";

export async function publishUpdate(
  userId: string,
  event: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
) {
  try {
    const channel = `user:updates:${userId}`;
    const payload = JSON.stringify({
      type: event,
      data,
      timestamp: new Date().toISOString(),
    });

    await redis.publish(channel, payload);
    return true;
  } catch (error) {
    console.error(
      `Failed to publish update ${event} for user ${userId}:`,
      error,
    );
    return false;
  }
}

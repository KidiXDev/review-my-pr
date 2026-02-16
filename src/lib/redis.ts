import Redis from "ioredis";

const redisClientSingleton = () => {
  return new Redis({
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    db: Number(process.env.REDIS_DB),
    keyPrefix: "mockify-pro:",
  });
};

declare global {
  var redis: undefined | ReturnType<typeof redisClientSingleton>;
}

const redis = globalThis.redis ?? redisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== "production") globalThis.redis = redis;

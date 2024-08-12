import Redis from "ioredis";
import "dotenv/config";
const {
  REDIS_HOST = "localhost",
  REDIS_PORT = "6379",
  REDIS_PASSWORD = "",
} = process.env;

const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT, 10),
  password: REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (error) => {
    const targetErrors = ["READONLY", "ECONNRESET"];
    console.error("Redis error:", error);
    if (
      targetErrors.some((targetError) => error.message.startsWith(targetError))
    ) {
      console.error("Reconnecting to Redis...");
      return true;
    }
    return false;
  },
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

export default redis;

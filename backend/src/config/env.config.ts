import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT) || 3000,
  CLIENT_URL:
    process.env.CLIENT_URL ??
    (() => {
      throw new Error("Missing CLIENT_URL environment variable");
    })(),
  DATABASE_URL:
    process.env.DATABASE_URL ??
    (() => {
      throw new Error("Missing DATABASE_URL environment variable");
    })(),
  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET ??
    (() => {
      throw new Error("Missing JWT_ACCESS_SECRET environment variable");
    })(),
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ??
    (() => {
      throw new Error("Missing JWT_REFRESH_SECRET environment variable");
    })(),
};

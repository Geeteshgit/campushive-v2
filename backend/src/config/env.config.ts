import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  CLIENT_URL:
    process.env.CLIENT_URL ??
    (() => {
      throw new Error("Missing CLIENT_URL environment variable");
    })(),
};

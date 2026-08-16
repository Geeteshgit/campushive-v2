import type { Server as HttpServer } from "node:http";

import { Server } from "socket.io";

import { env } from "../config/env.config.js";
import { prisma } from "./prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";

let io: Server | undefined;

const getAccessToken = (cookieHeader?: string, authToken?: unknown) => {
  if (typeof authToken === "string") return authToken;
  const cookie = cookieHeader
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith("accessToken="));

  return cookie?.slice("accessToken=".length);
};

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const accessToken = getAccessToken(
        socket.handshake.headers.cookie,
        socket.handshake.auth.token,
      );
      if (!accessToken) return next(new Error("Authentication required"));

      const payload = verifyAccessToken(accessToken);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, deletedAt: true },
      });
      if (!user || user.deletedAt) return next(new Error("Authentication required"));

      socket.data.userId = user.id;
      next();
    } catch {
      next(new Error("Authentication required"));
    }
  });

  io.on("connection", (socket) => {
    socket.join("public");
    socket.join(`user:${socket.data.userId as string}`);

    socket.on("conversation:join", async (conversationId: unknown, acknowledge?: (result: { success: boolean }) => void) => {
      if (typeof conversationId !== "string") {
        acknowledge?.({ success: false });
        return;
      }

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { type: "PUBLIC" },
            { members: { some: { userId: socket.data.userId as string } } },
          ],
        },
        select: { id: true },
      });

      if (!conversation) {
        acknowledge?.({ success: false });
        return;
      }

      socket.join(`conversation:${conversation.id}`);
      acknowledge?.({ success: true });
    });
  });

  return io;
};

export const emitPublicMessage = (message: unknown) => {
  io?.to("public").emit("public-message:new", message);
};

export const emitDirectMessage = (
  conversationId: string,
  recipientId: string,
  message: unknown,
) => {
  io?.to(`conversation:${conversationId}`).emit("direct-message:new", message);
  io?.to(`user:${recipientId}`).emit("direct-message:new", message);
};

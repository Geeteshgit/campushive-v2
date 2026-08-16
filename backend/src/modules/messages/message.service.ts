import { prisma } from "../../lib/prisma.js";
import { emitDirectMessage, emitPublicMessage } from "../../lib/socket.js";
import { AppError } from "../../utils/app-error.js";

import type { MessagePagination, SendMessageInput } from "./message.schema.js";

const senderSelect = {
  id: true,
  username: true,
} as const;

const messageInclude = {
  sender: { select: senderSelect },
} as const;

const getDirectKey = (firstUserId: string, secondUserId: string) =>
  `dm:${[firstUserId, secondUserId].sort().join(":")}`;

const getPublicConversation = async () =>
  prisma.conversation.upsert({
    where: { key: "public" },
    create: { key: "public", type: "PUBLIC" },
    update: {},
  });

const paginateMessages = async (
  conversationId: string,
  { page, limit }: MessagePagination,
) => {
  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      include: messageInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.message.count({ where: { conversationId } }),
  ]);

  return {
    messages: messages.reverse(),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getPublicMessages = async (pagination: MessagePagination) => {
  const conversation = await getPublicConversation();
  return paginateMessages(conversation.id, pagination);
};

export const sendPublicMessage = async (
  senderId: string,
  data: SendMessageInput,
) => {
  const conversation = await getPublicConversation();
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId,
      content: data.content ?? null,
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.imageId !== undefined && { imageId: data.imageId }),
    },
    include: messageInclude,
  });
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });
  emitPublicMessage(message);
  return message;
};

const ensureReceiver = async (senderId: string, receiverId: string) => {
  if (senderId === receiverId) {
    throw new AppError("You cannot send a direct message to yourself", 400);
  }
  const receiver = await prisma.user.findFirst({
    where: { id: receiverId, deletedAt: null },
    select: { id: true },
  });
  if (!receiver) throw new AppError("Message recipient not found", 404);
};

export const getPrivateMessages = async (
  senderId: string,
  receiverId: string,
  pagination: MessagePagination,
) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      key: getDirectKey(senderId, receiverId),
      members: { some: { userId: senderId } },
    },
    select: { id: true },
  });
  if (conversation) return paginateMessages(conversation.id, pagination);

  await ensureReceiver(senderId, receiverId);

  return {
    messages: [],
    pagination: { ...pagination, total: 0, totalPages: 0 },
  };
};

export const getConversationMessages = async (
  userId: string,
  conversationId: string,
  pagination: MessagePagination,
) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [
        { type: "PUBLIC" },
        { members: { some: { userId } } },
      ],
    },
    select: { id: true },
  });
  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }
  return paginateMessages(conversation.id, pagination);
};

export const sendPrivateMessage = async (
  senderId: string,
  receiverId: string,
  data: SendMessageInput,
) => {
  await ensureReceiver(senderId, receiverId);
  const conversation = await prisma.conversation.upsert({
    where: { key: getDirectKey(senderId, receiverId) },
    create: {
      key: getDirectKey(senderId, receiverId),
      type: "DIRECT",
      members: { create: [{ userId: senderId }, { userId: receiverId }] },
    },
    update: { updatedAt: new Date() },
  });
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId,
      content: data.content ?? null,
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.imageId !== undefined && { imageId: data.imageId }),
    },
    include: messageInclude,
  });
  emitDirectMessage(conversation.id, receiverId, message);
  return message;
};

export const getUserConversations = async (userId: string) =>
  prisma.conversation.findMany({
    where: { type: "DIRECT", members: { some: { userId } } },
    select: {
      id: true,
      updatedAt: true,
      members: { select: { user: { select: senderSelect } } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: messageInclude,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

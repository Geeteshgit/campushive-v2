import crypto from "crypto";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { hashPassword } from "../../utils/password.js";

import type { UpdateUserInput } from "./user.schema.js";

const userSelect = {
  id: true,
  username: true,
  email: true,
  profilePhotoUrl: true,
  profilePhotoId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const carpoolInclude = {
  user: {
    select: {
      id: true,
      username: true,
    },
  },
  members: {
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  },
} as const;

export const getUserCarpools = async (userId: string) => {
  await prisma.carpool.updateMany({
    where: { status: "ACTIVE", departureTime: { lte: new Date() } },
    data: { status: "EXPIRED" },
  });

  const where = {
    OR: [{ userId }, { members: { some: { userId } } }],
  };

  const [active, expired, cancelled] = await Promise.all([
    prisma.carpool.findMany({
      where: {
        ...where,
        status: "ACTIVE",
      },
      include: carpoolInclude,
      orderBy: { departureTime: "asc" },
    }),
    prisma.carpool.findMany({
      where: {
        ...where,
        status: "EXPIRED",
      },
      include: carpoolInclude,
      orderBy: { departureTime: "desc" },
    }),
    prisma.carpool.findMany({
      where: {
        ...where,
        status: "CANCELLED",
      },
      include: carpoolInclude,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return { active, expired, cancelled };
};

export const updateUserById = async (userId: string, data: UpdateUserInput) => {
  if (data.username !== undefined) {
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new AppError("Username already exists", 409);
    }
  }

  try {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.username !== undefined && { username: data.username }),
        ...(data.profilePhotoUrl !== undefined && {
          profilePhotoUrl: data.profilePhotoUrl,
        }),
        ...(data.profilePhotoId !== undefined && {
          profilePhotoId: data.profilePhotoId,
        }),
      },
      select: userSelect,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      throw new AppError("User not found", 404);
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new AppError("Username already exists", 409);
    }

    throw error;
  }
};

export const deleteUserById = async (userId: string) => {
  const deletedAt = new Date();
  const deletedIdentifier = userId.replaceAll("-", "");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.carpool.updateMany({
        where: {
          userId,
          status: "ACTIVE",
        },
        data: { status: "CANCELLED" },
      });

      await tx.carpoolRequest.updateMany({
        where: {
          carpool: { userId },
          status: "PENDING",
        },
        data: { status: "CANCELLED" },
      });

      await tx.message.updateMany({
        where: { senderId: userId },
        data: { senderId: null },
      });

      await tx.conversationMember.deleteMany({
        where: { userId },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          username: `deleted_${deletedIdentifier}`,
          email: `deleted+${deletedIdentifier}@campushive.invalid`,
          password: null,
          profilePhotoUrl: null,
          profilePhotoId: null,
          deletedAt,
        },
      });

      await tx.session.deleteMany({
        where: { userId },
      });
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      throw new AppError("User not found", 404);
    }

    throw error;
  }
};

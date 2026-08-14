import crypto from "crypto";
import bcrypt from "bcrypt";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";

import { hashPassword, comparePassword } from "../../utils/password";

import type { RegisterInput, LoginInput } from "./auth.schema";

const REFRESH_TOKEN_DAYS = 7;
const REFRESH_TOKEN_SALT_ROUNDS = 12;

const getRefreshTokenExpiry = (): Date => {
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

  return expiresAt;
};

const sanitizeUser = (user: {
  id: string;
  username: string;
  email: string;
  profilePhotoUrl: string | null;
  profilePhotoId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    profilePhotoUrl: user.profilePhotoUrl,
    profilePhotoId: user.profilePhotoId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const createSession = async (userId: string) => {
  const sessionId = crypto.randomUUID();

  const refreshToken = generateRefreshToken(userId, sessionId);

  const refreshTokenHash = await bcrypt.hash(
    refreshToken,
    REFRESH_TOKEN_SALT_ROUNDS,
  );

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      refreshTokenHash,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  const accessToken = generateAccessToken(userId);

  return {
    accessToken,
    refreshToken,
  };
};

export const register = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === data.email) {
      throw new AppError("Email already exists", 409);
    }

    throw new AppError("Username already exists", 409);
  }

  const password = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password,
    },
  });

  const tokens = await createSession(user.id);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordValid = await comparePassword(data.password, user.password);

  if (!passwordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const tokens = await createSession(user.id);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

export const refresh = async (refreshToken: string) => {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  const session = await prisma.session.findUnique({
    where: {
      id: payload.sessionId,
    },
  });

  if (!session) {
    throw new AppError("Invalid session", 401);
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    throw new AppError("Session expired", 401);
  }

  const tokenValid = await bcrypt.compare(
    refreshToken,
    session.refreshTokenHash,
  );

  if (!tokenValid) {
    throw new AppError("Invalid session", 401);
  }

  // Refresh-token rotation
  await prisma.session.delete({
    where: {
      id: session.id,
    },
  });

  return createSession(payload.userId);
};

export const logout = async (refreshToken?: string) => {
  if (!refreshToken) {
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    await prisma.session.deleteMany({
      where: {
        id: payload.sessionId,
      },
    });
  } catch {
    // Logout succeeds even when the
    // refresh token is invalid/expired.
  }
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return sanitizeUser(user);
};

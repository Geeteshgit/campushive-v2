import type { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new AppError("Authentication required", 401);
    }

    const payload = verifyAccessToken(accessToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      throw new AppError("Authentication required", 401);
    }

    res.locals.user = {
      id: payload.userId,
    };

    next();
  } catch (error) {
    next(error);
  }
};

import type { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/app-error.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate = (
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

    res.locals.user = {
      id: payload.userId,
    };

    next();
  } catch (error) {
    next(error);
  }
};

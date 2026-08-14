import type { NextFunction, Request, Response } from "express";

import { registerSchema, loginSchema } from "./auth.schema";

import * as authService from "./auth.service.js";

import { AppError } from "../../utils/app-error.js";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
};

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = registerSchema.parse(req.body);

    const result = await authService.register(data);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(201).json({
      message: "Registration successful",
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await authService.login(data);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(200).json({
      message: "Login successful",
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError("Refresh token missing", 401);
    }

    const result = await authService.refresh(refreshToken);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(200).json({
      message: "Token refreshed",
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    await authService.logout(refreshToken);

    res.clearCookie("accessToken", cookieOptions);

    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getCurrentUser(res.locals.user.id);

    return res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
};

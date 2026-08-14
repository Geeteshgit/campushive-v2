import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.config";

const ACCESS_SECRET = env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = env.JWT_REFRESH_SECRET;

export interface AccessTokenPayload {
  userId: string;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

export const generateAccessToken = (userId: string): string => {
  const payload: AccessTokenPayload = {
    userId,
  };

  const options: SignOptions = {
    expiresIn: "15m",
  };

  return jwt.sign(payload, ACCESS_SECRET, options);
};

export const generateRefreshToken = (
  userId: string,
  sessionId: string,
): string => {
  const payload: RefreshTokenPayload = {
    userId,
    sessionId,
  };

  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(payload, REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
};

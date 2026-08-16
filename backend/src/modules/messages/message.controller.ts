import type { NextFunction, Request, Response } from "express";

import * as messageService from "./message.service.js";
import {
  conversationIdParamSchema,
  messagePaginationSchema,
  receiverIdParamSchema,
  sendMessageSchema,
  userIdParamSchema,
} from "./message.schema.js";

export const getPublicMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = messagePaginationSchema.parse(req.query);
    const result = await messageService.getPublicMessages(query);
    res.status(200).json({
      success: true,
      data: result.messages,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const sendPublicMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = sendMessageSchema.parse(req.body);
    const message = await messageService.sendPublicMessage(
      res.locals.user.id,
      data,
    );
    res
      .status(201)
      .json({ success: true, message: "Message sent", data: message });
  } catch (error) {
    next(error);
  }
};

export const getPrivateMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = userIdParamSchema.parse(req.params);
    const query = messagePaginationSchema.parse(req.query);
    const result = await messageService.getPrivateMessages(
      res.locals.user.id,
      userId,
      query,
    );
    res.status(200).json({
      success: true,
      data: result.messages,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const sendPrivateMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { receiverId } = receiverIdParamSchema.parse(req.params);
    const data = sendMessageSchema.parse(req.body);
    const message = await messageService.sendPrivateMessage(
      res.locals.user.id,
      receiverId,
      data,
    );
    res
      .status(201)
      .json({ success: true, message: "Message sent", data: message });
  } catch (error) {
    next(error);
  }
};

export const getUserConversations = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const conversations = await messageService.getUserConversations(
      res.locals.user.id,
    );
    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

export const getConversationMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { conversationId } = conversationIdParamSchema.parse(req.params);
    const query = messagePaginationSchema.parse(req.query);
    const result = await messageService.getConversationMessages(
      res.locals.user.id,
      conversationId,
      query,
    );
    res.status(200).json({
      success: true,
      data: result.messages,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

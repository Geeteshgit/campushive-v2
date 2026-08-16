import type { NextFunction, Request, Response } from "express";

import * as carpoolService from "./carpool.service.js";
import {
  carpoolIdParamSchema,
  carpoolPaginationSchema,
  createCarpoolSchema,
  memberIdParamSchema,
  requestDecisionSchema,
  requestIdParamSchema,
  requestStatusQuerySchema,
  updateCarpoolSchema,
} from "./carpool.schema.js";

export const createCarpool = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = createCarpoolSchema.parse(req.body);
    const carpool = await carpoolService.createCarpool(
      res.locals.user.id,
      data,
    );
    res
      .status(201)
      .json({
        success: true,
        message: "Carpool created successfully",
        data: carpool,
      });
  } catch (error) {
    next(error);
  }
};

export const getCarpools = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = carpoolPaginationSchema.parse(req.query);
    const result = await carpoolService.getCarpools(query);
    res
      .status(200)
      .json({
        success: true,
        data: result.carpools,
        pagination: result.pagination,
      });
  } catch (error) {
    next(error);
  }
};

export const getCarpoolById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = carpoolIdParamSchema.parse(req.params);
    const carpool = await carpoolService.getCarpoolById(id);
    res.status(200).json({ success: true, data: carpool });
  } catch (error) {
    next(error);
  }
};

export const updateCarpool = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = carpoolIdParamSchema.parse(req.params);
    const data = updateCarpoolSchema.parse(req.body);
    const carpool = await carpoolService.updateCarpool(
      id,
      res.locals.user.id,
      data,
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Carpool updated successfully",
        data: carpool,
      });
  } catch (error) {
    next(error);
  }
};

export const cancelCarpool = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = carpoolIdParamSchema.parse(req.params);
    const carpool = await carpoolService.cancelCarpool(id, res.locals.user.id);
    res.status(200).json({
      success: true,
      message: "Carpool cancelled successfully",
      data: carpool,
    });
  } catch (error) {
    next(error);
  }
};

export const requestToJoinCarpool = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = carpoolIdParamSchema.parse(req.params);
    const request = await carpoolService.requestToJoinCarpool(
      id,
      res.locals.user.id,
    );
    res
      .status(201)
      .json({ success: true, message: "Join request sent", data: request });
  } catch (error) {
    next(error);
  }
};

export const getCarpoolRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = carpoolIdParamSchema.parse(req.params);
    const { status } = requestStatusQuerySchema.parse(req.query);
    const requests = await carpoolService.getCarpoolRequests(
      id,
      res.locals.user.id,
      status,
    );
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const decideCarpoolRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id, requestId } = requestIdParamSchema.parse(req.params);
    const decision = requestDecisionSchema.parse(req.body);
    const request = await carpoolService.decideCarpoolRequest(
      id,
      requestId,
      res.locals.user.id,
      decision,
    );
    res
      .status(200)
      .json({
        success: true,
        message: `Request ${decision.action}ed`,
        data: request,
      });
  } catch (error) {
    next(error);
  }
};

export const removeCarpoolMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id, userId } = memberIdParamSchema.parse(req.params);
    await carpoolService.removeCarpoolMember(id, res.locals.user.id, userId);
    res.status(200).json({ success: true, message: "Carpool member removed" });
  } catch (error) {
    next(error);
  }
};

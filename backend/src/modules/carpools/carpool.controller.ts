import type { Request, Response, NextFunction } from "express";
import * as carpoolService from "./carpool.service";

export const createCarpool = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Temporary until Auth0 is integrated
    const userId = req.body.userId;

    const carpool = await carpoolService.createCarpool(userId, req.body);

    return res.status(201).json({
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
) => {
  try {
    const carpools = await carpoolService.getCarpools();

    return res.status(200).json({
      success: true,
      data: carpools,
    });
  } catch (error) {
    next(error);
  }
};

export const getCarpoolById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const carpool = await carpoolService.getCarpoolById(id);

    if (!carpool) {
      return res.status(404).json({
        success: false,
        message: "Carpool not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: carpool,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCarpool = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    // Temporary until Auth0 is integrated
    const userId = req.body.userId;

    const carpool = await carpoolService.updateCarpool(id, userId, req.body);

    return res.status(200).json({
      success: true,
      message: "Carpool updated successfully",
      data: carpool,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCarpool = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    // Temporary until Auth0 is integrated
    const userId = req.body.userId;

    await carpoolService.deleteCarpool(id, userId);

    return res.status(200).json({
      success: true,
      message: "Carpool deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

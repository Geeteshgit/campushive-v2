import { Router } from "express";

import {
  getCarpools,
  createCarpool,
  getCarpoolById,
  updateCarpool,
  deleteCarpool,
} from "./carpool.controller.js";

const router: Router = Router();

router.get("/", getCarpools);
router.post("/", createCarpool);
router.get("/:id", getCarpoolById);
router.put("/:id", updateCarpool);
router.delete("/:id", deleteCarpool);

export default router;

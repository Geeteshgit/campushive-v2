import { Router } from "express";

import {
  getAllCarpools,
  getUserCarpools,
  createCarpool,
  deleteCarpool,
} from "./carpool.controller.js";

const router: Router = Router();

router.get("/", getAllCarpools);
router.get("/me", getUserCarpools);
router.post("/", createCarpool);
router.delete("/:id", deleteCarpool);

export default router;

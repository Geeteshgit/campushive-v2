import { Router } from "express";

import {
  getAllItems,
  getUserItems,
  createItem,
  deleteItem,
} from "./lost-found.controller.js";

const router: Router = Router();

router.get("/", getAllItems);
router.get("/me", getUserItems);
router.post("/", createItem);
router.delete("/:id", deleteItem);

export default router;

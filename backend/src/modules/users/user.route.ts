import { Router } from "express";

import {
  getUser,
  getSelectedUser,
  updateUser,
  deleteUser,
} from "./user.controller.js";

const router: Router = Router();

router.get("/", getUser);
router.get("/:id", getSelectedUser);
router.put("/", updateUser);
router.delete("/", deleteUser);

export default router;

import { Router } from "express";

import {
  getUser,
  getMyCarpools,
  updateUser,
  deleteUser,
} from "./user.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", getUser);
router.get("/carpools", getMyCarpools);
router.put("/", updateUser);
router.delete("/", deleteUser);

export default router;

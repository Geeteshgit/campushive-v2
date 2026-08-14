import { Router } from "express";
import { register, login, refresh, logout, me } from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router: Router = Router();
router.post("/test", (_req, res) => {
  return res.status(200).json({
    message: "Auth router works",
  });
});

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, me);

export default router;

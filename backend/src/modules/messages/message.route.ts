import { Router } from "express";

import {
  getPublicMessages,
  sendPublicMessage,
  getPrivateMessages,
  sendPrivateMessage,
  getUserConversations,
} from "./message.controller.js";

const router: Router = Router();

router.get("/public", getPublicMessages);

router.post("/public", sendPublicMessage);

router.get("/dm/:userId", getPrivateMessages);

router.post("/dm/:receiverId", sendPrivateMessage);

router.get("/conversations", getUserConversations);

export default router;

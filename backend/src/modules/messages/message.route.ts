import { Router } from "express";

import { authenticate } from "../../middleware/auth.js";
import {
  getConversationMessages,
  getPrivateMessages,
  getPublicMessages,
  getUserConversations,
  sendPrivateMessage,
  sendPublicMessage,
} from "./message.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/public", getPublicMessages);
router.post("/public", sendPublicMessage);
router.get("/dm/:userId", getPrivateMessages);
router.post("/dm/:receiverId", sendPrivateMessage);
router.get("/conversations", getUserConversations);
router.get("/conversations/:conversationId/messages", getConversationMessages);

export default router;

import { Router } from "express";

import { authenticate } from "../../middleware/auth.js";
import {
  createCarpool,
  decideCarpoolRequest,
  cancelCarpool,
  getCarpoolById,
  getCarpoolRequests,
  getCarpools,
  removeCarpoolMember,
  requestToJoinCarpool,
  updateCarpool,
} from "./carpool.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", getCarpools);
router.post("/", createCarpool);
router.get("/:id", getCarpoolById);
router.put("/:id", updateCarpool);
router.patch("/:id/cancel", cancelCarpool);
router.post("/:id/requests", requestToJoinCarpool);
router.get("/:id/requests", getCarpoolRequests);
router.patch("/:id/requests/:requestId", decideCarpoolRequest);
router.delete("/:id/members/:userId", removeCarpoolMember);

export default router;

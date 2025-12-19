import express from "express";

import {
  createMatch,
  endMatch,
  getAllMatches,
  getCurrentInning,
  getMatchById,
  startInning,
  startMatch,
} from "../../controllers/match.controller.js";
import { authenticate, authorize } from "../../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getAllMatches);
router.get("/:id", authenticate, getMatchById);
router.get("/:id/current-inning", authenticate, getCurrentInning);
router.post("/", authenticate, authorize("owner"), createMatch);
router.post("/:id/start", authenticate, authorize("owner", "scorer"), startMatch);
router.post("/:id/start-inning", authenticate, authorize("owner", "scorer"), startInning);
router.post("/:id/end", authenticate, authorize("owner", "scorer"), endMatch);

export default router;

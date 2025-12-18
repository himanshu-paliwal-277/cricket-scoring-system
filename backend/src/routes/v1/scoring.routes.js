import express from "express";

import {
  addBall,
  startSecondInning,
  swapStrike,
  undoLastBall,
  updateBatsmen,
  updateBowler,
} from "../../controllers/scoring.controller.js";
import { authenticate, authorize } from "../../middleware/auth.js";

const router = express.Router();

router.post("/ball", authenticate, authorize("scorer", "owner"), addBall);
router.post("/undo/:inningId", authenticate, authorize("scorer", "owner"), undoLastBall);
router.post("/swap-strike", authenticate, authorize("scorer", "owner"), swapStrike);
router.put("/batsmen", authenticate, authorize("scorer", "owner"), updateBatsmen);
router.put("/bowler", authenticate, authorize("scorer", "owner"), updateBowler);
router.post("/second-inning", authenticate, authorize("scorer", "owner"), startSecondInning);

export default router;

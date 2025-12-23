import express from "express";

import {
  getAvailableBatsmen,
  getMatchScorecard,
  getMostBoundaries,
  getMostRuns,
  getMostWickets,
  getPlayerStats} from "../../controllers/stats.controller.js";

const router = express.Router();

router.get("/players", getPlayerStats);
router.get("/most-runs", getMostRuns);
router.get("/most-wickets", getMostWickets);
router.get("/most-boundaries", getMostBoundaries);
router.get("/scorecard/:matchId", getMatchScorecard);
router.get("/available-batsmen/:inningId", getAvailableBatsmen);

export default router;

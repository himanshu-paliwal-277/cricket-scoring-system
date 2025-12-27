import express from "express";

import {
  getAvailableBatsmen,
  getMatchScorecard,
  getMostBoundaries,
  getMostRuns,
  getMostWickets,
  getMostFours,
  getMostSixes,
  getHighestScores,
  getMostFifties,
  getMostTwentyFives,
  getPlayerStats} from "../../controllers/stats.controller.js";

const router = express.Router();

router.get("/players", getPlayerStats);
router.get("/most-runs", getMostRuns);
router.get("/most-wickets", getMostWickets);
router.get("/most-boundaries", getMostBoundaries);
router.get("/most-fours", getMostFours);
router.get("/most-sixes", getMostSixes);
router.get("/highest-scores", getHighestScores);
router.get("/most-fifties", getMostFifties);
router.get("/most-twenty-fives", getMostTwentyFives);
router.get("/scorecard/:matchId", getMatchScorecard);
router.get("/available-batsmen/:inningId", getAvailableBatsmen);

export default router;

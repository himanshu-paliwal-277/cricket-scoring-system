import express from "express";

import {
  createPlayer,
  deletePlayer,
  getAllPlayers,
  getPlayerById,
  getPlayerStats,
  updatePlayer,
} from "../../controllers/player.controller.js";
import { authenticate, authorize } from "../../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getAllPlayers);
router.get("/:id", authenticate, getPlayerById);
router.get("/:id/stats", authenticate, getPlayerStats);
router.post("/", authenticate, authorize("owner", "scorer"), createPlayer);
router.put("/:id", authenticate, authorize("owner"), updatePlayer);
router.delete("/:id", authenticate, authorize("owner"), deletePlayer);

export default router;

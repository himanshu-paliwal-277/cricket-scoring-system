import express from "express";

import {
  createTeam,
  deleteTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
} from "../controllers/team.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getAllTeams);
router.get("/:id", authenticate, getTeamById);
router.post("/", authenticate, authorize("owner"), createTeam);
router.put("/:id", authenticate, authorize("owner"), updateTeam);
router.delete("/:id", authenticate, authorize("owner"), deleteTeam);

export default router;

import express from "express";

import authRouter from "./auth.routes.js";
import matchRouter from "./match.routes.js";
import playerRouter from "./player.routes.js";
import scoringRouter from "./scoring.routes.js";
import teamRouter from "./team.routes.js";

const router = express.Router();

router.use("/api/auth", authRouter);
router.use("/api/players", playerRouter);
router.use("/api/teams", teamRouter);
router.use("/api/matches", matchRouter);
router.use("/api/scoring", scoringRouter);

export default router;

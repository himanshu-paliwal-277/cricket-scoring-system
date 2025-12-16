import express from "express";

import authRouter from "./auth.routes.js";
import matchRouter from "./match.routes.js";
import playerRouter from "./player.routes.js";
import scoringRouter from "./scoring.routes.js";
import teamRouter from "./team.routes.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/players", playerRouter);
router.use("/teams", teamRouter);
router.use("/matches", matchRouter);
router.use("/scoring", scoringRouter);

export default router;

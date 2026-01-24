import express from "express";

import authRouter from "./auth.routes.js";
import matchRouter from "./match.routes.js";
import playerRouter from "./player.routes.js";
import scoringRouter from "./scoring.routes.js";
import statsRouter from "./stats.routes.js";
import teamRouter from "./team.routes.js";

const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is up and running",
  });
});

router.use("/auth", authRouter);
router.use("/players", playerRouter);
router.use("/teams", teamRouter);
router.use("/matches", matchRouter);
router.use("/scoring", scoringRouter);
router.use("/stats", statsRouter);

export default router;

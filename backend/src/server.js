import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import connectDB from "./config/db.js";
import { PORT } from "./config/serverConfig.js";
import authRouter from "./routes/auth.routes.js";
import matchRouter from "./routes/match.routes.js";
import playerRouter from "./routes/player.routes.js";
import scoringRouter from "./routes/scoring.routes.js";
import teamRouter from "./routes/team.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/players", playerRouter);
app.use("/api/teams", teamRouter);
app.use("/api/matches", matchRouter);
app.use("/api/scoring", scoringRouter);

app.get("/", (req, res) => {
  res.json({ message: "Cricket Scoring API is running" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

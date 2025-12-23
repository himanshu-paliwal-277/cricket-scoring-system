import mongoose from "mongoose";

const inningSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    battingTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    bowlingTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    inningNumber: {
      type: Number,
      required: true,
    },
    striker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
    nonStriker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
    currentBowler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
    totalRuns: {
      type: Number,
      default: 0,
    },
    totalWickets: {
      type: Number,
      default: 0,
    },
    currentOver: {
      type: Number,
      default: 0,
    },
    currentBall: {
      type: Number,
      default: 0,
    },
    extras: {
      wides: { type: Number, default: 0 },
      noBalls: { type: Number, default: 0 },
      byes: { type: Number, default: 0 },
      legByes: { type: Number, default: 0 },
    },
    battingStats: [
      {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
        runs: { type: Number, default: 0 },
        balls: { type: Number, default: 0 },
        fours: { type: Number, default: 0 },
        sixes: { type: Number, default: 0 },
        strikeRate: { type: Number, default: 0 },
        isOut: { type: Boolean, default: false },
        dismissalType: { type: String, enum: ["bowled", "caught", "lbw", "stumped", "runOut", "hitWicket", "none"], default: "none" },
        dismissedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        fielder: { type: mongoose.Schema.Types.ObjectId, ref: "Player" }
      }
    ],
    bowlingStats: [
      {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
        overs: { type: Number, default: 0 },
        balls: { type: Number, default: 0 },
        runsConceded: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        maidens: { type: Number, default: 0 },
        economy: { type: Number, default: 0 }
      }
    ],
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Inning", inningSchema);

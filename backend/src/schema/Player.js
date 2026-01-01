import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    battingStyle: {
      type: String,
      enum: ["right-hand", "left-hand"],
      default: "right-hand",
    },
    bowlingStyle: {
      type: String,
      enum: ["right-arm-fast", "left-arm-fast", "right-arm-spin", "left-arm-spin", "none"],
      default: "none",
    },
    totalRuns: {
      type: Number,
      default: 0,
    },
    totalWickets: {
      type: Number,
      default: 0,
    },
    matchesPlayed: {
      type: Number,
      default: 0,
    },
    highestScore: {
      type: Number,
      default: 0,
    },
    totalBallsFaced: {
      type: Number,
      default: 0,
    },
    totalBallsBowled: {
      type: Number,
      default: 0,
    },
    totalFours: {
      type: Number,
      default: 0,
    },
    totalSixes: {
      type: Number,
      default: 0,
    },
    total25s: {
      type: Number,
      default: 0,
    },
    total50s: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Player", playerSchema);

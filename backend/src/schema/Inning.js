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
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Inning", inningSchema);

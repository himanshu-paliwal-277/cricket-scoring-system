import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  teamA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true
  },
  teamB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true
  },
  overs: {
    type: Number,
    required: true,
    min: 1
  },
  tossWinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team"
  },
  tossDecision: {
    type: String,
    enum: ["bat", "bowl"]
  },
  currentInning: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ["not_started", "live", "completed"],
    default: "not_started"
  },
  scorerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team"
  },
  resultText: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model("Match", matchSchema);

import mongoose from "mongoose";

const ballSchema = new mongoose.Schema(
  {
    inningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inning",
      required: true,
    },
    overNumber: {
      type: Number,
      required: true,
    },
    ballNumber: {
      type: Number,
      required: true,
    },
    batsman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    bowler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    runs: {
      type: Number,
      default: 0,
    },
    ballType: {
      type: String,
      enum: ["normal", "wide", "noBall", "wicket", "bye", "legBye"],
      default: "normal",
    },
    wicketType: {
      type: String,
      enum: ["bowled", "caught", "lbw", "stumped", "runOut", "hitWicket", "none"],
      default: "none",
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Ball", ballSchema);

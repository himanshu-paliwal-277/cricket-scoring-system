import Ball from "../schema/Ball.js";
import Inning from "../schema/Inning.js";
import Match from "../schema/Match.js";

export const addBall = async (req, res) => {
  try {
    const { inningId, runs, ballType, wicketType } = req.body;

    const inning = await Inning.findById(inningId);
    if (!inning) {
      return res.status(404).json({ message: "Inning not found" });
    }

    if (inning.isCompleted) {
      return res.status(400).json({ message: "Inning is already completed" });
    }

    const match = await Match.findById(inning.matchId);

    // Create ball record
    const ball = await Ball.create({
      inningId,
      overNumber: inning.currentOver,
      ballNumber: inning.currentBall,
      batsman: inning.striker,
      bowler: inning.currentBowler,
      runs,
      ballType,
      wicketType: wicketType || "none",
    });

    // Update inning stats
    inning.totalRuns += runs;

    if (ballType === "wide" || ballType === "noBall") {
      if (ballType === "wide") inning.extras.wides += 1;
      if (ballType === "noBall") inning.extras.noBalls += 1;
    } else {
      inning.currentBall += 1;
    }

    // Handle wicket
    if (ballType === "wicket") {
      inning.totalWickets += 1;
    }

    // Swap striker for odd runs
    if (runs % 2 !== 0 && ballType !== "wicket") {
      [inning.striker, inning.nonStriker] = [inning.nonStriker, inning.striker];
    }

    // Check over completion
    if (inning.currentBall === 6) {
      inning.currentOver += 1;
      inning.currentBall = 0;
      [inning.striker, inning.nonStriker] = [inning.nonStriker, inning.striker];
    }

    // Check inning completion
    if (inning.currentOver >= match.overs || inning.totalWickets >= 10) {
      inning.isCompleted = true;

      if (match.currentInning === 1) {
        match.currentInning = 2;
      } else {
        match.status = "completed";
        // Determine winner
        const firstInning = await Inning.findOne({ matchId: match._id, inningNumber: 1 });
        if (inning.totalRuns > firstInning.totalRuns) {
          match.winner = inning.battingTeam;
        } else if (firstInning.totalRuns > inning.totalRuns) {
          match.winner = firstInning.battingTeam;
        }
      }
      await match.save();
    }

    await inning.save();

    const populatedInning = await Inning.findById(inning._id)
      .populate({
        path: "striker",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "nonStriker",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "currentBowler",
        populate: { path: "userId", select: "name email" }
      })
      .populate("battingTeam bowlingTeam");

    res.json({ inning: populatedInning });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const undoLastBall = async (req, res) => {
  try {
    const { inningId } = req.params;

    const lastBall = await Ball.findOne({ inningId, isValid: true }).sort({ createdAt: -1 });

    if (!lastBall) {
      return res.status(404).json({ message: "No ball to undo" });
    }

    const inning = await Inning.findById(inningId);

    // Reverse the stats
    inning.totalRuns -= lastBall.runs;

    if (lastBall.ballType === "wide") {
      inning.extras.wides -= 1;
    } else if (lastBall.ballType === "noBall") {
      inning.extras.noBalls -= 1;
    } else {
      inning.currentBall -= 1;
      if (inning.currentBall < 0) {
        inning.currentOver -= 1;
        inning.currentBall = 5;
      }
    }

    if (lastBall.ballType === "wicket") {
      inning.totalWickets -= 1;
    }

    lastBall.isValid = false;
    await lastBall.save();
    await inning.save();

    const populatedInning = await Inning.findById(inning._id)
      .populate({
        path: "striker",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "nonStriker",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "currentBowler",
        populate: { path: "userId", select: "name email" }
      })
      .populate("battingTeam bowlingTeam");

    res.json({ message: "Ball undone successfully", inning: populatedInning });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBatsmen = async (req, res) => {
  try {
    const { inningId, striker, nonStriker } = req.body;

    const inning = await Inning.findByIdAndUpdate(
      inningId,
      { striker, nonStriker },
      { new: true }
    )
      .populate({
        path: "striker",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "nonStriker",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "currentBowler",
        populate: { path: "userId", select: "name email" }
      })
      .populate("battingTeam bowlingTeam");

    res.json(inning);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBowler = async (req, res) => {
  try {
    const { inningId, bowler } = req.body;

    const inning = await Inning.findByIdAndUpdate(
      inningId,
      { currentBowler: bowler },
      { new: true }
    )
      .populate({
        path: "striker",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "nonStriker",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "currentBowler",
        populate: { path: "userId", select: "name email" }
      })
      .populate("battingTeam bowlingTeam");

    res.json(inning);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const startSecondInning = async (req, res) => {
  try {
    const { matchId, striker, nonStriker, bowler } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const firstInning = await Inning.findOne({ matchId, inningNumber: 1 });

    const battingTeam = firstInning.bowlingTeam;
    const bowlingTeam = firstInning.battingTeam;

    const secondInning = await Inning.create({
      matchId,
      battingTeam,
      bowlingTeam,
      inningNumber: 2,
      striker,
      nonStriker,
      currentBowler: bowler,
    });

    res.json(secondInning);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

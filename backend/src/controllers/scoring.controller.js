import Ball from "../schema/Ball.js";
import Inning from "../schema/Inning.js";
import Match from "../schema/Match.js";

export const addBall = async (req, res) => {
  try {
    const { inningId, runs, ballType, wicketType } = req.body;

    const inning = await Inning.findById(inningId)
      .populate('battingTeam bowlingTeam');
    if (!inning) {
      return res.status(404).json({ message: "Inning not found" });
    }

    if (inning.isCompleted) {
      return res.status(400).json({ message: "Inning is already completed" });
    }

    const match = await Match.findById(inning.matchId)
      .populate('teamA teamB');

    // Create ball record
    await Ball.create({
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

    // Handle extras
    if (ballType === "wide" || ballType === "noBall") {
      if (ballType === "wide") inning.extras.wides += 1;
      if (ballType === "noBall") inning.extras.noBalls += 1;
      // Extras don't count as a ball
    } else {
      // Regular ball, increment ball count
      inning.currentBall += 1;
    }

    // Handle wicket
    if (ballType === "wicket") {
      inning.totalWickets += 1;
      // Don't swap on wicket - new batsman comes to striker end
    } else {
      // Swap striker for odd runs (only on valid balls, not wickets)
      if (runs % 2 !== 0) {
        [inning.striker, inning.nonStriker] = [inning.nonStriker, inning.striker];
      }
    }

    // Check over completion (after incrementing ball count)
    if (inning.currentBall >= 6) {
      inning.currentOver += 1;
      inning.currentBall = 0;
      // Swap batsmen at end of over
      [inning.striker, inning.nonStriker] = [inning.nonStriker, inning.striker];
    }

    // Check inning completion
    if (inning.currentOver >= match.overs || inning.totalWickets >= 10) {
      inning.isCompleted = true;

      if (match.currentInning === 1) {
        // First innings complete - prepare for second innings
        match.currentInning = 2;
        await match.save();

        // Note: Second innings should be started manually with selected players
        // This ensures scorers select the opening batsmen and bowler for 2nd innings
      } else {
        // Second innings complete - end the match
        match.status = "completed";
        // Determine winner
        const firstInning = await Inning.findOne({ matchId: match._id, inningNumber: 1 });

        if (inning.totalRuns > firstInning.totalRuns) {
          match.winner = inning.battingTeam;
          const wicketsRemaining = 10 - inning.totalWickets;
          match.resultText = `${inning.battingTeam.name} won by ${wicketsRemaining} wickets`;
        } else if (firstInning.totalRuns > inning.totalRuns) {
          match.winner = firstInning.battingTeam;
          const runsDifference = firstInning.totalRuns - inning.totalRuns;
          match.resultText = `${firstInning.battingTeam.name} won by ${runsDifference} runs`;
        } else {
          match.resultText = "Match tied";
        }
        await match.save();
      }
    } else if (match.currentInning === 2) {
      // Check if chasing team has won before completing overs/wickets
      const firstInning = await Inning.findOne({ matchId: match._id, inningNumber: 1 });
      if (inning.totalRuns > firstInning.totalRuns) {
        inning.isCompleted = true;
        match.status = "completed";
        match.winner = inning.battingTeam;
        const wicketsRemaining = 10 - inning.totalWickets;
        const ballsRemaining = (match.overs * 6) - (inning.currentOver * 6 + inning.currentBall);
        match.resultText = `${inning.battingTeam.name} won by ${wicketsRemaining} wickets (${ballsRemaining} balls remaining)`;
        await match.save();
      }
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

export const swapStrike = async (req, res) => {
  try {
    const { inningId } = req.body;

    const inning = await Inning.findById(inningId);
    if (!inning) {
      return res.status(404).json({ message: "Inning not found" });
    }

    // Swap striker and non-striker
    [inning.striker, inning.nonStriker] = [inning.nonStriker, inning.striker];
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

    res.json(populatedInning);
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

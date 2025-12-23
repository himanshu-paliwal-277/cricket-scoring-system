import Ball from "../schema/Ball.js";
import Inning from "../schema/Inning.js";
import Match from "../schema/Match.js";

export const addBall = async (req, res) => {
  try {
    const { inningId, runs, ballType, wicketType, fielder } = req.body;

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
      fielder: fielder || null,
    });

    // Update inning stats
    inning.totalRuns += runs;

    // Update batting stats
    let batsmanStats = inning.battingStats.find(s => s.playerId.toString() === inning.striker.toString());
    if (!batsmanStats) {
      inning.battingStats.push({
        playerId: inning.striker,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false,
        dismissalType: "none"
      });
      batsmanStats = inning.battingStats[inning.battingStats.length - 1];
    }

    // Update bowling stats
    let bowlerStats = inning.bowlingStats.find(s => s.playerId.toString() === inning.currentBowler.toString());
    if (!bowlerStats) {
      inning.bowlingStats.push({
        playerId: inning.currentBowler,
        overs: 0,
        balls: 0,
        runsConceded: 0,
        wickets: 0,
        maidens: 0,
        economy: 0
      });
      bowlerStats = inning.bowlingStats[inning.bowlingStats.length - 1];
    }

    // Update runs
    if (ballType !== "bye" && ballType !== "legBye") {
      batsmanStats.runs += runs;
    }

    // Count boundaries
    if (runs === 4 && ballType === "normal") batsmanStats.fours += 1;
    if (runs === 6 && ballType === "normal") batsmanStats.sixes += 1;

    // Handle extras
    if (ballType === "wide" || ballType === "noBall") {
      if (ballType === "wide") inning.extras.wides += 1;
      if (ballType === "noBall") inning.extras.noBalls += 1;
      bowlerStats.runsConceded += runs;
    } else if (ballType === "bye") {
      inning.extras.byes += runs;
      batsmanStats.balls += 1;
      bowlerStats.balls += 1;
      inning.currentBall += 1;
    } else if (ballType === "legBye") {
      inning.extras.legByes += runs;
      batsmanStats.balls += 1;
      bowlerStats.balls += 1;
      inning.currentBall += 1;
    } else {
      batsmanStats.balls += 1;
      bowlerStats.balls += 1;
      bowlerStats.runsConceded += runs;
      inning.currentBall += 1;
    }

    // Calculate strike rate
    if (batsmanStats.balls > 0) {
      batsmanStats.strikeRate = parseFloat(((batsmanStats.runs / batsmanStats.balls) * 100).toFixed(2));
    }

    // Calculate economy
    if (bowlerStats.balls > 0) {
      bowlerStats.overs = parseFloat((bowlerStats.balls / 6).toFixed(1));
      bowlerStats.economy = parseFloat(((bowlerStats.runsConceded / bowlerStats.balls) * 6).toFixed(2));
    }

    // Handle wicket
    if (ballType === "wicket") {
      inning.totalWickets += 1;
      batsmanStats.isOut = true;
      batsmanStats.dismissalType = wicketType;

      if (wicketType !== "runOut") {
        batsmanStats.dismissedBy = inning.currentBowler;
        bowlerStats.wickets += 1;
      }

      if (fielder && (wicketType === "caught" || wicketType === "stumped")) {
        batsmanStats.fielder = fielder;
      }
    } else {
      // Swap striker for odd runs (only on valid balls, not wickets)
      if (runs % 2 !== 0 && ballType !== "wide" && ballType !== "noBall") {
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

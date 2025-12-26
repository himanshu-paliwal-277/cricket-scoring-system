import Ball from "../schema/Ball.js";
import Inning from "../schema/Inning.js";
import Match from "../schema/Match.js";

export const addBall = async (req, res) => {
  try {
    const { inningId, runs, ballType, wicketType, fielder, newBatsmanId } = req.body;

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

    // Handle extras and update stats
    if (ballType === "wide") {
      inning.extras.wides += 1;
      bowlerStats.runsConceded += runs;
      // Wide balls don't count as balls faced by batsman
      // Runs from wides don't go to batsman
    } else if (ballType === "noBall") {
      inning.extras.noBalls += 1;
      bowlerStats.runsConceded += runs;
      // No ball doesn't count as ball faced
      // But runs scored by batsman on no ball go to batsman
      if (runs > 0) {
        batsmanStats.runs += runs;
      }
    } else if (ballType === "bye") {
      inning.extras.byes += runs;
      batsmanStats.balls += 1;
      bowlerStats.balls += 1;
      inning.currentBall += 1;
      // Byes don't go to batsman runs
    } else if (ballType === "legBye") {
      inning.extras.legByes += runs;
      batsmanStats.balls += 1;
      bowlerStats.balls += 1;
      inning.currentBall += 1;
      // Leg byes don't go to batsman runs
    } else {
      // Normal ball or wicket
      batsmanStats.runs += runs;
      batsmanStats.balls += 1;
      bowlerStats.balls += 1;
      bowlerStats.runsConceded += runs;
      inning.currentBall += 1;
    }

    // Count boundaries (only on normal balls)
    if (runs === 4 && ballType === "normal") batsmanStats.fours += 1;
    if (runs === 6 && ballType === "normal") batsmanStats.sixes += 1;

    // Calculate strike rate
    if (batsmanStats.balls > 0) {
      batsmanStats.strikeRate = parseFloat(((batsmanStats.runs / batsmanStats.balls) * 100).toFixed(2));
    }

    // Calculate economy and overs
    if (bowlerStats.balls > 0) {
      const completedOvers = Math.floor(bowlerStats.balls / 6);
      const remainingBalls = bowlerStats.balls % 6;
      bowlerStats.overs = parseFloat(`${completedOvers}.${remainingBalls}`);
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

      // Handle new batsman coming in after wicket
      if (newBatsmanId) {
        // Determine which batsman got out
        const outBatsmanId = batsmanStats.playerId.toString();

        // Replace the out batsman with new batsman
        if (inning.striker.toString() === outBatsmanId) {
          inning.striker = newBatsmanId;
        } else if (inning.nonStriker.toString() === outBatsmanId) {
          inning.nonStriker = newBatsmanId;
        }

        // Add new batsman to batting stats if not already present
        const newBatsmanExists = inning.battingStats.find(
          s => s.playerId.toString() === newBatsmanId.toString()
        );

        if (!newBatsmanExists) {
          inning.battingStats.push({
            playerId: newBatsmanId,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false,
            dismissalType: "none"
          });
        }
      }

      // For run out, rotate strike based on runs scored (if odd)
      if (wicketType === "runOut" && runs % 2 !== 0) {
        [inning.striker, inning.nonStriker] = [inning.nonStriker, inning.striker];
      }
    } else {
      // Swap striker for odd runs (not on wides or wickets)
      // On no-balls, strike DOES rotate if batsman scores odd runs
      if (runs % 2 !== 0 && ballType !== "wide") {
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
    // All out when all players are dismissed (last man can bat from both ends)
    const isBattingTeamA = match.teamA._id.toString() === inning.battingTeam.toString();
    const teamSize = isBattingTeamA
      ? (match.teamASnapshot?.players?.length || 11)
      : (match.teamBSnapshot?.players?.length || 11);
    const maxWickets = teamSize; // All players can get out

    if (inning.currentOver >= match.overs || inning.totalWickets >= maxWickets) {
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
          match.winner = inning.battingTeam._id;
          const wicketsRemaining = teamSize - inning.totalWickets;
          const winningTeamName =
            inning.battingTeam._id.toString() === match.teamA._id.toString()
              ? match.teamASnapshot.name
              : match.teamBSnapshot.name;
          match.resultText = `${winningTeamName} won by ${wicketsRemaining} wickets`;
        } else if (firstInning.totalRuns > inning.totalRuns) {
          match.winner = firstInning.battingTeam._id;
          const runsDifference = firstInning.totalRuns - inning.totalRuns;
          const winningTeamName =
            firstInning.battingTeam._id.toString() === match.teamA._id.toString()
              ? match.teamASnapshot.name
              : match.teamBSnapshot.name;
          match.resultText = `${winningTeamName} won by ${runsDifference} runs`;
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
        match.winner = inning.battingTeam._id;
        const wicketsRemaining = teamSize - inning.totalWickets;
        const ballsRemaining = (match.overs * 6) - (inning.currentOver * 6 + inning.currentBall);
        const winningTeamName =
          inning.battingTeam._id.toString() === match.teamA._id.toString()
            ? match.teamASnapshot.name
            : match.teamBSnapshot.name;
        match.resultText = `${winningTeamName} won by ${wicketsRemaining} wickets (${ballsRemaining} balls remaining)`;
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
      .populate({
        path: "battingStats.playerId",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "battingStats.dismissedBy",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "battingStats.fielder",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "bowlingStats.playerId",
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
    const { inningId, striker, nonStriker, newBatsmanId } = req.body;

    const inning = await Inning.findById(inningId);
    if (!inning) {
      return res.status(404).json({ message: "Inning not found" });
    }

    // If newBatsmanId is provided (wicket scenario), determine who to replace
    if (newBatsmanId) {
      // Find who got out - check the last batsman who is marked as out
      const outBatsman = inning.battingStats.find(
        (stat) => stat.isOut &&
        (stat.playerId.toString() === inning.striker.toString() ||
         stat.playerId.toString() === inning.nonStriker.toString())
      );

      if (outBatsman) {
        // Replace the out batsman with new batsman
        if (outBatsman.playerId.toString() === inning.striker.toString()) {
          inning.striker = newBatsmanId;
        } else {
          inning.nonStriker = newBatsmanId;
        }
      } else {
        // Fallback: replace striker
        inning.striker = newBatsmanId;
      }

      // Add new batsman to batting stats if not already present
      const newBatsmanStats = inning.battingStats.find(
        s => s.playerId.toString() === newBatsmanId.toString()
      );

      if (!newBatsmanStats) {
        inning.battingStats.push({
          playerId: newBatsmanId,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
          isOut: false,
          dismissalType: "none"
        });
      }
    } else {
      // Manual batsman change - update provided values
      if (striker) inning.striker = striker;
      if (nonStriker) inning.nonStriker = nonStriker;
    }

    await inning.save();

    const populatedInning = await Inning.findById(inningId)
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
      .populate({
        path: "battingStats.playerId",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "battingStats.dismissedBy",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "battingStats.fielder",
        populate: { path: "userId", select: "name email" }
      })
      .populate({
        path: "bowlingStats.playerId",
        populate: { path: "userId", select: "name email" }
      })
      .populate("battingTeam bowlingTeam");

    res.json(populatedInning);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBowler = async (req, res) => {
  try {
    const { inningId, bowler } = req.body;

    const inning = await Inning.findById(inningId);
    if (!inning) {
      return res.status(404).json({ message: "Inning not found" });
    }

    // Update current bowler
    inning.currentBowler = bowler;

    // Add bowler to bowling stats if not already present
    const bowlerStats = inning.bowlingStats.find(
      s => s.playerId.toString() === bowler.toString()
    );

    if (!bowlerStats) {
      inning.bowlingStats.push({
        playerId: bowler,
        overs: 0,
        balls: 0,
        runsConceded: 0,
        wickets: 0,
        maidens: 0,
        economy: 0
      });
    }

    await inning.save();

    const populatedInning = await Inning.findById(inningId)
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
      .populate({
        path: "bowlingStats.playerId",
        populate: { path: "userId", select: "name email" }
      })
      .populate("battingTeam bowlingTeam");

    res.json(populatedInning);
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

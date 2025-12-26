import Ball from "../schema/Ball.js";
import Inning from "../schema/Inning.js";
import Match from "../schema/Match.js";
import Player from "../schema/Player.js";
import Team from "../schema/Team.js";

export const createMatch = async (req, res) => {
  try {
    const { teamA, teamB, overs, scorerId } = req.body;

    const teamAData = await Team.findById(teamA).populate("players").populate("captain");
    const teamBData = await Team.findById(teamB).populate("players").populate("captain");

    const match = await Match.create({
      teamA,
      teamB,
      teamASnapshot: {
        name: teamAData.name,
        players: teamAData.players.map((p) => p._id),
        captain: teamAData.captain?._id,
      },
      teamBSnapshot: {
        name: teamBData.name,
        players: teamBData.players.map((p) => p._id),
        captain: teamBData.captain?._id,
      },
      overs,
      scorerId,
      createdBy: req.user._id,
    });

    const populatedMatch = await Match.findById(match._id)
      .populate("teamA")
      .populate("teamB")
      .populate("scorerId", "name email")
      .populate("createdBy", "name email")
      .populate({
        path: "teamASnapshot.captain",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "teamBSnapshot.captain",
        populate: { path: "userId", select: "name email" },
      });

    res.status(201).json(populatedMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const startMatch = async (req, res) => {
  try {
    const { tossWinner, tossDecision, striker, nonStriker, bowler } = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.status !== "not_started") {
      return res.status(400).json({ message: "Match already started" });
    }

    // Lock teams
    await Team.findByIdAndUpdate(match.teamA, { isLocked: true });
    await Team.findByIdAndUpdate(match.teamB, { isLocked: true });

    // Determine batting and bowling teams
    const battingTeam =
      tossDecision === "bat"
        ? tossWinner
        : tossWinner.toString() === match.teamA.toString()
          ? match.teamB
          : match.teamA;
    const bowlingTeam =
      battingTeam.toString() === match.teamA.toString() ? match.teamB : match.teamA;

    // Create first inning
    const inning = await Inning.create({
      matchId: match._id,
      battingTeam,
      bowlingTeam,
      inningNumber: 1,
      striker,
      nonStriker,
      currentBowler: bowler,
    });

    // match.status = "live";
    // match.tossWinner = tossWinner;
    // match.tossDecision = tossDecision;
    // await match.save();
    match.status = "live";
    match.currentInning = 1; // ✅ ADD THIS LINE
    match.tossWinner = tossWinner;
    match.tossDecision = tossDecision;
    await match.save();

    const populatedMatch = await Match.findById(match._id).populate("teamA").populate("teamB");

    res.json({ match: populatedMatch, inning });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const startInning = async (req, res) => {
  try {
    const { striker, nonStriker, bowler } = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.status !== "live") {
      return res.status(400).json({ message: "Match is not live" });
    }

    // ❌ REMOVE THIS - It's blocking second inning start
    // if (match.currentInning !== 1) {
    //   return res.status(400).json({
    //     message: "Second inning can only start after first inning",
    //   });
    // }

    // ✅ ADD THIS - Check if we're trying to start second inning
    // if (match.currentInning !== 1) {
    //   return res.status(400).json({
    //     message: "Cannot start inning - invalid state",
    //   });
    // }

    const existingInning = await Inning.findOne({
      matchId: match._id,
      inningNumber: 2,
    });

    if (existingInning) {
      return res.status(400).json({
        message: "Second inning already started",
      });
    }

    const firstInning = await Inning.findOne({
      matchId: match._id,
      inningNumber: 1,
    });

    if (!firstInning) {
      return res.status(400).json({
        message: "First inning not found",
      });
    }

    // ✅ Mark first inning as completed
    firstInning.isCompleted = true;
    await firstInning.save();

    // ✅ Update match to second inning
    match.currentInning = 2;
    await match.save();

    // ✅ Create second inning
    const inning = await Inning.create({
      matchId: match._id,
      battingTeam: firstInning.bowlingTeam,
      bowlingTeam: firstInning.battingTeam,
      inningNumber: 2,
      striker,
      nonStriker,
      currentBowler: bowler,
      isCompleted: false,
    });

    const populatedMatch = await Match.findById(match._id).populate("teamA").populate("teamB");

    res.json({ match: populatedMatch, inning });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate("teamA")
      .populate("teamB")
      .populate("winner")
      .sort({ createdAt: -1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("teamA")
      .populate("teamB")
      .populate("tossWinner")
      .populate("winner")
      .populate("scorerId", "name email")
      .populate({
        path: "playerOfTheMatch",
        populate: { path: "userId", select: "name email" },
      });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const innings = await Inning.find({ matchId: match._id })
      .populate("striker nonStriker currentBowler")
      .populate("battingTeam bowlingTeam");

    res.json({ match, innings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCurrentInning = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    console.log("Match Current Inning:", match.currentInning);

    // If currentInning is 2 but no second inning exists, return null to indicate second inning needs to be started
    if (match.currentInning === 2) {
      const existingSecondInning = await Inning.findOne({
        matchId: match._id,
        inningNumber: 2,
      });
      if (!existingSecondInning) {
        return res.json({ inning: null, balls: [] });
      }
    }

    const inning = await Inning.findOne({
      matchId: match._id,
      inningNumber: match.currentInning,
      isCompleted: false,
    })
      .populate({
        path: "striker",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "nonStriker",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "currentBowler",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "battingStats.playerId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "battingStats.dismissedBy",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "battingStats.fielder",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "bowlingStats.playerId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("battingTeam bowlingTeam");

    console.log("Current Inning Found:", inning);

    if (!inning) {
      return res.status(404).json({ message: "No active inning found" });
    }

    const balls = await Ball.find({ inningId: inning._id })
      .populate("batsman bowler")
      .sort({ createdAt: 1 });

    res.json({ inning, balls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const endMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate("teamA teamB");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.status === "completed") {
      return res.status(400).json({ message: "Match is already completed" });
    }

    // Get all innings for this match
    const innings = await Inning.find({ matchId: match._id })
      .populate("battingTeam")
      .sort({ inningNumber: 1 });

    if (innings.length === 0) {
      return res.status(400).json({ message: "Cannot end match - no innings played" });
    }

    // Mark all innings as completed
    await Inning.updateMany({ matchId: match._id, isCompleted: false }, { isCompleted: true });

    // Determine winner based on available innings
    match.status = "completed";

    if (innings.length === 1) {
      // Only first innings completed - team batting first wins by walkover
      match.winner = innings[0].battingTeam._id;
      const winningTeamName =
        innings[0].battingTeam._id.toString() === match.teamA.toString()
          ? match.teamASnapshot.name
          : match.teamBSnapshot.name;
      match.resultText = `${winningTeamName} won (opponent did not bat)`;
    } else if (innings.length === 2) {
      const firstInning = innings[0];
      const secondInning = innings[1];

      if (secondInning.totalRuns > firstInning.totalRuns) {
        match.winner = secondInning.battingTeam._id;
        const wicketsRemaining = 10 - secondInning.totalWickets;
        const winningTeamName =
          secondInning.battingTeam._id.toString() === match.teamA.toString()
            ? match.teamASnapshot.name
            : match.teamBSnapshot.name;
        match.resultText = `${winningTeamName} won by ${wicketsRemaining} wickets`;
      } else if (firstInning.totalRuns > secondInning.totalRuns) {
        match.winner = firstInning.battingTeam._id;
        const runsDifference = firstInning.totalRuns - secondInning.totalRuns;
        const winningTeamName =
          firstInning.battingTeam._id.toString() === match.teamA.toString()
            ? match.teamASnapshot.name
            : match.teamBSnapshot.name;
        match.resultText = `${winningTeamName} won by ${runsDifference} runs`;
      } else {
        match.resultText = "Match tied";
      }
    }

    // Calculate Player of the Match
    if (match.winner && innings.length === 2) {
      const winnerTeamId = match.winner.toString();
      let maxPoints = 0;
      let playerOfTheMatch = null;

      for (const inning of innings) {
        for (const stat of inning.battingStats) {
          const isBattingForWinner = inning.battingTeam.toString() === winnerTeamId;
          if (isBattingForWinner) {
            const points = stat.runs + stat.fours * 1 + stat.sixes * 2;
            if (points > maxPoints) {
              maxPoints = points;
              playerOfTheMatch = stat.playerId;
            }
          }
        }

        for (const stat of inning.bowlingStats) {
          const isBowlingForWinner = inning.bowlingTeam.toString() === winnerTeamId;
          if (isBowlingForWinner) {
            const points = stat.wickets * 25 + stat.maidens * 10;
            if (points > maxPoints) {
              maxPoints = points;
              playerOfTheMatch = stat.playerId;
            }
          }
        }
      }

      match.playerOfTheMatch = playerOfTheMatch;
    }

    await match.save();

    // Update player career stats from innings
    const playersUpdated = new Set();

    for (const inning of innings) {
      // Update batting stats
      for (const stat of inning.battingStats) {
        const playerId = stat.playerId.toString();

        await Player.findByIdAndUpdate(playerId, {
          $inc: {
            totalRuns: stat.runs,
            totalBallsFaced: stat.balls,
            totalFours: stat.fours,
            totalSixes: stat.sixes,
          },
          $max: { highestScore: stat.runs },
        });

        playersUpdated.add(playerId);
      }

      // Update bowling stats
      for (const stat of inning.bowlingStats) {
        const playerId = stat.playerId.toString();

        await Player.findByIdAndUpdate(playerId, {
          $inc: {
            totalWickets: stat.wickets,
            totalBallsBowled: stat.balls,
          },
        });

        playersUpdated.add(playerId);
      }
    }

    // Increment matchesPlayed for all players who participated
    for (const playerId of playersUpdated) {
      await Player.findByIdAndUpdate(playerId, {
        $inc: { matchesPlayed: 1 },
      });
    }

    const populatedMatch = await Match.findById(match._id).populate(
      "teamA teamB winner playerOfTheMatch"
    );

    res.json({
      message: "Match ended successfully",
      match: populatedMatch,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Ball from "../schema/Ball.js";
import Inning from "../schema/Inning.js";
import Player from "../schema/Player.js";

export const getPlayerStats = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("userId", "name email photo")
      .sort({ totalRuns: -1 });

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMostRuns = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("userId", "name email photo")
      .sort({ totalRuns: -1 })
      .limit(10);

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMostWickets = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("userId", "name email photo")
      .sort({ totalWickets: -1 })
      .limit(10);

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMostBoundaries = async (req, res) => {
  try {
    const players = await Player.find().populate("userId", "name email photo");

    // Calculate total boundaries and sort by total
    const playersWithBoundaries = players
      .map((p) => ({
        ...p.toObject(),
        totalBoundaries: (p.totalFours || 0) + (p.totalSixes || 0),
      }))
      .sort((a, b) => b.totalBoundaries - a.totalBoundaries)
      .slice(0, 10);

    res.json(playersWithBoundaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMostFours = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("userId", "name email photo")
      .sort({ totalFours: -1 })
      .limit(10);

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMostSixes = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("userId", "name email photo")
      .sort({ totalSixes: -1 })
      .limit(10);

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHighestScores = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("userId", "name email photo")
      .sort({ highestScore: -1 })
      .limit(10);

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMostFifties = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("userId", "name email photo")
      .sort({ total50s: -1 })
      .limit(10);

    // Map to include fifties field for frontend compatibility
    const playersWithFifties = players.map((p) => ({
      ...p.toObject(),
      fifties: p.total50s,
    }));

    res.json(playersWithFifties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMostTwentyFives = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("userId", "name email photo")
      .sort({ total25s: -1 })
      .limit(10);

    // Map to include twentyFives field for frontend compatibility
    const playersWithTwentyFives = players.map((p) => ({
      ...p.toObject(),
      twentyFives: p.total25s,
    }));

    res.json(playersWithTwentyFives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMostCatches = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("userId", "name email photo")
      .sort({ totalCatches: -1 })
      .limit(10);

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMostOnes = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("userId", "name email photo")
      .sort({ totalOnes: -1 })
      .limit(10);

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMatchScorecard = async (req, res) => {
  try {
    const { matchId } = req.params;

    const innings = await Inning.find({ matchId })
      .populate({
        path: "battingTeam",
        populate: {
          path: "players",
          populate: { path: "userId", select: "name email" },
        },
      })
      .populate({
        path: "bowlingTeam",
        populate: {
          path: "players",
          populate: { path: "userId", select: "name email" },
        },
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
      .sort({ inningNumber: 1 });

    // Fetch balls for each inning
    const inningsWithBalls = await Promise.all(
      innings.map(async (inning) => {
        const balls = await Ball.find({ inningId: inning._id })
          .populate({
            path: "batsman",
            populate: { path: "userId", select: "name email" },
          })
          .populate({
            path: "bowler",
            populate: { path: "userId", select: "name email" },
          })
          .populate({
            path: "fielder",
            populate: { path: "userId", select: "name email" },
          })
          .sort({ createdAt: 1 });
        return {
          ...inning.toObject(),
          balls,
        };
      })
    );

    res.json(inningsWithBalls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAvailableBatsmen = async (req, res) => {
  try {
    const { inningId } = req.params;

    const inning = await Inning.findById(inningId).populate("battingTeam");
    if (!inning) {
      return res.status(404).json({ message: "Inning not found" });
    }

    // Get IDs of players who are out
    const outPlayerIds = inning.battingStats
      .filter((s) => s.isOut)
      .map((s) => s.playerId.toString());

    // Get IDs of current batsmen (striker and non-striker)
    const currentBatsmenIds = [inning.striker?.toString(), inning.nonStriker?.toString()].filter(
      Boolean
    );

    const battingTeam = await inning.battingTeam.populate({
      path: "players",
      populate: { path: "userId", select: "name email" },
    });

    const totalPlayers = battingTeam.players.length;
    const wicketsFallen = inning.totalWickets || 0;
    const notOutPlayers = battingTeam.players.filter(
      (p) => !outPlayerIds.includes(p._id.toString())
    );
    const notOutCount = notOutPlayers.length;

    let availableBatsmen;

    // Final wicket scenario: when wickets = totalPlayers - 1 (e.g., 4 out of 5)
    // This is the last wicket, no new batsman needed - return empty array
    if (wicketsFallen >= totalPlayers - 1) {
      availableBatsmen = [];
    }
    // Last man standing scenario: if only 2 players are not out
    // When 2 players remain and one gets out, the last player should be available
    else if (notOutCount === 2) {
      // Show both not-out players (they're currently batting, but one is about to get out)
      availableBatsmen = notOutPlayers;
    }
    // Single player remaining - show them so they can bat from both ends
    else if (notOutCount === 1) {
      availableBatsmen = notOutPlayers;
    } else {
      // Normal scenario: Filter out dismissed players AND current batsmen
      availableBatsmen = battingTeam.players.filter(
        (p) =>
          !outPlayerIds.includes(p._id.toString()) && !currentBatsmenIds.includes(p._id.toString())
      );
    }

    res.json(availableBatsmen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

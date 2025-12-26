import Ball from "../schema/Ball.js";
import Inning from "../schema/Inning.js";
import Player from "../schema/Player.js";

export const getPlayerStats = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("userId", "name email")
      .sort({ totalRuns: -1 });

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMostRuns = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("userId", "name email")
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
      .populate("userId", "name email")
      .sort({ totalWickets: -1 })
      .limit(10);

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMostBoundaries = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("userId", "name email")
      .sort({ totalFours: -1, totalSixes: -1 })
      .limit(10);

    res.json(players.map(p => ({
      ...p.toObject(),
      totalBoundaries: p.totalFours + p.totalSixes
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMatchScorecard = async (req, res) => {
  try {
    const { matchId } = req.params;

    const innings = await Inning.find({ matchId })
      .populate("battingTeam bowlingTeam")
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
      .sort({ inningNumber: 1 });

    // Fetch balls for each inning
    const inningsWithBalls = await Promise.all(
      innings.map(async (inning) => {
        const balls = await Ball.find({ inningId: inning._id })
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
      .filter(s => s.isOut)
      .map(s => s.playerId.toString());

    // Get IDs of current batsmen (striker and non-striker)
    const currentBatsmenIds = [
      inning.striker?.toString(),
      inning.nonStriker?.toString()
    ].filter(Boolean);

    const battingTeam = await inning.battingTeam.populate({
      path: "players",
      populate: { path: "userId", select: "name email" }
    });

    const totalPlayers = battingTeam.players.length;
    const wicketsFallen = inning.totalWickets || 0;
    const notOutPlayers = battingTeam.players.filter(
      p => !outPlayerIds.includes(p._id.toString())
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
    }
    else {
      // Normal scenario: Filter out dismissed players AND current batsmen
      availableBatsmen = battingTeam.players.filter(
        p => !outPlayerIds.includes(p._id.toString()) && !currentBatsmenIds.includes(p._id.toString())
      );
    }

    res.json(availableBatsmen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

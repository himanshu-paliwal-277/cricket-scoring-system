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

    res.json(innings);
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

    const outPlayerIds = inning.battingStats
      .filter(s => s.isOut)
      .map(s => s.playerId.toString());

    const battingTeam = await inning.battingTeam.populate({
      path: "players",
      populate: { path: "userId", select: "name email" }
    });

    const availableBatsmen = battingTeam.players.filter(
      p => !outPlayerIds.includes(p._id.toString())
    );

    res.json(availableBatsmen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

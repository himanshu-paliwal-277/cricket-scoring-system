import Player from "../schema/Player.js";
import User from "../schema/User.js";

export const getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find().populate("userId", "name email");
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate("userId", "name email");
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPlayer = async (req, res) => {
  try {
    const { userId, battingStyle, bowlingStyle } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingPlayer = await Player.findOne({ userId });
    if (existingPlayer) {
      return res.status(400).json({ message: "Player profile already exists" });
    }

    const player = await Player.create({ userId, battingStyle, bowlingStyle });
    const populatedPlayer = await Player.findById(player._id).populate("userId", "name email");

    res.status(201).json(populatedPlayer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePlayer = async (req, res) => {
  try {
    const { battingStyle, bowlingStyle } = req.body;

    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { battingStyle, bowlingStyle },
      { new: true }
    ).populate("userId", "name email");

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlayerStats = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate("userId", "name email");
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const stats = {
      name: player.userId.name,
      totalRuns: player.totalRuns,
      totalWickets: player.totalWickets,
      matchesPlayed: player.matchesPlayed,
      highestScore: player.highestScore,
      battingAverage:
        player.matchesPlayed > 0 ? (player.totalRuns / player.matchesPlayed).toFixed(2) : 0,
      strikeRate:
        player.totalBallsFaced > 0
          ? ((player.totalRuns / player.totalBallsFaced) * 100).toFixed(2)
          : 0,
      economy:
        player.totalBallsBowled > 0
          ? ((player.totalWickets / player.totalBallsBowled) * 6).toFixed(2)
          : 0,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

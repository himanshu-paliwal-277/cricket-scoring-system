import bcrypt from "bcryptjs";

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
    const { userId, name, email, password, battingStyle, bowlingStyle } = req.body;

    // If userId is provided, use the old flow
    if (userId) {
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

      return res.status(201).json(populatedPlayer);
    }

    // New flow: Create user and player together (like signup)
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with player role
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "player",
    });

    // Create player profile
    const player = await Player.create({
      userId: user._id,
      battingStyle,
      bowlingStyle,
    });

    const populatedPlayer = await Player.findById(player._id).populate("userId", "name email");

    res.status(201).json(populatedPlayer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePlayer = async (req, res) => {
  try {
    const { battingStyle, bowlingStyle } = req.body;

    const player = await Player.findOneAndUpdate(
      { userId: req.params.id },
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
    const player = await Player.findOne({ userId: req.params.id }).populate("userId", "name email");
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

export const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findOneAndDelete({ userId: req.params.id });
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.json({ message: "Player deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const togglePlayerActive = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    player.isActive = !player.isActive;
    await player.save();

    const populatedPlayer = await Player.findById(player._id).populate("userId", "name email");
    res.json(populatedPlayer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

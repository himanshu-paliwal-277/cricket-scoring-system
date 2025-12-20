import Match from "../schema/Match.js";
import Team from "../schema/Team.js";

export const createTeam = async (req, res) => {
  try {
    const { name, players } = req.body;

    if (!players || players.length < 2) {
      return res.status(400).json({ message: "Team must have at least 2 players" });
    }

    const team = await Team.create({
      name,
      players,
      createdBy: req.user._id,
    });

    const populatedTeam = await Team.findById(team._id)
      .populate("players")
      .populate("createdBy", "name email");

    res.status(201).json(populatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Initialize default teams if they don't exist
export const initializeTeams = async (req, res) => {
  try {
    const existingTeams = await Team.find();

    if (existingTeams.length === 0) {
      await Team.create({
        name: "Team 1",
        teamType: "team1",
        players: [],
        createdBy: req.user._id,
      });

      await Team.create({
        name: "Team 2",
        teamType: "team2",
        players: [],
        createdBy: req.user._id,
      });
    }

    const populatedTeams = await Team.find()
      .populate({
        path: "players",
        populate: { path: "userId", select: "name email" },
      })
      .populate("createdBy", "name email")
      .sort({ teamType: 1 });

    res.json(populatedTeams);
    // res.status(200).json({ message: "Team initialization endpoint is currently disabled." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate({
        path: "players",
        populate: { path: "userId", select: "name email" },
      })
      .populate("createdBy", "name email")
      .sort({ teamType: 1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("players")
      .populate("createdBy", "name email");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if team is in any live match
    const liveMatch = await Match.findOne({
      $or: [{ teamA: team._id }, { teamB: team._id }],
      status: "live",
    });

    if (liveMatch) {
      return res.status(400).json({
        message: "Team is in a live match and cannot be edited",
      });
    }

    if (!liveMatch && team.isLocked) {
      team.isLocked = false;
      await team.save();
    }

    if (team.isLocked) {
      return res.status(400).json({ message: "Team is locked, cannot edit" });
    }

    const { name, players } = req.body;

    // Get the other team to check for player conflicts
    const otherTeamType = team.teamType === "team1" ? "team2" : "team1";
    const otherTeam = await Team.findOne({ teamType: otherTeamType });

    if (players) {
      // Check if any selected players are already in the other team
      const conflictingPlayers = players.filter((playerId) =>
        otherTeam.players.some((p) => p.toString() === playerId.toString())
      );

      if (conflictingPlayers.length > 0) {
        return res.status(400).json({
          message: "Some selected players are already in the other team",
        });
      }
    }

    team.name = name || team.name;
    team.players = players !== undefined ? players : team.players;

    await team.save();
    const updatedTeam = await Team.findById(team._id)
      .populate({
        path: "players",
        populate: { path: "userId", select: "name email" },
      })
      .populate("createdBy", "name email");

    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.isLocked) {
      return res.status(400).json({ message: "Team is locked, cannot delete" });
    }

    await team.deleteOne();
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

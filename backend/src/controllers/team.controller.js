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

export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate("players").populate("createdBy", "name email");
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

    if (team.isLocked) {
      return res.status(400).json({ message: "Team is locked, cannot edit" });
    }

    const { name, players } = req.body;

    if (players && players.length < 2) {
      return res.status(400).json({ message: "Team must have at least 2 players" });
    }

    team.name = name || team.name;
    team.players = players || team.players;

    await team.save();
    const updatedTeam = await Team.findById(team._id)
      .populate("players")
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

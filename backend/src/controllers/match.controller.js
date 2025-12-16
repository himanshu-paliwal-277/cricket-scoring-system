import Ball from "../schema/Ball.js";
import Inning from "../schema/Inning.js";
import Match from "../schema/Match.js";
import Team from "../schema/Team.js";

export const createMatch = async (req, res) => {
  try {
    const { teamA, teamB, overs, scorerId } = req.body;

    const match = await Match.create({
      teamA,
      teamB,
      overs,
      scorerId,
      createdBy: req.user._id,
    });

    const populatedMatch = await Match.findById(match._id)
      .populate("teamA")
      .populate("teamB")
      .populate("scorerId", "name email")
      .populate("createdBy", "name email");

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

    match.status = "live";
    match.tossWinner = tossWinner;
    match.tossDecision = tossDecision;
    await match.save();

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
      .populate("scorerId", "name email");

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

    const inning = await Inning.findOne({
      matchId: match._id,
      inningNumber: match.currentInning,
      isCompleted: false,
    })
      .populate("striker nonStriker currentBowler")
      .populate("battingTeam bowlingTeam");

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

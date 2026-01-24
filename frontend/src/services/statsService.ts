import AxiosInstance from "@/utils/axiosInstance";

export interface BattingStats {
  playerId: {
    _id: string;
    userId: { name: string; email: string };
  };
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissalType: string;
  dismissedBy?: {
    _id: string;
    userId: { name: string };
  };
  fielder?: {
    _id: string;
    userId: { name: string };
  };
}

export interface BowlingStats {
  playerId: {
    _id: string;
    userId: { name: string; email: string };
  };
  overs: number;
  balls: number;
  runsConceded: number;
  wickets: number;
  maidens: number;
  economy: number;
}

export interface Ball {
  _id: string;
  overNumber: number;
  ballNumber: number;
  runs: number;
  ballType: string;
  isValid: boolean;
  batsman?: {
    _id: string;
    userId?: {
      _id: string;
      name: string;
      email: string;
    };
  };
  bowler?: {
    _id: string;
    userId?: {
      _id: string;
      name: string;
      email: string;
    };
  };
  fielder?: {
    _id: string;
    userId?: {
      _id: string;
      name: string;
      email: string;
    };
  } | null;
}

export interface InningScorecard {
  _id: string;
  inningNumber: number;
  battingTeam: {
    _id: string;
    name: string;
    captain?: { _id: string; userId: { _id: string; name: string } } | string;
  };
  bowlingTeam: {
    _id: string;
    name: string;
    captain?: { _id: string; userId: { _id: string; name: string } } | string;
  };
  totalRuns: number;
  totalWickets: number;
  currentOver: number;
  currentBall: number;
  battingStats: BattingStats[];
  bowlingStats: BowlingStats[];
  balls?: Ball[];
}

export const statsService = {
  async getMatchScorecard(matchId: string): Promise<InningScorecard[]> {
    const { data } = await AxiosInstance.get(`/stats/scorecard/${matchId}`);
    return data;
  },

  async getMostRuns() {
    const { data } = await AxiosInstance.get("/stats/most-runs");
    return data;
  },

  async getMostWickets() {
    const { data } = await AxiosInstance.get("/stats/most-wickets");
    return data;
  },

  async getMostBoundaries() {
    const { data } = await AxiosInstance.get("/stats/most-boundaries");
    return data;
  },

  async getMostFours() {
    const { data } = await AxiosInstance.get("/stats/most-fours");
    return data;
  },

  async getMostSixes() {
    const { data } = await AxiosInstance.get("/stats/most-sixes");
    return data;
  },

  async getHighestScores() {
    const { data } = await AxiosInstance.get("/stats/highest-scores");
    return data;
  },

  async getMostFifties() {
    const { data } = await AxiosInstance.get("/stats/most-fifties");
    return data;
  },

  async getMostTwentyFives() {
    const { data } = await AxiosInstance.get("/stats/most-twenty-fives");
    return data;
  },

  async getMostCatches() {
    const { data } = await AxiosInstance.get("/stats/most-catches");
    return data;
  },

  async getMostOnes() {
    const { data } = await AxiosInstance.get("/stats/most-ones");
    return data;
  },

  async getBestEconomy() {
    const { data } = await AxiosInstance.get("/stats/best-economy");
    return data;
  },

  async getAvailableBatsmen(inningId: string) {
    const { data } = await AxiosInstance.get(
      `/stats/available-batsmen/${inningId}`
    );
    return data;
  },

  async getPlayerStats() {
    const { data } = await AxiosInstance.get("/stats/players");
    return data;
  },

  async getHeadToHead() {
    const { data } = await AxiosInstance.get("/stats/head-to-head");
    return data;
  },
};

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

  async getMostRuns(limit?: number) {
    const { data } = await AxiosInstance.get("/stats/most-runs", {
      params: limit ? { limit } : undefined,
    });
    return data;
  },

  async getMostWickets(limit?: number) {
    const { data } = await AxiosInstance.get("/stats/most-wickets", {
      params: limit ? { limit } : undefined,
    });
    return data;
  },

  async getMostBoundaries(limit?: number) {
    const { data } = await AxiosInstance.get("/stats/most-boundaries", {
      params: limit ? { limit } : undefined,
    });
    return data;
  },

  async getMostFours(limit?: number) {
    const { data } = await AxiosInstance.get("/stats/most-fours", {
      params: limit ? { limit } : undefined,
    });
    return data;
  },

  async getMostSixes(limit?: number) {
    const { data } = await AxiosInstance.get("/stats/most-sixes", {
      params: limit ? { limit } : undefined,
    });
    return data;
  },

  async getHighestScores(limit?: number) {
    const { data } = await AxiosInstance.get("/stats/highest-scores", {
      params: limit ? { limit } : undefined,
    });
    return data;
  },

  async getMostFifties(limit?: number) {
    const { data } = await AxiosInstance.get("/stats/most-fifties", {
      params: limit ? { limit } : undefined,
    });
    return data;
  },

  async getMostTwentyFives(limit?: number) {
    const { data } = await AxiosInstance.get("/stats/most-twenty-fives", {
      params: limit ? { limit } : undefined,
    });
    return data;
  },

  async getMostCatches(limit?: number) {
    const { data } = await AxiosInstance.get("/stats/most-catches", {
      params: limit ? { limit } : undefined,
    });
    return data;
  },

  async getMostOnes(limit?: number) {
    const { data } = await AxiosInstance.get("/stats/most-ones", {
      params: limit ? { limit } : undefined,
    });
    return data;
  },

  async getBestEconomy(limit?: number) {
    const { data } = await AxiosInstance.get("/stats/best-economy", {
      params: limit ? { limit } : undefined,
    });
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

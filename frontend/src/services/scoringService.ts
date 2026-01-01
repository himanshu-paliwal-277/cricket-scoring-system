import axiosInstance from "@/utils/axiosInstance";

export interface Player {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
}

export interface Team {
  _id: string;
  name: string;
  captain?: Player | string;
}

export interface Ball {
  _id: string;
  inningId: string;
  overNumber: number;
  ballNumber: number;
  batsman: Player;
  bowler: Player;
  runs: number;
  ballType: string;
  wicketType: string;
  isValid: boolean;
}

export interface BattingStats {
  playerId: Player;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissalType: string;
  dismissedBy?: Player;
  fielder?: Player;
}

export interface BowlingStats {
  playerId: Player;
  overs: number;
  balls: number;
  runsConceded: number;
  wickets: number;
  maidens: number;
  economy: number;
}

export interface Inning {
  _id: string;
  matchId: string;
  battingTeam: Team;
  bowlingTeam: Team;
  inningNumber: number;
  striker: Player;
  nonStriker: Player;
  currentBowler: Player;
  totalRuns: number;
  totalWickets: number;
  currentOver: number;
  currentBall: number;
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
  };
  isCompleted: boolean;
  balls?: Ball[];
  battingStats?: BattingStats[];
  bowlingStats?: BowlingStats[];
}

export interface AddBallData {
  inningId: string;
  runs: number;
  ballType: "normal" | "wide" | "noBall" | "wicket" | "bye" | "legBye";
  wicketType?: string;
  fielder?: string;
  newBatsmanId?: string;
}

export const scoringService = {
  getCurrentInning: async (matchId: string): Promise<Inning> => {
    const response = await axiosInstance.get(
      `/matches/${matchId}/current-inning`
    );
    return { ...response.data.inning, balls: response.data.balls };
  },

  addBall: async (data: AddBallData): Promise<any> => {
    const response = await axiosInstance.post("/scoring/ball", data);
    return response.data;
  },

  undoLastBall: async (inningId: string): Promise<any> => {
    const response = await axiosInstance.post(
      `/scoring/undo/${inningId}`
    );
    return response.data;
  },

  swapStrike: async (inningId: string): Promise<Inning> => {
    const response = await axiosInstance.post(
      `/scoring/swap-strike`,
      {
        inningId,
      }
    );
    return response.data;
  },

  changeBowler: async (inningId: string, bowlerId: string): Promise<Inning> => {
    const response = await axiosInstance.put(
      `/scoring/bowler`,
      {
        inningId,
        bowler: bowlerId,
      }
    );
    return response.data;
  },

  changeBatsman: async (
    inningId: string,
    newBatsmanId: string
  ): Promise<Inning> => {
    const response = await axiosInstance.put(
      `/scoring/batsmen`,
      {
        inningId,
        newBatsmanId,
      }
    );
    return response.data;
  },
};

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
}

export interface AddBallData {
  inningId: string;
  runs: number;
  ballType: "normal" | "wide" | "noBall" | "wicket" | "bye" | "legBye";
  wicketType?: string;
}

export const scoringService = {
  getCurrentInning: async (matchId: string): Promise<Inning> => {
    const response = await axiosInstance.get(
      `/matches/${matchId}/current-inning`
    );
    return response.data.inning;
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

  changeStriker: async (inningId: string): Promise<Inning> => {
    const response = await axiosInstance.put(
      `/scoring/batsmen`,
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
        striker: newBatsmanId,
      }
    );
    return response.data;
  },
};

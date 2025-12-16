import axiosInstance from "@/utils/axiosInstance";

export interface Inning {
  _id: string;
  matchId: string;
  battingTeam: any;
  bowlingTeam: any;
  inningNumber: number;
  striker: any;
  nonStriker: any;
  currentBowler: any;
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
      `/scoring/match/${matchId}/inning`
    );
    return response.data;
  },

  addBall: async (data: AddBallData): Promise<any> => {
    const response = await axiosInstance.post("/scoring/ball", data);
    return response.data;
  },

  undoLastBall: async (inningId: string): Promise<any> => {
    const response = await axiosInstance.post(
      `/scoring/inning/${inningId}/undo`
    );
    return response.data;
  },

  changeStriker: async (inningId: string): Promise<Inning> => {
    const response = await axiosInstance.post(
      `/scoring/inning/${inningId}/change-striker`
    );
    return response.data;
  },

  changeBowler: async (inningId: string, bowlerId: string): Promise<Inning> => {
    const response = await axiosInstance.post(
      `/scoring/inning/${inningId}/change-bowler`,
      {
        bowlerId,
      }
    );
    return response.data;
  },

  changeBatsman: async (
    inningId: string,
    newBatsmanId: string
  ): Promise<Inning> => {
    const response = await axiosInstance.post(
      `/scoring/inning/${inningId}/change-batsman`,
      {
        newBatsmanId,
      }
    );
    return response.data;
  },
};

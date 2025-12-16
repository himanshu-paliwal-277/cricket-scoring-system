import axiosInstance from "@/utils/axiosInstance";

export interface Match {
  _id: string;
  teamA: any;
  teamB: any;
  overs: number;
  tossWinner?: any;
  tossDecision?: string;
  currentInning: number;
  status: string;
  scorerId?: string;
  winner?: any;
  resultText?: string;
  createdAt: string;
}

export interface CreateMatchData {
  teamA: string;
  teamB: string;
  overs: number;
}

export interface StartMatchData {
  tossWinner: string;
  tossDecision: "bat" | "bowl";
  striker: string;
  nonStriker: string;
  bowler: string;
}

export const matchService = {
  getAll: async (): Promise<Match[]> => {
    const response = await axiosInstance.get("/matches");
    return response.data;
  },

  getById: async (id: string): Promise<Match> => {
    const response = await axiosInstance.get(`/matches/${id}`);
    return response.data;
  },

  create: async (data: CreateMatchData): Promise<Match> => {
    const response = await axiosInstance.post("/matches", data);
    return response.data;
  },

  start: async (id: string, data: StartMatchData): Promise<any> => {
    const response = await axiosInstance.post(`/matches/${id}/start`, data);
    return response.data;
  },

  complete: async (id: string): Promise<Match> => {
    const response = await axiosInstance.post(`/matches/${id}/complete`);
    return response.data;
  },
};

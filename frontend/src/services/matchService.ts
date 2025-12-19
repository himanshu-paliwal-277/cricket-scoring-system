/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axiosInstance";

export interface Team {
  _id: string;
  name: string;
  players: string[];
  isLocked: boolean;
}

export interface Match {
  _id: string;
  teamA: Team;
  teamB: Team;
  overs: number;
  tossWinner?: Team;
  tossDecision?: string;
  currentInning: number;
  status: string;
  scorerId?: string;
  winner?: Team;
  resultText?: string;
  createdAt: string;
  innings?: any[]; // Add innings array
}

export interface CreateMatchData {
  teamA: string;
  teamB: string;
  overs: number;
}

export interface StartInningData {
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
    return { ...response.data.match, innings: response.data.innings };
  },

  create: async (data: CreateMatchData): Promise<Match> => {
    const response = await axiosInstance.post("/matches", data);
    return response.data;
  },

  start: async (id: string, data: any): Promise<any> => {
    const response = await axiosInstance.post(`/matches/${id}/start`, data);
    return response.data;
  },

  startInning: async (id: string, data: StartInningData): Promise<any> => {
    const response = await axiosInstance.post(
      `/matches/${id}/start-inning`,
      data
    );
    return response.data;
  },

  complete: async (id: string): Promise<Match> => {
    const response = await axiosInstance.post(`/matches/${id}/complete`);
    return response.data;
  },

  endMatch: async (id: string): Promise<Match> => {
    const response = await axiosInstance.post(`/matches/${id}/end`);
    return response.data.match;
  },
};

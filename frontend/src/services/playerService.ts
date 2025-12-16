import axios from "@/lib/axios";

export interface Player {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  battingStyle: string;
  bowlingStyle: string;
  totalRuns: number;
  totalWickets: number;
  matchesPlayed: number;
  highestScore: number;
  totalBallsFaced: number;
  totalBallsBowled: number;
}

export interface CreatePlayerData {
  userId: string;
  battingStyle: string;
  bowlingStyle: string;
}

export const playerService = {
  getAll: async (): Promise<Player[]> => {
    const response = await axios.get("/v1/players");
    return response.data;
  },

  getById: async (id: string): Promise<Player> => {
    const response = await axios.get(`/v1/players/${id}`);
    return response.data;
  },

  create: async (data: CreatePlayerData): Promise<Player> => {
    const response = await axios.post("/v1/players", data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreatePlayerData>): Promise<Player> => {
    const response = await axios.put(`/v1/players/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`/v1/players/${id}`);
  },
};

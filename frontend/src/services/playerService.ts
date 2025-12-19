import axiosInstance from "@/utils/axiosInstance";

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
    const response = await axiosInstance.get("/players");
    return response.data;
  },

  getById: async (id: string): Promise<Player> => {
    const response = await axiosInstance.get(`/players/${id}`);
    return response.data;
  },

  getStats: async (id: string): Promise<any> => {
    const response = await axiosInstance.get(`/players/${id}/stats`);
    return response.data;
  },

  create: async (data: CreatePlayerData): Promise<Player> => {
    const response = await axiosInstance.post("/players", data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreatePlayerData>
  ): Promise<Player> => {
    const response = await axiosInstance.put(`/players/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/players/${id}`);
  },
};

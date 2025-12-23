import axiosInstance from "@/utils/axiosInstance";

export interface Player {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface Team {
  _id: string;
  name: string;
  teamType: "team1" | "team2";
  players: Player[];
  createdBy: string;
  isLocked: boolean;
  createdAt: string;
  captain?: Player;
}

export interface CreateTeamData {
  name: string;
  players: string[];
}

export const teamService = {
  getAll: async (): Promise<Team[]> => {
    const response = await axiosInstance.get("/teams");
    return response.data;
  },

  initialize: async (): Promise<Team[]> => {
    const response = await axiosInstance.get("/teams/initialize");
    return response.data;
  },

  getById: async (id: string): Promise<Team> => {
    const response = await axiosInstance.get(`/teams/${id}`);
    return response.data;
  },

  create: async (data: CreateTeamData): Promise<Team> => {
    const response = await axiosInstance.post("/teams", data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateTeamData>): Promise<Team> => {
    const response = await axiosInstance.put(`/teams/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/teams/${id}`);
  },
};

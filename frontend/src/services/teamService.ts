import axiosInstance from "@/utils/axiosInstance";

export interface Team {
  _id: string;
  name: string;
  players: string[];
  createdBy: string;
  isLocked: boolean;
  createdAt: string;
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

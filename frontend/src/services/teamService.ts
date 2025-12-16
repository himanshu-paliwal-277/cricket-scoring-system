import axios from "@/lib/axios";

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
    const response = await axios.get("/v1/teams");
    return response.data;
  },

  getById: async (id: string): Promise<Team> => {
    const response = await axios.get(`/v1/teams/${id}`);
    return response.data;
  },

  create: async (data: CreateTeamData): Promise<Team> => {
    const response = await axios.post("/v1/teams", data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateTeamData>): Promise<Team> => {
    const response = await axios.put(`/v1/teams/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`/v1/teams/${id}`);
  },
};

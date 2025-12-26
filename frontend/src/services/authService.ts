import axiosInstance from "@/utils/axiosInstance";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "owner" | "scorer" | "player";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PlayerProfile {
  _id: string;
  userId: string;
  battingStyle: string;
  bowlingStyle: string;
  totalRuns: number;
  totalWickets: number;
  matchesPlayed: number;
  highestScore: number;
  totalBallsFaced: number;
  totalBallsBowled: number;
  totalFours: number;
  totalSixes: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  playerProfile?: PlayerProfile;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  },
};

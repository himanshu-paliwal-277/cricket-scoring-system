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

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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

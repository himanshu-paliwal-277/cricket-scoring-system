import axios from "@/lib/axios";

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

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axios.post("/v1/auth/register", data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axios.post("/v1/auth/login", data);
    return response.data;
  },

  getMe: async () => {
    const response = await axios.get("/v1/auth/me");
    return response.data;
  },
};

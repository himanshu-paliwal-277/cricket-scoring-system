import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  authService,
  LoginData,
  RegisterData,
  User,
} from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { notifications } from "@mantine/notifications";

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser, clearUser } = useAuthStore();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["me"],
    queryFn: authService.getMe,
    enabled: !!Cookies.get("token"),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (data) => {
      if (data && data.token) {
        Cookies.set("token", data.token, { expires: 30 });
        setUser(data.user);
        queryClient.invalidateQueries({ queryKey: ["me"] });
        router.push("/dashboard");
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || "Registration failed";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authService.login(data),
    onSuccess: (data) => {
      if (data && data.token) {
        Cookies.set("token", data.token, { expires: 30 });
        setUser(data.user);
        queryClient.invalidateQueries({ queryKey: ["me"] });
        router.push("/dashboard");
        notifications.show({
          message: "Logged in successfully",
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || "Login failed";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  const logout = () => {
    Cookies.remove("token");
    clearUser();
    queryClient.clear();
    router.push("/login");
    notifications.show({
      message: "Logged out successfully",
    });
  };

  return {
    user: user as User | undefined, // Explicitly cast the type
    isLoading,
    isAuthenticated: !!Cookies.get("token"),
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout,
    registerLoading: registerMutation.isPending,
    loginLoading: loginMutation.isPending,
    registerError: registerMutation.error,
    loginError: loginMutation.error,
  };
};

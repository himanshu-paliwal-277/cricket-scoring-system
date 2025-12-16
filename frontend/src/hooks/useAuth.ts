import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { authService, LoginData, RegisterData } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser, clearUser } = useAuthStore();

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: authService.getMe,
    enabled: !!Cookies.get("token"),
    retry: false,
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (data) => {
      Cookies.set("token", data.token, { expires: 30 });
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/dashboard");
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authService.login(data),
    onSuccess: (data) => {
      Cookies.set("token", data.token, { expires: 30 });
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/dashboard");
    },
  });

  const logout = () => {
    Cookies.remove("token");
    clearUser();
    queryClient.clear();
    router.push("/login");
  };

  return {
    user,
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

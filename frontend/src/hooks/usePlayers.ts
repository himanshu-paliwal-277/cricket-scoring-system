/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { CreatePlayerData, playerService } from "@/services/playerService";

export const usePlayers = () => {
  const queryClient = useQueryClient();

  const {
    data: players = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["players"],
    queryFn: playerService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePlayerData) => playerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      notifications.show({
        message: "Player created successfully",
      });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to create player";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreatePlayerData>;
    }) => playerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      notifications.show({
        message: "Player updated successfully",
      });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to update player";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => playerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      notifications.show({
        message: "Player deleted successfully",
      });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete player";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => playerService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      notifications.show({
        message: "Player status updated successfully",
      });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to update player status";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  return {
    players,
    isLoading,
    error,
    createPlayer: createMutation.mutate,
    updatePlayer: updateMutation.mutate,
    deletePlayer: deleteMutation.mutate,
    togglePlayerActive: toggleActiveMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingActive: toggleActiveMutation.isPending,
  };
};

export const usePlayer = (id: string) => {
  const queryClient = useQueryClient();

  const {
    data: player,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["player", id],
    queryFn: () => playerService.getById(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreatePlayerData>) =>
      playerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player", id] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      notifications.show({
        message: "Player updated successfully",
      });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to update player";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  return {
    player,
    isLoading,
    error,
    updatePlayer: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};

export const usePlayerStats = (id: string) => {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["playerStats", id],
    queryFn: () => playerService.getStats(id),
    enabled: !!id,
  });

  return { stats, isLoading, error };
};

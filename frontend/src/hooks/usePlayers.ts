import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreatePlayerData, playerService } from "@/services/playerService";

export const usePlayers = () => {
  const queryClient = useQueryClient();

  const { data: players = [], isLoading, error } = useQuery({
    queryKey: ["players"],
    queryFn: playerService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePlayerData) => playerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePlayerData> }) =>
      playerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => playerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });

  return {
    players,
    isLoading,
    error,
    createPlayer: createMutation.mutate,
    updatePlayer: updateMutation.mutate,
    deletePlayer: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const usePlayer = (id: string) => {
  const { data: player, isLoading, error } = useQuery({
    queryKey: ["player", id],
    queryFn: () => playerService.getById(id),
    enabled: !!id,
  });

  return { player, isLoading, error };
};

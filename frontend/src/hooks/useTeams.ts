import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateTeamData, teamService } from "@/services/teamService";

export const useTeams = () => {
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading, error } = useQuery({
    queryKey: ["teams"],
    queryFn: teamService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTeamData) => teamService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTeamData> }) =>
      teamService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  return {
    teams,
    isLoading,
    error,
    createTeam: createMutation.mutate,
    updateTeam: updateMutation.mutate,
    deleteTeam: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useTeam = (id: string) => {
  const { data: team, isLoading, error } = useQuery({
    queryKey: ["team", id],
    queryFn: () => teamService.getById(id),
    enabled: !!id,
  });

  return { team, isLoading, error };
};

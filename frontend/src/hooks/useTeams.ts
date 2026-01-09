/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { CreateTeamData, teamService } from "@/services/teamService";

export const useTeams = () => {
  const queryClient = useQueryClient();

  const {
    data: teams = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: teamService.initialize,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTeamData) => teamService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      notifications.show({
        message: "Team created successfully",
      });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to create team";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTeamData> }) =>
      teamService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      notifications.show({
        message: "Team updated successfully",
      });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to update team";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      notifications.show({
        message: "Team deleted successfully",
      });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete team";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
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
  const {
    data: team,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["team", id],
    queryFn: () => teamService.getById(id),
    enabled: !!id,
  });

  return { team, isLoading, error };
};

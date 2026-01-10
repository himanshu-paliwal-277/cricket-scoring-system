/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  CreateMatchData,
  matchService,
  StartInningData,
  GetMatchesParams,
} from "@/services/matchService";

export const useMatches = (params?: GetMatchesParams) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["matches", params],
    queryFn: () => matchService.getAll(params),
  });

  const matches = data?.matches || [];
  const pagination = data?.pagination;

  const createMutation = useMutation({
    mutationFn: (data: CreateMatchData) => matchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      notifications.show({
        message: "Match created successfully",
      });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to create match";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  const startMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      matchService.start(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      notifications.show({
        message: "Match started successfully",
      });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to start match";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => matchService.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      notifications.show({
        message: "Match completed successfully",
      });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to complete match";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  return {
    matches,
    pagination,
    isLoading,
    error,
    createMatch: createMutation.mutate,
    startMatch: startMutation.mutate,
    completeMatch: completeMutation.mutate,
    isCreating: createMutation.isPending,
    isStarting: startMutation.isPending,
    isCompleting: completeMutation.isPending,
  };
};

export const useMatch = (id: string) => {
  const queryClient = useQueryClient();

  const {
    data: match,
    isLoading,
    error,
  } = useQuery<any>({
    queryKey: ["match", id],
    queryFn: () => matchService.getById(id),
    enabled: !!id,
  });

  const endMatchMutation = useMutation({
    mutationFn: (matchId: string) => matchService.endMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", id] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["inning", id] });

      notifications.show({
        message: "Match ended successfully",
      });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to end match";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  const startInningMutation = useMutation({
    mutationFn: (data: StartInningData) => matchService.startInning(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", id] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["inning", id] });

      notifications.show({
        message: "Inning started successfully",
      });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to start inning";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  return {
    match,
    isLoading,
    error,
    endMatch: endMatchMutation.mutate,
    startInning: startInningMutation.mutate,
    isEndingMatch: endMatchMutation.isPending,
    isStartingInning: startInningMutation.isPending,
  };
};

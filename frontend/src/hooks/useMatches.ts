import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateMatchData,
  matchService,
  StartMatchData,
  StartInningData,
} from "@/services/matchService";

export const useMatches = () => {
  const queryClient = useQueryClient();

  const {
    data: matches = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["matches"],
    queryFn: matchService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMatchData) => matchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  const startMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StartMatchData }) =>
      matchService.start(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => matchService.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  return {
    matches,
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
  } = useQuery({
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
    },
  });

  const startInningMutation = useMutation({
    mutationFn: (data: StartInningData) => matchService.startInning(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", id] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["inning", id] });
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

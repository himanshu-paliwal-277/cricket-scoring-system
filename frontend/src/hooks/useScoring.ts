import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddBallData, scoringService } from "@/services/scoringService";

export const useScoring = (matchId: string) => {
  const queryClient = useQueryClient();

  const { data: inning, isLoading, error } = useQuery({
    queryKey: ["inning", matchId],
    queryFn: () => scoringService.getCurrentInning(matchId),
    enabled: !!matchId,
    refetchInterval: 3000, // Auto-refetch every 3 seconds for live updates
    retry: (failureCount, error: any) => {
      // Don't retry on 404 - match hasn't started yet
      if (error?.response?.status === 404) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    refetchOnWindowFocus: false,
  });

  const addBallMutation = useMutation({
    mutationFn: (data: AddBallData) => scoringService.addBall(data),
    onSuccess: () => {
      // Force immediate refetch of inning data
      queryClient.invalidateQueries({ queryKey: ["inning", matchId] });
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });

  const undoMutation = useMutation({
    mutationFn: (inningId: string) => scoringService.undoLastBall(inningId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inning", matchId] });
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });

  const swapStrikeMutation = useMutation({
    mutationFn: (inningId: string) => scoringService.swapStrike(inningId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inning", matchId] });
    },
  });

  const changeBowlerMutation = useMutation({
    mutationFn: ({ inningId, bowlerId }: { inningId: string; bowlerId: string }) =>
      scoringService.changeBowler(inningId, bowlerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inning", matchId] });
    },
  });

  const changeBatsmanMutation = useMutation({
    mutationFn: ({ inningId, newBatsmanId }: { inningId: string; newBatsmanId: string }) =>
      scoringService.changeBatsman(inningId, newBatsmanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inning", matchId] });
    },
  });

  return {
    inning,
    isLoading,
    error,
    addBall: addBallMutation.mutate,
    undoLastBall: undoMutation.mutate,
    swapStrike: swapStrikeMutation.mutate,
    changeBowler: changeBowlerMutation.mutate,
    changeBatsman: changeBatsmanMutation.mutate,
    isAddingBall: addBallMutation.isPending,
    isUndoing: undoMutation.isPending,
  };
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddBallData, scoringService } from "@/services/scoringService";

export const useScoring = (matchId: string) => {
  const queryClient = useQueryClient();

  const { data: inning, isLoading, error } = useQuery({
    queryKey: ["inning", matchId],
    queryFn: () => scoringService.getCurrentInning(matchId),
    enabled: !!matchId,
    refetchInterval: 5000,
  });

  const addBallMutation = useMutation({
    mutationFn: (data: AddBallData) => scoringService.addBall(data),
    onSuccess: () => {
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

  const changeStrikerMutation = useMutation({
    mutationFn: (inningId: string) => scoringService.changeStriker(inningId),
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
    changeStriker: changeStrikerMutation.mutate,
    changeBowler: changeBowlerMutation.mutate,
    changeBatsman: changeBatsmanMutation.mutate,
    isAddingBall: addBallMutation.isPending,
    isUndoing: undoMutation.isPending,
  };
};

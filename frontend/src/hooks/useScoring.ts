/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { AddBallData, scoringService } from "@/services/scoringService";
import { useAuth } from "@/hooks/useAuth";

export const useScoring = (matchId: string) => {
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Disable refetch for scorer and owner roles
  const shouldRefetch = user?.role !== "scorer" && user?.role !== "owner";

  const {
    data: inning,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inning", matchId],
    queryFn: () => scoringService.getCurrentInning(matchId),
    enabled: !!matchId,
    retry: (failureCount, err: any) => {
      if (err?.response?.status === 404) return false;
      return failureCount < 3;
    },
    refetchOnWindowFocus: isClient,
    refetchInterval: shouldRefetch ? 10000 : false, // 10 seconds for players, disabled for scorers/owners
  });

  const addBallMutation = useMutation({
    mutationFn: (data: AddBallData) => scoringService.addBall(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inning", matchId] });
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });

      // notifications.show({
      //   message: "Ball added successfully",
      // });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to add ball";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  const undoMutation = useMutation({
    mutationFn: (inningId: string) => scoringService.undoLastBall(inningId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inning", matchId] });
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });

      notifications.show({
        message: "Last ball undone",
      });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to undo last ball";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  const swapStrikeMutation = useMutation({
    mutationFn: (inningId: string) => scoringService.swapStrike(inningId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inning", matchId] });

      // notifications.show({
      //   message: "Strike swapped successfully",
      // });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to swap strike";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  const changeBowlerMutation = useMutation({
    mutationFn: ({
      inningId,
      bowlerId,
    }: {
      inningId: string;
      bowlerId: string;
    }) => scoringService.changeBowler(inningId, bowlerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inning", matchId] });

      // notifications.show({
      //   message: "Bowler changed successfully",
      // });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to change bowler";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    },
  });

  const changeBatsmanMutation = useMutation({
    mutationFn: ({
      inningId,
      newBatsmanId,
    }: {
      inningId: string;
      newBatsmanId: string;
    }) => scoringService.changeBatsman(inningId, newBatsmanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inning", matchId] });

      // notifications.show({
      //   message: "Batsman changed successfully",
      // });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to change batsman";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
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

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useScoring } from "@/hooks/useScoring";
import { useMatch } from "@/hooks/useMatches";
import { usePlayers } from "@/hooks/usePlayers";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { WicketModal } from "@/components/WicketModal";
import { statsService } from "@/services/statsService";
import { truncateString } from "@/utils/truncateString";

export default function ScoringPage() {
  const params = useParams();
  const matchId = params.id as string;
  const {
    inning,
    isLoading,
    addBall,
    undoLastBall,
    swapStrike,
    changeBowler,
    changeBatsman,
    isAddingBall,
  } = useScoring(matchId);
  const { match, endMatch, startInning, isEndingMatch, isStartingInning } =
    useMatch(matchId);
  const { players } = usePlayers();
  const { user, isLoading: isLoadingUser } = useAuth();
  const [ballType, setBallType] = useState<
    "normal" | "wide" | "noBall" | "wicket"
  >("normal");
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showBatsmanModal, setShowBatsmanModal] = useState(false);
  const [showEndMatchModal, setShowEndMatchModal] = useState(false);
  const [showChangeInningModal, setShowChangeInningModal] = useState(false);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [newBowlerId, setNewBowlerId] = useState("");
  const [newBatsmanId, setNewBatsmanId] = useState("");
  const [inningStriker, setInningStriker] = useState("");
  const [inningNonStriker, setInningNonStriker] = useState("");
  const [inningBowler, setInningBowler] = useState("");
  const [availableBatsmen, setAvailableBatsmen] = useState<any[]>([]);

  const firstInning = match?.innings?.find((i: any) => i.inningNumber === 1);

  // Determine teams for current inning
  const currentInningBattingTeam =
    match?.currentInning === 1
      ? match.tossDecision === "bat" && match.tossWinner
        ? match.tossWinner._id === match.teamA._id
          ? match.teamA
          : match.teamB
        : match.tossWinner
        ? match.tossWinner._id === match.teamA._id
          ? match.teamB
          : match.teamA
        : match.teamA
      : firstInning?.bowlingTeam;

  const currentInningBowlingTeam =
    match?.currentInning === 1
      ? match.tossDecision === "bat" && match.tossWinner
        ? match.tossWinner._id === match.teamA._id
          ? match.teamB
          : match.teamA
        : match.tossWinner
        ? match.tossWinner._id === match.teamA._id
          ? match.teamA
          : match.teamB
        : match.teamB
      : firstInning?.battingTeam;

  // Check if all players are out (based on team size)
  const checkAllPlayersOut = () => {
    if (!inning || !currentInningBattingTeam) return false;

    const totalPlayers = currentInningBattingTeam.players?.length || 11;
    const totalWickets = inning.totalWickets || 0;

    // All out when wickets = totalPlayers - 1
    // (because you need at least 2 batsmen, so last man can't bat alone)
    // For 5 players: max 4 wickets, for 11 players: max 10 wickets
    return totalWickets >= totalPlayers - 1;
  };

  const handleEndMatch = () => {
    setShowEndMatchModal(true);
  };

  // Auto-trigger inning change when all players are out
  useEffect(() => {
    if (match?.status === "live" && inning && checkAllPlayersOut()) {
      if (match.currentInning === 1) {
        // Automatically show modal to start second inning when all players are out
        setTimeout(() => {
          setShowChangeInningModal(true);
        }, 1000); // Small delay so users can see the final score
      } else if (match.currentInning === 2) {
        // Second inning all out - end match automatically
        setTimeout(() => {
          handleEndMatch();
        }, 1000);
      }
    }
  }, [inning?.totalWickets, match?.status, match?.currentInning]);

  const confirmEndMatch = () => {
    endMatch(matchId);
    setShowEndMatchModal(false);
  };

  const handleChangeInning = () => {
    setShowChangeInningModal(true);
  };

  const confirmChangeInning = () => {
    // Don't close modal yet - let startInning success handler do it
    if (inningStriker && inningNonStriker && inningBowler) {
      startInning({
        striker: inningStriker,
        nonStriker: inningNonStriker,
        bowler: inningBowler,
      });
      // Reset form
      setInningStriker("");
      setInningNonStriker("");
      setInningBowler("");
      setShowChangeInningModal(false);
    }
  };

  const handleAddBall = (
    runs: number,
    type: "normal" | "wide" | "noBall" | "wicket" | "bye" | "legBye" = "normal",
    wicketType?: string,
    fielder?: string
  ) => {
    if (!inning) return;

    if (type === "wicket") {
      setShowWicketModal(true);
      return;
    }

    addBall({
      inningId: inning._id,
      runs,
      ballType: type,
      wicketType,
      fielder,
    });
    setBallType("normal");
  };

  const handleWicketConfirm = (data: {
    wicketType: string;
    newBatsmanId: string;
    fielderId?: string;
    runOutRuns?: number;
  }) => {
    if (!inning) return;

    // For run out, use the runs scored; otherwise 0
    const runs = data.wicketType === "runOut" && data.runOutRuns !== undefined
      ? data.runOutRuns
      : 0;

    addBall({
      inningId: inning._id,
      runs,
      ballType: "wicket",
      wicketType: data.wicketType,
      fielder: data.fielderId,
    });

    // Only change batsman if there's a new batsman (not final wicket)
    if (data.newBatsmanId) {
      changeBatsman({
        inningId: inning._id,
        newBatsmanId: data.newBatsmanId,
      });
    }

    setShowWicketModal(false);
    setBallType("normal");
  };

  const handleWideClick = () => {
    if (!inning) return;
    addBall({
      inningId: inning._id,
      runs: 1,
      ballType: "wide",
    });
  };

  useEffect(() => {
    if (showWicketModal && inning) {
      statsService.getAvailableBatsmen(inning._id).then(setAvailableBatsmen);
    }
  }, [showWicketModal, inning]);

  const handleChangeBowler = () => {
    if (newBowlerId && inning) {
      changeBowler({ inningId: inning._id, bowlerId: newBowlerId });
      setShowBowlerModal(false);
      setNewBowlerId("");
    }
  };

  const handleChangeBatsman = () => {
    if (newBatsmanId && inning) {
      changeBatsman({ inningId: inning._id, newBatsmanId });
      setShowBatsmanModal(false);
      setNewBatsmanId("");
    }
  };

  const handleStartInning = () => {
    if (inningStriker && inningNonStriker && inningBowler) {
      startInning({
        striker: inningStriker,
        nonStriker: inningNonStriker,
        bowler: inningBowler,
      });
      setInningStriker("");
      setInningNonStriker("");
      setInningBowler("");
    }
  };

  const getBatsmanStats = (playerId: string) => {
    if (!inning?.balls) return { runs: 0, balls: 0 };
    let runs = 0;
    let balls = 0;
    inning.balls.forEach((ball) => {
      if (ball.batsman._id === playerId) {
        if (ball.ballType === "normal" || ball.ballType === "wicket") {
          balls += 1;
        }
        // Count runs from normal balls, wickets, and no-balls (but not wides, byes, or legByes)
        if (ball.ballType === "normal" || ball.ballType === "wicket" || ball.ballType === "noBall") {
          runs += ball.runs;
        }
      }
    });
    return { runs, balls };
  };

  const getBowlerStats = (playerId: string) => {
    if (!inning?.balls)
      return { balls: 0, runs: 0, wickets: 0, economy: "0.0" };
    let balls = 0;
    let runs = 0;
    let wickets = 0;
    inning.balls.forEach((ball) => {
      if (ball.bowler._id === playerId) {
        // Count only valid balls (normal balls and wickets, not wides or no-balls)
        if (ball.isValid && (ball.ballType === "normal" || ball.ballType === "wicket" || ball.ballType === "bye" || ball.ballType === "legBye")) {
          balls += 1;
        }
        runs += ball.runs;
        if (ball.ballType === "wicket") {
          wickets += 1;
        }
      }
    });
    const overs = Math.floor(balls / 6) + (balls % 6) / 10;
    const economy = balls > 0 ? ((runs / balls) * 6).toFixed(1) : "0.0";
    return { balls, runs, wickets, overs, economy };
  };

  // Check if user can score (owner or scorer role)
  // While user is loading, assume they can score to avoid hiding buttons on first render
  const canScore =
    isLoadingUser || user?.role === "owner" || user?.role === "scorer";

  if (isLoading)
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );

  if (!inning || !inning._id) {
    return (
      <ProtectedRoute allowedRoles={["owner", "scorer", "player"]}>
        <Layout>
          <Card className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">
              {canScore
                ? `Start ${
                    match?.currentInning === 1 ? "First" : "Second"
                  } Inning`
                : "Waiting for Inning to Start"}
            </h1>
            {canScore ? (
              <>
                <p className="text-gray-600 mb-6 text-center">
                  Select the opening batsmen and bowler for the{" "}
                  {match?.currentInning === 1 ? "first" : "second"} inning.
                </p>
                <div className="space-y-4">
                  <Select
                    label={`Striker (${currentInningBattingTeam?.name})`}
                    value={inningStriker}
                    onChange={(e) => setInningStriker(e.target.value)}
                    options={[
                      { value: "", label: "Select Striker" },
                      ...(currentInningBattingTeam?.players || []).map(
                        (playerId: string) => {
                          const player = players.find(
                            (p) => p._id === playerId
                          );
                          return {
                            value: playerId,
                            label: player?.userId.name || "",
                          };
                        }
                      ),
                    ]}
                  />
                  <Select
                    label={`Non-Striker (${currentInningBattingTeam?.name})`}
                    value={inningNonStriker}
                    onChange={(e) => setInningNonStriker(e.target.value)}
                    options={[
                      { value: "", label: "Select Non-Striker" },
                      ...(currentInningBattingTeam?.players || [])
                        .filter((id: string) => id !== inningStriker)
                        .map((playerId: string) => {
                          const player = players.find(
                            (p) => p._id === playerId
                          );
                          return {
                            value: playerId,
                            label: player?.userId.name || "",
                          };
                        }),
                    ]}
                  />
                  <Select
                    label={`Bowler (${currentInningBowlingTeam?.name})`}
                    value={inningBowler}
                    onChange={(e) => setInningBowler(e.target.value)}
                    options={[
                      { value: "", label: "Select Bowler" },
                      ...(currentInningBowlingTeam?.players || []).map(
                        (playerId: string) => {
                          const player = players.find(
                            (p) => p._id === playerId
                          );
                          return {
                            value: playerId,
                            label: player?.userId.name || "",
                          };
                        }
                      ),
                    ]}
                  />
                  <Button
                    onClick={handleStartInning}
                    className="w-full"
                    isLoading={isStartingInning}
                    disabled={
                      !inningStriker || !inningNonStriker || !inningBowler
                    }
                  >
                    Start {match?.currentInning === 1 ? "First" : "Second"}{" "}
                    Inning
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  The {match?.currentInning === 1 ? "first" : "second"} inning
                  {`hasn't started yet.`}
                </p>
                <p className="text-sm text-gray-500">
                  Please wait for the scorer to start the inning.
                </p>
              </div>
            )}
          </Card>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["owner", "scorer", "player"]}>
      <Layout>
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <h1 className="sm:text-2xl text-xl sm:text-left text-center font-bold mb-4">
              {match?.teamA.name} vs {match?.teamB.name}
            </h1>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">
                  Batting: {inning?.battingTeam.name}
                </p>
                <p className="text-gray-600">
                  Bowling: {inning?.bowlingTeam.name}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Inning: {inning?.inningNumber}</p>
                <p className="text-gray-600">
                  Overs: {inning?.currentOver}.{inning?.currentBall} / {match?.overs}
                </p>
              </div>
            </div>
          </Card>

          {/* Current Inning Scoreboard */}
          <Card>
            <h2 className="sm:text-xl text-lg sm:text-left text-center font-bold mb-4">
              Current Inning Scoreboard
            </h2>
            <div className="text-center mb-6">
              <p className="sm:text-3xl text-2xl font-bold">
                {inning?.battingTeam.name}: {inning?.totalRuns}/
                {inning?.totalWickets}
              </p>
              <p className="text-lg text-gray-600">
                Overs: {inning?.currentOver}.{inning?.currentBall} / {match?.overs}
              </p>
              {checkAllPlayersOut() && (
                <p className="text-red-600 font-semibold mt-2 text-xl">
                  All Out! ({inning?.totalWickets}/
                  {currentInningBattingTeam?.players?.length || 0})
                </p>
              )}
            </div>

            {/* Live Batting Scorecard */}
            {inning?.battingStats && inning.battingStats.length > 0 && (
              <div className="overflow-x-auto mb-6">
                <h3 className="font-semibold mb-3">Batting</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2">Batsman</th>
                      <th className="text-right py-2">R</th>
                      <th className="text-right py-2">B</th>
                      <th className="text-right py-2">4s</th>
                      <th className="text-right py-2">6s</th>
                      <th className="text-right py-2">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inning.battingStats.map((stat: any) => {
                      const isStriker =
                        stat.playerId._id === inning.striker?._id;
                      const isNonStriker =
                        stat.playerId._id === inning.nonStriker?._id;
                      return (
                        <tr
                          key={stat.playerId._id}
                          className="border-b border-gray-200"
                        >
                          <td className="py-2">
                            <div className="flex flex-col">
                              <span
                                className={
                                  isStriker || isNonStriker
                                    ? "font-semibold"
                                    : ""
                                }
                              >
                                {stat.playerId.userId?.name || "Unknown"}
                                {isStriker ? " *" : ""}
                              </span>
                              {stat.isOut && (
                                <span className="text-xs text-gray-600">
                                  {stat.dismissalType === "bowled" &&
                                    `b ${stat.dismissedBy?.userId?.name || ""}`}
                                  {stat.dismissalType === "caught" &&
                                    `c ${stat.fielder?.userId?.name || ""} b ${
                                      stat.dismissedBy?.userId?.name || ""
                                    }`}
                                  {stat.dismissalType === "stumped" &&
                                    `st ${stat.fielder?.userId?.name || ""} b ${
                                      stat.dismissedBy?.userId?.name || ""
                                    }`}
                                  {stat.dismissalType === "lbw" &&
                                    `lbw b ${
                                      stat.dismissedBy?.userId?.name || ""
                                    }`}
                                  {stat.dismissalType === "runOut" && "run out"}
                                  {stat.dismissalType === "hitWicket" &&
                                    "hit wicket"}
                                </span>
                              )}
                              {!stat.isOut && !isStriker && !isNonStriker && (
                                <span className="text-xs text-gray-600">
                                  not out
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-right py-2">{stat.runs}</td>
                          <td className="text-right py-2">{stat.balls}</td>
                          <td className="text-right py-2">{stat.fours}</td>
                          <td className="text-right py-2">{stat.sixes}</td>
                          <td className="text-right py-2">
                            {stat.strikeRate.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Live Bowling Scorecard */}
            {inning?.bowlingStats && inning.bowlingStats.length > 0 && (
              <div className="overflow-x-auto mb-6">
                <h3 className="font-semibold mb-3">Bowling</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2">Bowler</th>
                      <th className="text-right py-2">O</th>
                      <th className="text-right py-2">M</th>
                      <th className="text-right py-2">R</th>
                      <th className="text-right py-2">W</th>
                      <th className="text-right py-2">Econ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inning.bowlingStats.map((stat: any) => {
                      const isCurrent =
                        stat.playerId._id === inning.currentBowler?._id;
                      return (
                        <tr
                          key={stat.playerId._id}
                          className="border-b border-gray-200"
                        >
                          <td className="py-2">
                            <span className={isCurrent ? "font-semibold" : ""}>
                              {stat.playerId.userId?.name || "Unknown"}
                              {isCurrent ? " *" : ""}
                            </span>
                          </td>
                          <td className="text-right py-2">
                            {stat.overs.toFixed(1)}
                          </td>
                          <td className="text-right py-2">{stat.maidens}</td>
                          <td className="text-right py-2">
                            {stat.runsConceded}
                          </td>
                          <td className="text-right py-2">{stat.wickets}</td>
                          <td className="text-right py-2">
                            {stat.economy.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Fall of Wickets */}
            {inning?.battingStats &&
              inning.battingStats.filter((s: any) => s.isOut).length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Fall of Wickets</h3>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {inning.battingStats
                      .map((stat: any, index: number) => {
                        if (!stat.isOut) return null;

                        // Calculate wicket number (how many wickets have fallen up to this point)
                        const wicketNumber = inning.battingStats.filter(
                          (s: any, i: number) => i <= index && s.isOut
                        ).length;

                        // We need ball-by-ball data to get exact score at wicket
                        // For now, this is an approximation
                        return {
                          stat,
                          wicketNumber,
                          index,
                        };
                      })
                      .filter((item: any) => item !== null)
                      .map((item: any, idx: number) => (
                        <span key={item.index} className="text-gray-700">
                          {item.wicketNumber}-{item.stat.playerId.userId?.name} (
                          {item.stat.runs} runs, {item.stat.balls} balls)
                        </span>
                      ))}
                  </div>
                </div>
              )}

            {/* Partnerships */}
            {inning?.battingStats && inning.battingStats.length >= 1 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-3">Partnerships</h3>
                <div className="space-y-2 text-sm">
                  {(() => {
                    // Simple approach: Show current partnership if ongoing
                    // For completed partnerships, calculate from total score progression
                    const partnerships: any[] = [];

                    // If there's a current partnership ongoing
                    if (inning.striker && inning.nonStriker && !inning.isCompleted) {
                      const striker = inning.battingStats?.find(
                        (s: any) => s.playerId._id === inning.striker._id
                      );
                      const nonStriker = inning.battingStats?.find(
                        (s: any) => s.playerId._id === inning.nonStriker._id
                      );

                      if (striker && nonStriker) {
                        // For current partnership, use total score (includes extras)
                        // minus runs from batsmen who got out
                        const outBatsmenRuns = (inning.battingStats || [])
                          .filter((s: any) => s.isOut)
                          .reduce((sum: number, s: any) => sum + s.runs, 0);

                        const currentPartnershipRuns = (inning.totalRuns || 0) - outBatsmenRuns;

                        partnerships.push({
                          player1: striker,
                          player2: nonStriker,
                          runs: Math.max(0, currentPartnershipRuns),
                          wicket: (inning.totalWickets || 0) + 1,
                          current: true,
                        });
                      }
                    }

                    return partnerships.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center border-b border-gray-200 pb-2"
                      >
                        <span className="text-gray-700">
                          {p.player1.playerId.userId?.name} -{" "}
                          {p.player2.playerId.userId?.name}
                        </span>
                        <span
                          className={`font-semibold ${
                            p.current ? "text-blue-600" : ""
                          }`}
                        >
                          {p.runs} runs{p.current ? " *" : ""}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </Card>

          {/* First Inning Scoreboard (when in second inning) */}
          {match?.currentInning === 2 && firstInning && (
            <Card>
              <h2 className="sm:text-xl text-lg  font-bold mb-4 sm:text-left text-center">
                First Inning Scoreboard
              </h2>
              <div className="text-center">
                <p className="sm:text-2xl text-xl font-bold">
                  {firstInning.battingTeam.name}: {firstInning.totalRuns}/
                  {firstInning.totalWickets}
                </p>
                <p className="text-lg text-gray-600">
                  Overs:{" "}
                  {Math.floor(
                    firstInning.currentOver + firstInning.currentBall / 6
                  )}
                  .{firstInning.currentBall % 6}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Target: {firstInning.totalRuns + 1} runs
                </p>
              </div>
            </Card>
          )}

          <Card>
            <div className="text-center mb-6">
              <h2 className="text-5xl font-bold mb-2">
                {inning?.totalRuns}/{inning?.totalWickets}
              </h2>
              <p className="text-xl text-gray-600">
                {inning?.currentOver}.{inning?.currentBall} overs
              </p>
            </div>

            <div className="grid grid-cols-2 sm:gap-4 mb-6">
              <div className="border-r border-gray-600 pr-4">
                <h3 className="font-semibold mb-2">Striker</h3>
                <p className="sm:text-lg flex">
                  <div className="sm:mr-5 mr-2">
                    {truncateString(inning?.striker?.userId.name, 16) + "* " ||
                      "N/A"}
                  </div>
                  {inning?.striker
                    ? `${getBatsmanStats(inning.striker._id).runs}(${
                        getBatsmanStats(inning.striker._id).balls
                      })`
                    : ""}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 sm:text-left text-right">
                  Non-Striker
                </h3>
                <p className="flex sm:text-lg sm:justify-start justify-end">
                  <div className="sm:mr-5 mr-2 ">
                    {truncateString(inning?.nonStriker?.userId.name, 16) ||
                      "N/A"}
                  </div>
                  {inning?.nonStriker
                    ? `${getBatsmanStats(inning.nonStriker._id).runs}(${
                        getBatsmanStats(inning.nonStriker._id).balls
                      })`
                    : ""}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Current Bowler</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg">
                    {inning?.currentBowler?.userId.name || "N/A"}
                  </p>
                  {inning?.currentBowler && (
                    <p className="text-sm text-gray-600">
                      Balls:{" "}
                      {Math.floor(
                        getBowlerStats(inning.currentBowler._id).balls / 6
                      )}
                      .{getBowlerStats(inning.currentBowler._id).balls % 6}{" "}
                      Runs: {getBowlerStats(inning.currentBowler._id).runs}{" "}
                      <br className="sm:hidden" />
                      Economy:{" "}
                      {getBowlerStats(inning.currentBowler._id).economy}{" "}
                      Wickets:{" "}
                      {getBowlerStats(inning.currentBowler._id).wickets}
                    </p>
                  )}
                </div>
                {match?.status === "live" && canScore && (
                  <Button
                    variant="secondary"
                    onClick={() => setShowBowlerModal(true)}
                  >
                    Change
                  </Button>
                )}
              </div>
            </div>

            {match?.status === "live" && canScore && !checkAllPlayersOut() && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Quick Actions
                </label>
                <div className="grid sm:grid-cols-4 grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleWideClick}
                    isLoading={isAddingBall}
                  >
                    Wide (+1)
                  </Button>
                  <Button
                    variant={ballType === "noBall" ? "primary" : "secondary"}
                    onClick={() => setBallType("noBall")}
                  >
                    No Ball
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleAddBall(0, "wicket")}
                    isLoading={isAddingBall}
                  >
                    Wicket
                  </Button>
                  <Button
                    variant={ballType === "normal" ? "primary" : "secondary"}
                    onClick={() => setBallType("normal")}
                  >
                    Normal
                  </Button>
                </div>
              </div>
            )}

            {match?.status === "live" && canScore && !checkAllPlayersOut() && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Add Runs {ballType !== "normal" && `(${ballType})`}
                </label>
                <div className="grid sm:grid-cols-4 grid-cols-3 gap-2">
                  {[0, 1, 2, 3, 4, 6].map((runs) => (
                    <Button
                      key={runs}
                      onClick={() => handleAddBall(runs, ballType)}
                      isLoading={isAddingBall}
                      className="text-2xl h-16"
                    >
                      {runs}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {match?.status === "live" && canScore && (
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="danger"
                  onClick={() => inning && undoLastBall(inning._id)}
                >
                  Undo Last Ball
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => inning && swapStrike(inning._id)}
                >
                  Swap Strike
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowBatsmanModal(true)}
                  disabled={checkAllPlayersOut()}
                >
                  Change Batsman
                </Button>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Current Over</h3>
              {inning?.balls && inning.balls.length > 0 && (
                <span className="text-sm font-semibold text-gray-700">
                  {inning.balls
                    .filter(
                      (ball) =>
                        ball.overNumber === inning.currentOver && ball.isValid
                    )
                    .reduce((total, ball) => total + (ball.runs || 0), 0)}{" "}
                  runs
                </span>
              )}
            </div>
            <div className="flex gap-2 mb-6 flex-wrap">
              {inning?.balls && inning.balls.length > 0 ? (
                inning.balls
                  .filter(
                    (ball) =>
                      ball.overNumber === inning.currentOver && ball.isValid
                  )
                  .map((ball) => (
                    <div
                      key={ball._id}
                      className={`w-12 h-12 flex items-center justify-center rounded font-bold text-lg ${
                        ball.ballType === "wicket"
                          ? "bg-red-500 text-white"
                          : ball.ballType === "wide" ||
                            ball.ballType === "noBall"
                          ? "bg-yellow-500 text-white"
                          : ball.runs === 4
                          ? "bg-blue-500 text-white"
                          : ball.runs === 6
                          ? "bg-purple-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {ball.ballType === "wicket"
                        ? "W"
                        : ball.ballType === "wide"
                        ? `${ball.runs}Wd`
                        : ball.ballType === "noBall"
                        ? `${ball.runs}Nb`
                        : ball.runs}
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-sm">No balls bowled yet</p>
              )}
            </div>

            <h3 className="font-semibold mb-2">Extras</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Wides</p>
                <p className="text-lg font-semibold">{inning?.extras.wides}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">No Balls</p>
                <p className="text-lg font-semibold">
                  {inning?.extras.noBalls}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Byes</p>
                <p className="text-lg font-semibold">{inning?.extras.byes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Leg Byes</p>
                <p className="text-lg font-semibold">
                  {inning?.extras.legByes}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Previous Overs</h3>
            <div className="space-y-4">
              {inning?.balls && inning.balls.length > 0 ? (
                Array.from(
                  new Set(
                    inning.balls
                      .filter((ball) => ball.overNumber < inning.currentOver)
                      .map((ball) => ball.overNumber)
                  )
                )
                  .sort((a, b) => b - a) // Show latest overs first
                  .map((overNumber) => {
                    const overBalls = inning.balls?.filter(
                      (ball) =>
                        ball.overNumber === overNumber && ball.isValid
                    ) || [];
                    const overRuns = overBalls.reduce(
                      (total, ball) => total + (ball.runs || 0),
                      0
                    );
                    return (
                      <div key={overNumber} className="flex items-center gap-4">
                        <span className="font-medium text-sm w-12">
                          Over {overNumber + 1}:
                        </span>
                        <div className="flex sm:gap-2 gap-1 flex-wrap flex-1">
                          {overBalls.map((ball) => (
                            <div
                              key={ball._id}
                              className={`sm:w-10 sm:h-10 w-8 h-8 flex items-center justify-center rounded font-bold text-sm ${
                                ball.ballType === "wicket"
                                  ? "bg-red-500 text-white"
                                  : ball.ballType === "wide" ||
                                    ball.ballType === "noBall"
                                  ? "bg-yellow-500 text-white"
                                  : ball.runs === 4
                                  ? "bg-blue-500 text-white"
                                  : ball.runs === 6
                                  ? "bg-purple-500 text-white"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {ball.ballType === "wicket"
                                ? "W"
                                : ball.ballType === "wide"
                                ? `${ball.runs}Wd`
                                : ball.ballType === "noBall"
                                ? `${ball.runs}Nb`
                                : ball.runs}
                            </div>
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-700 ml-auto">
                          {overRuns} runs
                        </span>
                      </div>
                    );
                  })
              ) : (
                <p className="text-gray-500 text-sm">No previous overs</p>
              )}
            </div>
          </Card>

          {match?.status !== "completed" && canScore && (
            <Card>
              <div className="text-center space-y-3">
                <h3 className="font-semibold mb-4">Match Controls</h3>

                {/* Change Inning Button - only show in first inning */}
                {match?.currentInning === 1 && match?.status === "live" && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={handleChangeInning}
                      className="w-full"
                    >
                      Change Inning
                    </Button>
                    <p className="text-sm text-gray-500">
                      Start the second inning manually
                    </p>
                  </>
                )}

                <Button
                  variant="danger"
                  onClick={handleEndMatch}
                  className="w-full"
                  isLoading={isEndingMatch}
                >
                  End Match
                </Button>
                <p className="text-sm text-gray-500">
                  Use this to manually end the match before completion
                </p>
              </div>
            </Card>
          )}

          {match?.status === "completed" && (
            <Card>
              <div className="text-center">
                <h3 className="font-semibold text-xl mb-2">Match Completed</h3>
                <p className="text-lg text-green-600 font-semibold mb-4">
                  {match.resultText || "Match has ended"}
                </p>
                {match.winner && (
                  <p className="text-gray-600 mb-3">Winner: {match.winner.name}</p>
                )}
                {match.playerOfTheMatch && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Player of the Match</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {match.playerOfTheMatch.userId?.name || "N/A"}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {(() => {
            // Calculate team players only when inning is active
            const bowlingTeamPlayers =
              match?.teamA._id === inning?.bowlingTeam?._id
                ? match?.teamA.players || []
                : match?.teamB.players || [];

            const battingTeamPlayers =
              match?.teamA._id === inning?.battingTeam?._id
                ? match?.teamA.players || []
                : match?.teamB.players || [];

            return (
              <>
                <Modal
                  isOpen={showEndMatchModal}
                  onClose={() => setShowEndMatchModal(false)}
                  title="End Match Confirmation"
                >
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Are you sure you want to end this match? This action
                      cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="danger"
                        onClick={confirmEndMatch}
                        className="flex-1"
                        isLoading={isEndingMatch}
                      >
                        Yes, End Match
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setShowEndMatchModal(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Modal>

                <Modal
                  isOpen={showChangeInningModal && user?.role !== "player"}
                  onClose={() => setShowChangeInningModal(false)}
                  title="Start Second Inning"
                >
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      {checkAllPlayersOut()
                        ? `All ${
                            currentInningBattingTeam?.players?.length || 0
                          } players are out! The inning has ended.`
                        : "End the first inning and start the second inning."}
                    </p>

                    <div className="bg-gray-100 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>{inning?.battingTeam.name}</strong>
                      </p>
                      <p className="text-2xl font-bold">
                        {inning?.totalRuns}/{inning?.totalWickets}
                      </p>
                      <p className="text-sm text-gray-600">
                        Overs: {inning?.currentOver}.{inning?.currentBall}
                      </p>
                      {checkAllPlayersOut() && (
                        <p className="text-red-600 font-semibold mt-2">
                          All Out ({inning?.totalWickets}/
                          {currentInningBattingTeam?.players?.length || 0})
                        </p>
                      )}
                    </div>

                    {/* ✅ ADD PLAYER SELECTION */}
                    <div className="space-y-4 border-t pt-4">
                      <p className="font-semibold">
                        Select players for second inning:
                      </p>

                      <Select
                        label={`Striker (${currentInningBowlingTeam?.name})`}
                        value={inningStriker}
                        onChange={(e) => setInningStriker(e.target.value)}
                        options={[
                          { value: "", label: "Select Striker" },
                          ...(currentInningBowlingTeam?.players || []).map(
                            (playerId: string) => {
                              const player = players.find(
                                (p) => p._id === playerId
                              );
                              return {
                                value: playerId,
                                label: player?.userId.name || "",
                              };
                            }
                          ),
                        ]}
                      />

                      <Select
                        label={`Non-Striker (${currentInningBowlingTeam?.name})`}
                        value={inningNonStriker}
                        onChange={(e) => setInningNonStriker(e.target.value)}
                        options={[
                          { value: "", label: "Select Non-Striker" },
                          ...(currentInningBowlingTeam?.players || [])
                            .filter((id: string) => id !== inningStriker)
                            .map((playerId: string) => {
                              const player = players.find(
                                (p) => p._id === playerId
                              );
                              return {
                                value: playerId,
                                label: player?.userId.name || "",
                              };
                            }),
                        ]}
                      />

                      <Select
                        label={`Bowler (${currentInningBattingTeam?.name})`}
                        value={inningBowler}
                        onChange={(e) => setInningBowler(e.target.value)}
                        options={[
                          { value: "", label: "Select Bowler" },
                          ...(currentInningBattingTeam?.players || []).map(
                            (playerId: string) => {
                              const player = players.find(
                                (p) => p._id === playerId
                              );
                              return {
                                value: playerId,
                                label: player?.userId.name || "",
                              };
                            }
                          ),
                        ]}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={confirmChangeInning}
                        className="flex-1"
                        isLoading={isStartingInning}
                        disabled={
                          !inningStriker || !inningNonStriker || !inningBowler
                        }
                      >
                        Start Second Inning
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setShowChangeInningModal(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Modal>

                <Modal
                  isOpen={showBowlerModal}
                  onClose={() => setShowBowlerModal(false)}
                  title="Change Bowler"
                >
                  <div className="space-y-4">
                    <Select
                      label="Select New Bowler"
                      value={newBowlerId}
                      onChange={(e) => setNewBowlerId(e.target.value)}
                      options={[
                        { value: "", label: "Select Bowler" },
                        ...bowlingTeamPlayers
                          .filter(
                            (id: string) => id !== inning?.currentBowler?._id
                          )
                          .map((playerId: string) => {
                            const player = players.find(
                              (p) => p._id === playerId
                            );
                            return {
                              value: playerId,
                              label: player?.userId.name || "",
                            };
                          }),
                      ]}
                    />
                    <Button onClick={handleChangeBowler} className="w-full">
                      Confirm
                    </Button>
                  </div>
                </Modal>

                <Modal
                  isOpen={showBatsmanModal}
                  onClose={() => setShowBatsmanModal(false)}
                  title="Change Batsman"
                >
                  <div className="space-y-4">
                    <Select
                      label="Select New Batsman"
                      value={newBatsmanId}
                      onChange={(e) => setNewBatsmanId(e.target.value)}
                      options={[
                        { value: "", label: "Select Batsman" },
                        ...battingTeamPlayers
                          .filter((id: string) => {
                            // Filter out current batsmen
                            if (
                              id === inning?.striker?._id ||
                              id === inning?.nonStriker?._id
                            ) {
                              return false;
                            }
                            // Filter out dismissed batsmen
                            const dismissedPlayer = inning?.battingStats?.find(
                              (stat: any) =>
                                stat.playerId._id === id && stat.isOut
                            );
                            return !dismissedPlayer;
                          })
                          .map((playerId: string) => {
                            const player = players.find(
                              (p) => p._id === playerId
                            );
                            return {
                              value: playerId,
                              label: player?.userId.name || "",
                            };
                          }),
                      ]}
                    />
                    <Button onClick={handleChangeBatsman} className="w-full">
                      Confirm
                    </Button>
                  </div>
                </Modal>

                <WicketModal
                  isOpen={showWicketModal}
                  onClose={() => setShowWicketModal(false)}
                  onConfirm={handleWicketConfirm}
                  availableBatsmen={availableBatsmen}
                  bowlingTeamPlayers={
                    bowlingTeamPlayers
                      .map((id: string) => players.find((p) => p._id === id))
                      .filter(Boolean) || []
                  }
                />
              </>
            );
          })()}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

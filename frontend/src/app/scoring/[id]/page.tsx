/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import { statsService, InningScorecard } from "@/services/statsService";
import { truncateString } from "@/utils/truncateString";
import { BattingScorecard } from "@/components/scoreboard/BattingScorecard";
import { BowlingScorecard } from "@/components/scoreboard/BowlingScorecard";
import { MatchHeader } from "@/components/scoreboard/MatchHeader";
import { formatISODate } from "@/utils/dateFormatter";

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
  const [previousBall, setPreviousBall] = useState<number>(0);
  const [innings, setInnings] = useState<InningScorecard[]>([]);
  const [selectedInning, setSelectedInning] = useState<1 | 2>(1);

  const firstInning = match?.innings?.find((i: any) => i.inningNumber === 1);

  // Load innings data for MatchHeader
  useEffect(() => {
    const loadInnings = async () => {
      try {
        const data = await statsService.getMatchScorecard(matchId);
        setInnings(data);
      } catch (error) {
        console.error("Failed to load innings:", error);
      }
    };
    loadInnings();
  }, [matchId, inning?.totalRuns, inning?.totalWickets]);

  // Short polling for player role and non-logged-in users - fetch inning score every 5 seconds
  useEffect(() => {
    // Don't poll if user is loading
    if (isLoadingUser) {
      return;
    }

    // Don't poll for scorer or owner roles
    if (user?.role === "scorer" || user?.role === "owner") {
      return;
    }

    // Don't poll if match is not live
    if (match?.status !== "live") {
      return;
    }

    // Poll for player role or non-logged-in users (user is null/undefined)
    const pollInterval = setInterval(async () => {
      try {
        const data = await statsService.getMatchScorecard(matchId);
        setInnings(data);
      } catch (error) {
        console.error("Failed to poll innings data:", error);
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(pollInterval);
  }, [user?.role, match?.status, matchId, isLoadingUser]);

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

    // All out when all players are dismissed
    // Last man can bat from both ends, so all out = totalPlayers wickets
    // For 5 players: max 5 wickets, for 11 players: max 11 wickets
    return totalWickets >= totalPlayers;
  };

  const getDismissalText = (stat: any) => {
    if (!stat.isOut) return "not out";

    switch (stat.dismissalType) {
      case "bowled":
        return `b ${stat.dismissedBy?.userId?.name || ""}`;
      case "caught":
        return `c ${stat.fielder?.userId?.name || ""} b ${
          stat.dismissedBy?.userId?.name || ""
        }`;
      case "lbw":
        return `lbw b ${stat.dismissedBy?.userId?.name || ""}`;
      case "stumped":
        return `st ${stat.fielder?.userId?.name || ""} b ${
          stat.dismissedBy?.userId?.name || ""
        }`;
      case "runOut":
        return "run out";
      case "hitWicket":
        return "hit wicket";
      default:
        return stat.dismissalType;
    }
  };

  // Auto-show Change Bowler modal when over ends
  useEffect(() => {
    if (inning && match?.status === "live" && !checkAllPlayersOut()) {
      // Check if over just completed (currentBall is 0 and previous was 5)
      if (inning.currentBall === 0 && previousBall === 5) {
        setShowBowlerModal(true);
      }
      setPreviousBall(inning.currentBall);
    }
  }, [inning?.currentBall, match?.status]);

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
    const runs =
      data.wicketType === "runOut" && data.runOutRuns !== undefined
        ? data.runOutRuns
        : 0;

    // Send wicket ball with new batsman ID in a single request
    addBall({
      inningId: inning._id,
      runs,
      ballType: "wicket",
      wicketType: data.wicketType,
      fielder: data.fielderId,
      newBatsmanId: data.newBatsmanId || undefined,
    });

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

  // Get the last over's bowler
  const getLastOverBowler = () => {
    if (!inning?.balls || inning.balls.length === 0) return null;

    const currentOver = inning.currentOver;
    const lastOverNumber = currentOver > 0 ? currentOver - 1 : -1;

    if (lastOverNumber < 0) return null;

    const lastOverBalls = inning.balls.filter(
      (ball) => ball.overNumber === lastOverNumber && ball.isValid
    );

    return lastOverBalls.length > 0 ? lastOverBalls[0].bowler._id : null;
  };

  // Check if current bowler is same as last over bowler
  const isSameBowlerAsLastOver = () => {
    const lastOverBowlerId = getLastOverBowler();
    return (
      lastOverBowlerId !== null &&
      inning?.currentBowler?._id === lastOverBowlerId
    );
  };

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
        if (
          ball.ballType === "normal" ||
          ball.ballType === "wicket" ||
          ball.ballType === "noBall"
        ) {
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
        // Count only valid balls (normal balls, wickets, byes, legByes - not wides or no-balls)
        if (ball.ballType !== "wide" && ball.ballType !== "noBall") {
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
      <Layout>
        <div className="max-w-2xl mx-auto">
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
                        const player = players.find((p) => p._id === playerId);
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
                        const player = players.find((p) => p._id === playerId);
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
                        const player = players.find((p) => p._id === playerId);
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
                  Start {match?.currentInning === 1 ? "First" : "Second"} Inning
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
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* <div>
          <h1 className="sm:text-2xl text-lg sm:text-left text-center font-bold mb-4">
            {match?.teamA.name} <br className="sm:hidden" />{" "}
            <span className="font-medium sm:font-bold text-gray-500">vs</span>{" "}
            <br className="sm:hidden" /> {match?.teamB.name}
          </h1>
          <div className="grid sm:grid-cols-2 gap-4 ">
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
                Overs: {inning?.currentOver}.{inning?.currentBall} /{" "}
                {match?.overs}
              </p>
            </div>
          </div>
        </div> */}
        {/* Match Header */}
        {match && (
          <MatchHeader
            date={formatISODate(match.createdAt)}
            teamA={match.teamA}
            teamB={match.teamB}
            innings={innings}
            resultText={match.resultText}
            matchStatus={match.status}
            isLive={true}
          />
        )}

        {/* Innings Selector */}
        {innings.length > 0 && (
          <div className="flex sm:gap-2 justify-center">
            {innings.map((inningData) => (
              <button
                key={inningData.inningNumber}
                onClick={() =>
                  setSelectedInning(inningData.inningNumber as 1 | 2)
                }
                className={`sm:w-auto border-b-3 p-2 w-[50%] sm:rounded-md rounded-none ${
                  selectedInning === inningData.inningNumber
                    ? "border-green-500 "
                    : "border-gray-200"
                }`}
              >
                <span
                  className={`${
                    selectedInning === inningData.inningNumber
                      ? " font-semibold text-black"
                      : ""
                  } text-sm`}
                >
                  {inningData.battingTeam.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Inning Scoreboard - Shows selected inning data */}
        {(() => {
          const currentInningData = innings.find(
            (i) => i.inningNumber === selectedInning
          );

          if (!currentInningData) return null;

          return (
            <div>
              {/* Batting Scorecard */}
              {currentInningData.battingStats &&
                currentInningData.battingStats.length > 0 && (
                  <BattingScorecard
                    battingStats={currentInningData.battingStats}
                    captainId={
                      typeof currentInningData.battingTeam?.captain === "string"
                        ? currentInningData.battingTeam?.captain
                        : currentInningData.battingTeam?.captain?._id
                    }
                    getDismissalText={getDismissalText}
                  />
                )}

              {/* Bowling Scorecard */}
              <div className="mt-5">
                {currentInningData.bowlingStats &&
                  currentInningData.bowlingStats.length > 0 && (
                    <BowlingScorecard
                      bowlingStats={currentInningData.bowlingStats}
                    />
                  )}
              </div>

              {/* Partnerships */}
              {/* <div className="mt-5">
                {currentInningData.battingStats &&
                  currentInningData.battingStats.length >= 1 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-3">Partnerships</h3>
                      <div className="space-y-2 text-sm">
                        {(() => {
                          const partnerships: any[] = [];

                          // If this is the current live inning, show current partnership
                          if (
                            selectedInning === match?.currentInning &&
                            inning?.striker &&
                            inning?.nonStriker &&
                            !inning.isCompleted
                          ) {
                            const striker =
                              currentInningData.battingStats?.find(
                                (s: any) =>
                                  s.playerId._id === inning.striker._id
                              );
                            const nonStriker =
                              currentInningData.battingStats?.find(
                                (s: any) =>
                                  s.playerId._id === inning.nonStriker._id
                              );

                            if (striker && nonStriker) {
                              const outBatsmenRuns = (
                                currentInningData.battingStats || []
                              )
                                .filter((s: any) => s.isOut)
                                .reduce(
                                  (sum: number, s: any) => sum + s.runs,
                                  0
                                );

                              const currentPartnershipRuns =
                                (currentInningData.totalRuns || 0) -
                                outBatsmenRuns;

                              partnerships.push({
                                player1: striker,
                                player2: nonStriker,
                                runs: Math.max(0, currentPartnershipRuns),
                                wicket:
                                  (currentInningData.totalWickets || 0) + 1,
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
              </div> */}
            </div>
          );
        })()}

        <div className="pt-6">
          <div className="text-center mb-6 ">
            <h2 className="text-4xl font-bold mb-1 pt-2">
              {inning?.totalRuns}/{inning?.totalWickets}
            </h2>
            <p className="text-lg text-gray-600">
              {inning?.currentOver}.{inning?.currentBall} overs
            </p>
            {/* Show required runs for second inning when <= 30 runs needed */}
            {match?.currentInning === 2 &&
              inning &&
              firstInning &&
              !inning.isCompleted &&
              (() => {
                const target = (firstInning.totalRuns || 0) + 1;
                const runsNeeded = target - (inning.totalRuns || 0);
                const totalBalls = (match?.overs || 0) * 6;
                const ballsPlayed =
                  (inning.currentOver || 0) * 6 + (inning.currentBall || 0);
                const ballsRemaining = totalBalls - ballsPlayed;

                if (runsNeeded > 0 && runsNeeded <= 30) {
                  return (
                    <p className="text-blue-600 font-semibold mt-2 text-md">
                      Need {runsNeeded} run{runsNeeded !== 1 ? "s" : ""} in{" "}
                      {ballsRemaining} ball{ballsRemaining !== 1 ? "s" : ""}
                    </p>
                  );
                }
                return null;
              })()}
          </div>

          <div className="grid grid-cols-2 sm:gap-4 mb-6">
            <div className="border-r border-gray-400 pr-4">
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
                  {truncateString(inning?.nonStriker?.userId.name, 16) || "N/A"}
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
                    .{getBowlerStats(inning.currentBowler._id).balls % 6} Runs:{" "}
                    {getBowlerStats(inning.currentBowler._id).runs}{" "}
                    <br className="sm:hidden" />
                    Economy: {
                      getBowlerStats(inning.currentBowler._id).economy
                    }{" "}
                    Wickets: {getBowlerStats(inning.currentBowler._id).wickets}
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
            {isSameBowlerAsLastOver() && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mt-3">
                <p className="text-sm font-semibold">
                  ⚠️ Change bowler! The same bowler cannot bowl for 2
                  consecutive overs.
                </p>
              </div>
            )}
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
                  disabled={isSameBowlerAsLastOver()}
                >
                  Wide (+1)
                </Button>
                <Button
                  variant={ballType === "noBall" ? "primary" : "secondary"}
                  onClick={() => setBallType("noBall")}
                  disabled={isSameBowlerAsLastOver()}
                >
                  No Ball
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleAddBall(0, "wicket")}
                  isLoading={isAddingBall}
                  disabled={isSameBowlerAsLastOver()}
                >
                  Wicket
                </Button>
                <Button
                  variant={ballType === "normal" ? "primary" : "secondary"}
                  onClick={() => setBallType("normal")}
                  disabled={isSameBowlerAsLastOver()}
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
                    disabled={isSameBowlerAsLastOver()}
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
        </div>

        <div>
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
                    className={`sm:w-12 sm:h-12 w-10 h-10 flex items-center justify-center rounded font-bold text-lg ${
                      ball.ballType === "wicket"
                        ? "bg-red-500 text-white"
                        : ball.ballType === "wide" || ball.ballType === "noBall"
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
          <div className="flex w-full items-center">
            <div className="flex-1 flex items-center gap-2">
              <p className="text-sm text-gray-600">Wides:</p>
              <p className="text-lg font-semibold">{inning?.extras.wides}</p>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <p className="text-sm text-gray-600">No Balls:</p>
              <p className="text-lg font-semibold">{inning?.extras.noBalls}</p>
            </div>
            {/* <div>
              <p className="text-sm text-gray-600">Byes</p>
              <p className="text-lg font-semibold">{inning?.extras.byes}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Leg Byes</p>
              <p className="text-lg font-semibold">{inning?.extras.legByes}</p>
            </div> */}
          </div>

          <div className="mt-2">
            <h3 className="font-semibold">Total Over: {match.overs}</h3>
          </div>
        </div>

        {inning && inning?.balls && inning.balls.length > 6 && (
          <div>
            <h3 className="font-semibold mb-4">Previous Overs</h3>
            <div className="space-y-3">
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
                    const overBalls =
                      inning.balls?.filter(
                        (ball) => ball.overNumber === overNumber && ball.isValid
                      ) || [];
                    const overRuns = overBalls.reduce(
                      (total, ball) => total + (ball.runs || 0),
                      0
                    );
                    const bowlerName =
                      overBalls[0]?.bowler?.userId?.name || "Unknown";
                    return (
                      <div
                        key={overNumber}
                        className="border-b-2 border-gray-200 pb-3 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              Over {overNumber + 1}
                            </span>
                            <span className="text-sm text-gray-600">
                              {bowlerName}
                            </span>
                          </div>
                          <div className="bg-gray-100 px-2 py-0.5 rounded-xs">
                            <span className="text-sm font-bold text-gray-700">
                              {overRuns} run{overRuns !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        <div className="flex sm:gap-2 gap-1 flex-wrap">
                          {overBalls.map((ball) => (
                            <div
                              key={ball._id}
                              className={`sm:w-10 sm:h-10 w-8 h-8 flex items-center justify-center rounded-xs font-bold text-sm shadow-sm ${
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
                      </div>
                    );
                  })
              ) : (
                <p className="text-gray-500 text-sm">No previous overs</p>
              )}
            </div>
          </div>
        )}

        {match?.status !== "completed" && canScore && (
          <div>
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
          </div>
        )}

        {match?.status === "completed" && (
          <div>
            <div className="text-center">
              <h3 className="font-semibold text-xl mb-2">Match Completed</h3>
              <p className="text-lg text-green-600 font-semibold mb-4">
                {match.resultText || "Match has ended"}
              </p>
              {match.winner && (
                <p className="text-gray-600 mb-3">
                  Winner: {match.winner.name}
                </p>
              )}
              {match.playerOfTheMatch && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">
                    Player of the Match
                  </p>
                  <p className="text-lg font-semibold text-blue-600">
                    {match.playerOfTheMatch.userId?.name || "N/A"}
                  </p>
                </div>
              )}
            </div>
          </div>
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
                    Are you sure you want to end this match? This action cannot
                    be undone.
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
                  {inning?.currentBall !== 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                      <p className="text-sm">
                        Current bowler&apos;s over is not completed. You cannot
                        change the bowler until the over is finished.
                      </p>
                    </div>
                  )}
                  {newBowlerId && newBowlerId === getLastOverBowler() && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                      <p className="text-sm font-semibold">
                        Change bowler! The same bowler cannot bowl for 2
                        consecutive overs.
                      </p>
                    </div>
                  )}
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
                    disabled={inning?.currentBall !== 0}
                  />
                  <Button
                    onClick={handleChangeBowler}
                    className="w-full"
                    disabled={
                      inning?.currentBall !== 0 ||
                      !newBowlerId ||
                      newBowlerId === getLastOverBowler()
                    }
                  >
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
  );
}

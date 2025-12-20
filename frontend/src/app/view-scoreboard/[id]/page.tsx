/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useMatch } from "@/hooks/useMatches";
import { usePlayers } from "@/hooks/usePlayers";
import { formatISODate } from "@/utils/dateFormatter";

export default function ScoreboardPage() {
  const params = useParams();
  const matchId = params.id as string;
  const { match, isLoading } = useMatch(matchId);
  const { players } = usePlayers();
  const [selectedInning, setSelectedInning] = useState<1 | 2>(1);

  const currentInning = match?.innings?.find(
    (i: any) => i.inningNumber === selectedInning
  );

  // Get batsman statistics
  const getBatsmanStats = (playerId: string, inning: any) => {
    if (!inning?.balls)
      return { runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0 };
    let runs = 0;
    let balls = 0;
    let fours = 0;
    let sixes = 0;

    inning.balls.forEach((ball: any) => {
      if (ball.batsman._id === playerId) {
        if (ball.ballType === "normal" || ball.ballType === "wicket") {
          balls += 1;
        }
        if (ball.ballType !== "wide" && ball.ballType !== "noBall") {
          runs += ball.runs;
        }
        if (ball.runs === 4) fours++;
        if (ball.runs === 6) sixes++;
      }
    });

    const strikeRate = balls > 0 ? ((runs / balls) * 100).toFixed(2) : "0.00";
    return { runs, balls, fours, sixes, strikeRate };
  };

  // Get bowler statistics
  const getBowlerStats = (playerId: string, inning: any) => {
    if (!inning?.balls)
      return {
        balls: 0,
        runs: 0,
        wickets: 0,
        overs: "0.0",
        economy: "0.0",
        maidens: 0,
      };
    let balls = 0;
    let runs = 0;
    let wickets = 0;

    inning.balls.forEach((ball: any) => {
      if (ball.bowler._id === playerId) {
        if (ball.ballType === "normal" || ball.ballType === "wicket") {
          balls += 1;
        }
        runs += ball.runs;
        if (ball.ballType === "wicket") {
          wickets += 1;
        }
      }
    });

    const oversComplete = Math.floor(balls / 6);
    const ballsRemaining = balls % 6;
    const overs = `${oversComplete}.${ballsRemaining}`;
    const economy = balls > 0 ? ((runs / balls) * 6).toFixed(2) : "0.00";

    return { balls, runs, wickets, overs, economy, maidens: 0 };
  };

  // Get all unique batsmen who played
  const getAllBatsmen = (inning: any) => {
    if (!inning?.balls) return [];
    const batsmenIds = new Set<string>();
    inning.balls.forEach((ball: any) => {
      batsmenIds.add(ball.batsman._id);
    });
    return Array.from(batsmenIds);
  };

  // Get all unique bowlers who bowled
  const getAllBowlers = (inning: any) => {
    if (!inning?.balls) return [];
    const bowlerIds = new Set<string>();
    inning.balls.forEach((ball: any) => {
      bowlerIds.add(ball.bowler._id);
    });
    return Array.from(bowlerIds);
  };

  // Get fall of wickets
  const getFallOfWickets = (inning: any) => {
    if (!inning?.balls) return [];
    const wickets: any[] = [];
    let currentRuns = 0;
    let currentWickets = 0;

    inning.balls.forEach((ball: any) => {
      if (ball.ballType !== "wide" && ball.ballType !== "noBall") {
        currentRuns += ball.runs;
      }
      if (ball.ballType === "wicket") {
        currentWickets++;
        const overNumber = ball.overNumber;
        const ballNumber = ball.ballNumber;
        wickets.push({
          wicketNumber: currentWickets,
          runs: currentRuns,
          batsman: ball.batsman.userId.name,
          over: `${overNumber}.${ballNumber}`,
        });
      }
    });

    return wickets;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg">Loading scoreboard...</p>
        </div>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout>
        <Card className="max-w-2xl mx-auto">
          <p className="text-center text-gray-600">Match not found</p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Match Header */}
        <Card>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              {match.teamA.name} vs {match.teamB.name}
            </h1>
            <p className="text-gray-600 mb-4">
              {formatISODate(match.createdAt)}
            </p>
            {match.status === "completed" && match.resultText && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
                <p className="text-lg font-semibold text-green-700">
                  {match.resultText}
                </p>
              </div>
            )}
            {match.status !== "completed" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                <p className="text-lg font-semibold text-blue-700">
                  Match In Progress
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Innings Selector */}
        {match.innings && match.innings.length > 0 && (
          <Card>
            <div className="flex gap-2 justify-center">
              {match.innings.map((inning: any) => (
                <Button
                  key={inning.inningNumber}
                  variant={
                    selectedInning === inning.inningNumber
                      ? "primary"
                      : "secondary"
                  }
                  onClick={() =>
                    setSelectedInning(inning.inningNumber as 1 | 2)
                  }
                >
                  {inning.inningNumber === 1 ? "1st" : "2nd"} Innings
                </Button>
              ))}
            </div>
          </Card>
        )}

        {currentInning && (
          <>
            {/* Score Summary */}
            <Card>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  {currentInning.battingTeam.name}
                </h2>
                <p className="text-5xl font-bold text-blue-600 mb-2">
                  {currentInning.totalRuns}/{currentInning.totalWickets}
                </p>
                <p className="text-xl text-gray-600">
                  ({currentInning.currentOver}.{currentInning.currentBall}{" "}
                  overs)
                </p>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Run Rate:{" "}
                    {(
                      currentInning.totalRuns /
                      (currentInning.currentOver +
                        currentInning.currentBall / 6 || 1)
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Batting Scorecard */}
            <Card>
              <h3 className="text-xl font-bold mb-4">Batting</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Batsman</th>
                      <th className="text-center py-2 px-2">R</th>
                      <th className="text-center py-2 px-2">B</th>
                      <th className="text-center py-2 px-2">4s</th>
                      <th className="text-center py-2 px-2">6s</th>
                      <th className="text-center py-2 px-2">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAllBatsmen(currentInning).map((batsmanId) => {
                      const stats = getBatsmanStats(batsmanId, currentInning);
                      const player = players.find((p) => p._id === batsmanId);
                      const isStriker =
                        currentInning.striker?._id === batsmanId;
                      const isNonStriker =
                        currentInning.nonStriker?._id === batsmanId;

                      return (
                        <tr
                          key={batsmanId}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-2">
                            {player?.userId.name || "Unknown"}
                            {isStriker && (
                              <span className="ml-2 text-xs text-blue-600">
                                *
                              </span>
                            )}
                            {isNonStriker && (
                              <span className="ml-2 text-xs text-gray-600">
                                †
                              </span>
                            )}
                          </td>
                          <td className="text-center py-3 px-2 font-semibold">
                            {stats.runs}
                          </td>
                          <td className="text-center py-3 px-2">
                            {stats.balls}
                          </td>
                          <td className="text-center py-3 px-2">
                            {stats.fours}
                          </td>
                          <td className="text-center py-3 px-2">
                            {stats.sixes}
                          </td>
                          <td className="text-center py-3 px-2">
                            {stats.strikeRate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Extras</p>
                    <p className="text-lg font-semibold">
                      {(currentInning.extras?.wides || 0) +
                        (currentInning.extras?.noBalls || 0) +
                        (currentInning.extras?.byes || 0) +
                        (currentInning.extras?.legByes || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      (W:{currentInning.extras?.wides} NB:
                      {currentInning.extras?.noBalls} B:
                      {currentInning.extras?.byes} LB:
                      {currentInning.extras?.legByes})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-lg font-semibold">
                      {currentInning.totalRuns}/{currentInning.totalWickets}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Overs</p>
                    <p className="text-lg font-semibold">
                      {currentInning.currentOver}.{currentInning.currentBall}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Run Rate</p>
                    <p className="text-lg font-semibold">
                      {(
                        currentInning.totalRuns /
                        (currentInning.currentOver +
                          currentInning.currentBall / 6 || 1)
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Bowling Scorecard */}
            <Card>
              <h3 className="text-xl font-bold mb-4">Bowling</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Bowler</th>
                      <th className="text-center py-2 px-2">O</th>
                      <th className="text-center py-2 px-2">R</th>
                      <th className="text-center py-2 px-2">W</th>
                      <th className="text-center py-2 px-2">Econ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAllBowlers(currentInning).map((bowlerId) => {
                      const stats = getBowlerStats(bowlerId, currentInning);
                      const player = players.find((p) => p._id === bowlerId);

                      return (
                        <tr
                          key={bowlerId}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-2">
                            {player?.userId.name || "Unknown"}
                          </td>
                          <td className="text-center py-3 px-2">
                            {stats.overs}
                          </td>
                          <td className="text-center py-3 px-2">
                            {stats.runs}
                          </td>
                          <td className="text-center py-3 px-2 font-semibold">
                            {stats.wickets}
                          </td>
                          <td className="text-center py-3 px-2">
                            {stats.economy}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Fall of Wickets */}
            {getFallOfWickets(currentInning).length > 0 && (
              <Card>
                <h3 className="text-xl font-bold mb-4">Fall of Wickets</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getFallOfWickets(currentInning).map((wicket, index) => (
                    <div key={index} className="bg-gray-50 rounded p-3">
                      <p className="text-sm text-gray-600">
                        Wicket {wicket.wicketNumber}
                      </p>
                      <p className="font-semibold text-lg">
                        {wicket.runs} runs
                      </p>
                      <p className="text-sm text-gray-700">{wicket.batsman}</p>
                      <p className="text-xs text-gray-500">
                        Over {wicket.over}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Over-by-Over Summary */}
            <Card>
              <h3 className="text-xl font-bold mb-4">Over-by-Over Summary</h3>
              <div className="space-y-3">
                {currentInning.balls && currentInning.balls.length > 0 ? (
                  Array.from(
                    new Set(
                      currentInning.balls.map((ball: any) => ball.overNumber)
                    )
                  )
                    .sort((a, b) => (a as number) - (b as number))
                    .map((overNumber, index) => {
                      const overBalls = currentInning.balls.filter(
                        (ball: any) =>
                          ball.overNumber === overNumber && ball.isValid
                      );
                      const overRuns = overBalls.reduce(
                        (sum: number, ball: any) => sum + ball.runs,
                        0
                      );
                      const overWickets = overBalls.filter(
                        (ball: any) => ball.ballType === "wicket"
                      ).length;
                      const bowler =
                        overBalls[0]?.bowler?.userId?.name || "Unknown";

                      return (
                        <div
                          key={index ** 2}
                          className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-semibold text-lg">
                                Over {(overNumber as number) + 1}
                              </span>
                              <span className="text-sm text-gray-600 ml-2">
                                ({bowler})
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-lg">
                                {overRuns} runs
                              </span>
                              {overWickets > 0 && (
                                <span className="text-red-600 ml-2">
                                  ({overWickets}W)
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {overBalls.map((ball: any) => (
                              <div
                                key={ball._id}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm ${
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
                  <p className="text-gray-500 text-center">
                    No balls bowled yet
                  </p>
                )}
              </div>
            </Card>
          </>
        )}

        {/* Match Details */}
        <Card>
          <h3 className="text-xl font-bold mb-4">Match Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">{formatISODate(match.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Toss</p>
              <p className="font-semibold">
                {match.tossWinner?.name} won and chose to{" "}
                {match.tossDecision === "bat" ? "bat" : "bowl"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { useMatch } from "@/hooks/useMatches";
import { formatISODate } from "@/utils/dateFormatter";
import { statsService, InningScorecard } from "@/services/statsService";
import { MatchHeader } from "@/components/scoreboard/MatchHeader";
import { BattingScorecard } from "@/components/scoreboard/BattingScorecard";
import { BowlingScorecard } from "@/components/scoreboard/BowlingScorecard";

export default function ScoreboardPage() {
  const params = useParams();
  const matchId = params.id as string;
  const { match, isLoading: matchLoading } = useMatch(matchId);
  const [selectedInning, setSelectedInning] = useState<1 | 2>(1);
  const [innings, setInnings] = useState<InningScorecard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadScorecard();
  }, [matchId]);

  const loadScorecard = async () => {
    try {
      setIsLoading(true);
      const data = await statsService.getMatchScorecard(matchId);
      setInnings(data);
    } catch (error) {
      console.error("Failed to load scorecard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentInning = innings.find((i) => i.inningNumber === selectedInning);

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

  if (isLoading || matchLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[calc(100dvh - 60px)]">
          <p className="text-lg">Loading scorecard...</p>
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
        {/* <Card>
          <div className="text-center">
            <h1 className="sm:text-3xl text-xl font-bold mb-2">
              {match.teamASnapshot?.name || match.teamA.name}
              <br className="sm:hidden" />
              <span className="text-gray-500 "> vs </span>
              <br className="sm:hidden" />
              {match.teamBSnapshot?.name || match.teamB.name}
            </h1>
            <p className="text-gray-600 mb-4">
              {formatISODate(match.createdAt)}
            </p>

            {match.status !== "completed" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                <p className="text-lg font-semibold text-blue-700">
                  Match In Progress
                </p>
              </div>
            )}
          </div>
        </Card> */}

        {/* Player of the Match */}
        {/* {match.status === "completed" && match.playerOfTheMatch && (
          <Card>
            <div className="text-center bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Player of the Match</p>
              <p className="text-2xl font-bold text-yellow-700">
                {match.playerOfTheMatch.userId?.name || ""}
              </p>
            </div>
          </Card>
        )} */}

        <MatchHeader
          date={formatISODate(match.createdAt)}
          teamA={match.teamA}
          teamB={match.teamB}
          innings={innings}
          resultText={match.resultText}
          matchStatus={match.status}
        />

        {/* Innings Selector */}
        {innings.length > 0 && (
          <div className="flex sm:gap-2 justify-center">
            {innings.map((inning) => (
              <button
                key={inning.inningNumber}
                onClick={() => setSelectedInning(inning.inningNumber as 1 | 2)}
                className={`sm:w-auto border-b-3 p-2  w-[50%] sm:rounded-md rounded-none ${
                  selectedInning === inning.inningNumber
                    ? "border-green-500 "
                    : "border-gray-200"
                }`}
              >
                {/* {inning.inningNumber === 1 ? "1st" : "2nd"} Innings{" "} */}
                <span
                  className={`${
                    selectedInning === inning.inningNumber
                      ? " font-semibold text-black"
                      : ""
                  } text-sm`}
                >
                  {inning.battingTeam.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {currentInning && (
          <>
            {/* Batting Scorecard */}
            <BattingScorecard
              battingStats={currentInning.battingStats}
              captainId={
                // Get captain from snapshot first (captain at match time), then fallback to current captain
                currentInning.inningNumber === 1
                  ? typeof (
                      match.teamASnapshot?.captain || match.teamA?.captain
                    ) === "string"
                    ? match.teamASnapshot?.captain || match.teamA?.captain
                    : match.teamASnapshot?.captain?._id ||
                      match.teamA?.captain?._id
                  : typeof (
                      match.teamBSnapshot?.captain || match.teamB?.captain
                    ) === "string"
                  ? match.teamBSnapshot?.captain || match.teamB?.captain
                  : match.teamBSnapshot?.captain?._id ||
                    match.teamB?.captain?._id
              }
              getDismissalText={getDismissalText}
            />

            {/* Score Summary */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-5 items-center">
                <p className="text-sm min-w-36 text-gray-600">Extras</p>
                <p className="text-sm text-gray-800">
                  {((currentInning as any).extras?.wides || 0) +
                    ((currentInning as any).extras?.noBalls || 0)}{" "}
                  {`(W ${(currentInning as any).extras?.wides || 0}, NB ${
                    (currentInning as any).extras?.noBalls || 0
                  })`}
                </p>
              </div>
              <div className="flex gap-5 items-center">
                <p className="text-sm min-w-36 text-gray-600">Total Runs</p>
                <p className="text-sm text-gray-800">
                  {currentInning.totalRuns}{" "}
                  {`(${currentInning.totalWickets} wkts, ${
                    currentInning.currentOver
                  }${
                    currentInning.currentBall > 0
                      ? `.${currentInning.currentBall}`
                      : ""
                  } ov)`}
                </p>
              </div>
              <div className="flex gap-5 items-center">
                <p className="text-sm min-w-36 text-gray-600">Total Overs</p>
                <p className="text-sm text-gray-800">{match.overs} Overs</p>
              </div>
              <div className="flex gap-5 items-center">
                <p className="text-sm min-w-36 text-gray-600">Run Rate</p>
                <p className="text-sm text-gray-800">
                  {currentInning.currentOver > 0
                    ? (
                        currentInning.totalRuns / currentInning.currentOver
                      ).toFixed(2)
                    : "0.00"}
                </p>
              </div>
            </div>

            {/* Yet to bat */}
            {(() => {
              // Get all players who batted
              const battedPlayerIds = currentInning.battingStats.map(
                (stat: any) => stat.playerId._id
              );

              // Get team snapshot or current team based on inning
              const battingTeamSnapshot =
                currentInning.inningNumber === 1
                  ? match.teamASnapshot || match.teamA
                  : match.teamBSnapshot || match.teamB;

              // Filter players who haven't batted yet
              const yetToBatPlayers =
                battingTeamSnapshot.players?.filter(
                  (player: any) =>
                    !battedPlayerIds.includes(
                      player.playerId?._id || player._id
                    )
                ) || [];

              return yetToBatPlayers.length > 0 ? (
                <div>
                  <h3 className="font-semibold mb-3">Yet to bat</h3>
                  <p className="text-sm text-gray-700">
                    {yetToBatPlayers
                      .map(
                        (player: any) =>
                          player.playerId?.userId?.name ||
                          player.userId?.name ||
                          player.name
                      )
                      .join(" • ")}
                  </p>
                </div>
              ) : null;
            })()}

            {/* Fall of wickets */}
            {(() => {
              if (!currentInning.balls || currentInning.balls.length === 0) {
                return null;
              }

              // Calculate cumulative runs and valid ball count as we go through balls
              let cumulativeRuns = 0;
              let validBallCount = 0;
              const wicketBalls: any[] = [];

              currentInning.balls.forEach((ball: any) => {
                if (ball.isValid) {
                  cumulativeRuns += ball.runs || 0;
                  validBallCount++;
                }

                if (ball.ballType === "wicket") {
                  // Calculate over.ball format (e.g., 0.4 means 1st over, 4th ball)
                  const overNum = Math.floor(validBallCount / 6);
                  const ballNum = validBallCount % 6;

                  wicketBalls.push({
                    batsman: ball.batsman,
                    runsAtWicket: cumulativeRuns,
                    over: ballNum === 0 ? overNum : `${overNum}.${ballNum}`,
                  });
                }
              });

              return wicketBalls.length > 0 ? (
                <div>
                  <h3 className="font-semibold mb-3">Fall of wickets</h3>
                  <p className="text-sm text-gray-700">
                    {wicketBalls
                      .map(
                        (wicket, index) =>
                          `${wicket.runsAtWicket}/${index + 1} (${
                            wicket.batsman?.userId?.name || "Unknown"
                          }, ${wicket.over} ov)`
                      )
                      .join(" • ")}
                  </p>
                </div>
              ) : null;
            })()}

            {/* Bowling Scorecard */}
            <BowlingScorecard bowlingStats={currentInning.bowlingStats} />

            {/* Partnerships */}
            {/* {currentInning.battingStats.length > 0 && (
              <Card>
                <h3 className="text-xl font-bold mb-4">Partnerships</h3>
                <div className="space-y-3">
                  {(() => {
                    const partnerships: any[] = [];
                    const outBatsmenRuns = currentInning.battingStats
                      .filter((s: any) => s.isOut)
                      .reduce((sum: number, s: any) => sum + s.runs, 0);

                    // Current/ongoing partnership
                    const notOutBatsmen = currentInning.battingStats.filter(s => !s.isOut);
                    if (notOutBatsmen.length >= 2) {
                      const currentPartnershipRuns = currentInning.totalRuns - outBatsmenRuns;
                      partnerships.push({
                        player1: notOutBatsmen[0],
                        player2: notOutBatsmen[1],
                        runs: Math.max(0, currentPartnershipRuns),
                        current: true,
                      });
                    }

                    return partnerships.length > 0 ? (
                      partnerships.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-gray-200 pb-3">
                          <div className="flex gap-3">
                            <div className="text-center bg-blue-50 rounded p-2 min-w-[80px]">
                              <p className="font-semibold">{p.player1.playerId.userId.name}</p>
                              <p className="text-sm text-gray-600">{p.player1.runs}({p.player1.balls})</p>
                            </div>
                            <div className="text-center bg-blue-50 rounded p-2 min-w-[80px]">
                              <p className="font-semibold">{p.player2.playerId.userId.name}</p>
                              <p className="text-sm text-gray-600">{p.player2.runs}({p.player2.balls})</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{p.runs}</p>
                            <p className="text-xs text-gray-500">{p.current ? "Current" : ""}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No partnerships to display</p>
                    );
                  })()}
                </div>
              </Card>
            )} */}

            {/* Overs */}
            {currentInning?.balls && currentInning.balls.length > 0 && (
              <div>
                <h3 className="text-md font-semibold mb-4">Overs</h3>
                <div className="space-y-3">
                  {Array.from(
                    new Set(
                      currentInning.balls
                        .filter((ball) => ball.isValid)
                        .map((ball) => ball.overNumber)
                    )
                  )
                    .sort((a, b) => a - b)
                    .map((overNumber) => {
                      const overBalls =
                        currentInning.balls?.filter(
                          (ball) =>
                            ball.overNumber === overNumber && ball.isValid
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
                          className="sm:border sm:border-gray-200 sm:rounded-lg sm:p-3 sm:hover:shadow-md sm:transition-shadow sm:bg-white border-b-2 border-gray-200 pb-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Over {overNumber + 1}
                              </span>
                              <span className="text-xs text-gray-600">
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
                    })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Match Details */}
        {/* <div>
          <h3 className="text-xl font-bold mb-4">Match Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">{formatISODate(match.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Overs</p>
              <p className="font-semibold">{match.overs} overs per side</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Toss</p>
              <p className="font-semibold">
                {match.tossWinner?.name} won and chose to{" "}
                {match.tossDecision === "bat" ? "bat" : "bowl"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {match.teamASnapshot?.name || match.teamA.name} Captain
              </p>
              <p className="font-semibold">
                {match.teamASnapshot?.captain?.userId?.name ||
                  match.teamA?.captain?.userId?.name ||
                  "Not Set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {match.teamBSnapshot?.name || match.teamB.name} Captain
              </p>
              <p className="font-semibold">
                {match.teamBSnapshot?.captain?.userId?.name ||
                  match.teamB?.captain?.userId?.name ||
                  "Not Set"}
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </Layout>
  );
}

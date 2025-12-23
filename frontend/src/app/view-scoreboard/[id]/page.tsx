"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useMatch } from "@/hooks/useMatches";
import { formatISODate } from "@/utils/dateFormatter";
import { statsService, InningScorecard } from "@/services/statsService";

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
        return `c ${stat.fielder?.userId?.name || ""} b ${stat.dismissedBy?.userId?.name || ""}`;
      case "lbw":
        return `lbw b ${stat.dismissedBy?.userId?.name || ""}`;
      case "stumped":
        return `st ${stat.fielder?.userId?.name || ""} b ${stat.dismissedBy?.userId?.name || ""}`;
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
        <div className="flex justify-center items-center min-h-screen">
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
        <Card>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              {match.teamASnapshot?.name || match.teamA.name} vs {match.teamBSnapshot?.name || match.teamB.name}
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

        {/* Player of the Match */}
        {match.status === "completed" && match.playerOfTheMatch && (
          <Card>
            <div className="text-center bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Player of the Match</p>
              <p className="text-2xl font-bold text-yellow-700">
                {match.playerOfTheMatch.userId?.name || ""}
              </p>
            </div>
          </Card>
        )}

        {/* Innings Selector */}
        {innings.length > 0 && (
          <Card>
            <div className="flex gap-2 justify-center">
              {innings.map((inning) => (
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
                  {inning.inningNumber === 1 ? "1st" : "2nd"} Innings - {inning.battingTeam.name}
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
                  ({currentInning.currentOver} overs)
                </p>
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Run Rate</p>
                    <p className="text-lg font-semibold">
                      {currentInning.currentOver > 0
                        ? (currentInning.totalRuns / currentInning.currentOver).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Extras</p>
                    <p className="text-lg font-semibold">
                      {(currentInning as any).extras?.wides +
                       (currentInning as any).extras?.noBalls +
                       (currentInning as any).extras?.byes +
                       (currentInning as any).extras?.legByes || 0}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Batting Scorecard */}
            <Card>
              <h3 className="text-xl font-bold mb-4">Batting</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-semibold">Batsman</th>
                      <th className="text-left py-3 px-2 font-semibold">Dismissal</th>
                      <th className="text-center py-3 px-2 font-semibold">R</th>
                      <th className="text-center py-3 px-2 font-semibold">B</th>
                      <th className="text-center py-3 px-2 font-semibold">4s</th>
                      <th className="text-center py-3 px-2 font-semibold">6s</th>
                      <th className="text-center py-3 px-2 font-semibold">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInning.battingStats.map((stat, index) => (
                      <tr
                        key={index}
                        className={`border-b hover:bg-gray-50 ${stat.isOut ? "" : "bg-green-50"}`}
                      >
                        <td className="py-3 px-2 font-medium">
                          {stat.playerId.userId.name}
                          {!stat.isOut && (
                            <span className="ml-2 text-xs text-green-600 font-bold">*</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600 italic">
                          {getDismissalText(stat)}
                        </td>
                        <td className="text-center py-3 px-2 font-semibold text-blue-600">
                          {stat.runs}
                        </td>
                        <td className="text-center py-3 px-2">
                          {stat.balls}
                        </td>
                        <td className="text-center py-3 px-2">
                          {stat.fours}
                        </td>
                        <td className="text-center py-3 px-2">
                          {stat.sixes}
                        </td>
                        <td className="text-center py-3 px-2">
                          {stat.strikeRate.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Bowling Scorecard */}
            <Card>
              <h3 className="text-xl font-bold mb-4">Bowling</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-semibold">Bowler</th>
                      <th className="text-center py-3 px-2 font-semibold">O</th>
                      <th className="text-center py-3 px-2 font-semibold">M</th>
                      <th className="text-center py-3 px-2 font-semibold">R</th>
                      <th className="text-center py-3 px-2 font-semibold">W</th>
                      <th className="text-center py-3 px-2 font-semibold">Econ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInning.bowlingStats.map((stat, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-2 font-medium">
                          {stat.playerId.userId.name}
                        </td>
                        <td className="text-center py-3 px-2">
                          {stat.overs.toFixed(1)}
                        </td>
                        <td className="text-center py-3 px-2">
                          {stat.maidens}
                        </td>
                        <td className="text-center py-3 px-2">
                          {stat.runsConceded}
                        </td>
                        <td className="text-center py-3 px-2 font-semibold text-red-600">
                          {stat.wickets}
                        </td>
                        <td className="text-center py-3 px-2">
                          {stat.economy.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Partnership Info */}
            {currentInning.battingStats.filter(s => !s.isOut).length === 2 && (
              <Card>
                <h3 className="text-xl font-bold mb-4">Current Partnership</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  {currentInning.battingStats
                    .filter(s => !s.isOut)
                    .map((stat, index) => (
                      <div key={index} className="bg-blue-50 rounded-lg p-4">
                        <p className="font-semibold text-lg">{stat.playerId.userId.name}</p>
                        <p className="text-3xl font-bold text-blue-600">{stat.runs}</p>
                        <p className="text-sm text-gray-600">({stat.balls} balls)</p>
                      </div>
                    ))}
                </div>
              </Card>
            )}
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
            {match.teamASnapshot?.captain && (
              <div>
                <p className="text-sm text-gray-600">Team A Captain</p>
                <p className="font-semibold">{match.teamASnapshot.captain.userId?.name || "N/A"}</p>
              </div>
            )}
            {match.teamBSnapshot?.captain && (
              <div>
                <p className="text-sm text-gray-600">Team B Captain</p>
                <p className="font-semibold">{match.teamBSnapshot.captain.userId?.name || "N/A"}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}

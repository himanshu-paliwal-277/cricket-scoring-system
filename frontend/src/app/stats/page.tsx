"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { statsService } from "@/services/statsService";

export default function StatsPage() {
  const [mostRuns, setMostRuns] = useState<any[]>([]);
  const [mostWickets, setMostWickets] = useState<any[]>([]);
  const [mostBoundaries, setMostBoundaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [runs, wickets, boundaries] = await Promise.all([
        statsService.getMostRuns(),
        statsService.getMostWickets(),
        statsService.getMostBoundaries(),
      ]);
      setMostRuns(runs);
      setMostWickets(wickets);
      setMostBoundaries(boundaries);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg">Loading stats...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">Player Statistics</h1>

        <Card>
          <h2 className="text-2xl font-bold mb-4">Most Runs</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-center py-3 px-4">Matches</th>
                  <th className="text-center py-3 px-4">Runs</th>
                  <th className="text-center py-3 px-4">HS</th>
                  <th className="text-center py-3 px-4">SR</th>
                  <th className="text-center py-3 px-4">4s</th>
                  <th className="text-center py-3 px-4">6s</th>
                </tr>
              </thead>
              <tbody>
                {mostRuns.map((player, index) => (
                  <tr key={player._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">{index + 1}</td>
                    <td className="py-3 px-4">{player.userId.name}</td>
                    <td className="text-center py-3 px-4">{player.matchesPlayed}</td>
                    <td className="text-center py-3 px-4 font-bold text-blue-600">
                      {player.totalRuns}
                    </td>
                    <td className="text-center py-3 px-4">{player.highestScore}</td>
                    <td className="text-center py-3 px-4">
                      {player.totalBallsFaced > 0
                        ? ((player.totalRuns / player.totalBallsFaced) * 100).toFixed(2)
                        : "0.00"}
                    </td>
                    <td className="text-center py-3 px-4">{player.totalFours || 0}</td>
                    <td className="text-center py-3 px-4">{player.totalSixes || 0}</td>
                  </tr>
                ))}
                {mostRuns.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold mb-4">Most Wickets</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-center py-3 px-4">Matches</th>
                  <th className="text-center py-3 px-4">Wickets</th>
                  <th className="text-center py-3 px-4">Avg</th>
                  <th className="text-center py-3 px-4">Balls</th>
                </tr>
              </thead>
              <tbody>
                {mostWickets.map((player, index) => (
                  <tr key={player._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">{index + 1}</td>
                    <td className="py-3 px-4">{player.userId.name}</td>
                    <td className="text-center py-3 px-4">{player.matchesPlayed}</td>
                    <td className="text-center py-3 px-4 font-bold text-red-600">
                      {player.totalWickets}
                    </td>
                    <td className="text-center py-3 px-4">
                      {player.matchesPlayed > 0
                        ? (player.totalWickets / player.matchesPlayed).toFixed(2)
                        : "0.00"}
                    </td>
                    <td className="text-center py-3 px-4">
                      {player.totalBallsBowled || 0}
                    </td>
                  </tr>
                ))}
                {mostWickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold mb-4">Most Boundaries</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-center py-3 px-4">Matches</th>
                  <th className="text-center py-3 px-4">Total</th>
                  <th className="text-center py-3 px-4">4s</th>
                  <th className="text-center py-3 px-4">6s</th>
                </tr>
              </thead>
              <tbody>
                {mostBoundaries.map((player, index) => (
                  <tr key={player._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">{index + 1}</td>
                    <td className="py-3 px-4">{player.userId.name}</td>
                    <td className="text-center py-3 px-4">{player.matchesPlayed}</td>
                    <td className="text-center py-3 px-4 font-bold text-purple-600">
                      {player.totalBoundaries}
                    </td>
                    <td className="text-center py-3 px-4">{player.totalFours || 0}</td>
                    <td className="text-center py-3 px-4">{player.totalSixes || 0}</td>
                  </tr>
                ))}
                {mostBoundaries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

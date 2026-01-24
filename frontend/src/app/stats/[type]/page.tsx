/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { StatsTable } from "@/components/ui/StatsTable";
import { statsService } from "@/services/statsService";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

type StatsType =
  | "most-runs"
  | "most-wickets"
  | "most-boundaries"
  | "most-fours"
  | "most-sixes"
  | "highest-scores"
  | "most-fifties"
  | "most-twenty-fives"
  | "best-economy"
  | "most-catches"
  | "most-ones";

const statsConfig: Record<
  StatsType,
  { title: string; fetchFn: (limit?: number) => Promise<any[]> }
> = {
  "most-runs": { title: "Most Runs", fetchFn: statsService.getMostRuns },
  "most-wickets": { title: "Most Wickets", fetchFn: statsService.getMostWickets },
  "most-boundaries": { title: "Most Boundaries", fetchFn: statsService.getMostBoundaries },
  "most-fours": { title: "Most Fours", fetchFn: statsService.getMostFours },
  "most-sixes": { title: "Most Sixes", fetchFn: statsService.getMostSixes },
  "highest-scores": { title: "Highest Scores", fetchFn: statsService.getHighestScores },
  "most-fifties": { title: "Most Fifties (50s)", fetchFn: statsService.getMostFifties },
  "most-twenty-fives": { title: "Most 25s", fetchFn: statsService.getMostTwentyFives },
  "best-economy": { title: "Best Economy", fetchFn: statsService.getBestEconomy },
  "most-catches": { title: "Most Catches", fetchFn: statsService.getMostCatches },
  "most-ones": { title: "Most 1s", fetchFn: statsService.getMostOnes },
};

// Player column with photo
const playerColumn = {
  header: "Player",
  key: "userId",
  align: "left" as const,
  render: (value: any) => {
    const name = value?.name || "Unknown";
    const photo = value?.photo;
    return (
      <div className="flex items-center gap-2">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            className="w-8 h-8 rounded-full object-cover border"
            width={32}
            height={32}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="font-medium">{name}</span>
      </div>
    );
  },
};

const rankColumn = {
  header: "Rank",
  key: "rank",
  align: "left" as const,
  render: (_: any, __: any, index?: number) => (
    <span className="font-semibold">{(index ?? 0) + 1}</span>
  ),
};

const columnsConfig: Record<StatsType, any[]> = {
  "most-runs": [
    rankColumn,
    playerColumn,
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    { header: "Runs", key: "totalRuns", align: "center" as const, className: "font-bold text-blue-600" },
    { header: "HS", key: "highestScore", align: "center" as const },
    { header: "SR", key: "strikeRate", align: "center" as const, render: (_: any, row: any) => row.totalBallsFaced > 0 ? ((row.totalRuns / row.totalBallsFaced) * 100).toFixed(2) : "0.00" },
    { header: "4s", key: "totalFours", align: "center" as const, render: (value: any) => value || 0 },
    { header: "6s", key: "totalSixes", align: "center" as const, render: (value: any) => value || 0 },
  ],
  "most-wickets": [
    rankColumn,
    playerColumn,
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    { header: "Wickets", key: "totalWickets", align: "center" as const, className: "font-bold text-red-600" },
    { header: "Overs", key: "overs", align: "center" as const, render: (_: any, row: any) => `${Math.floor((row.totalBallsBowled || 0) / 6)}.${(row.totalBallsBowled || 0) % 6}` },
    { header: "Runs", key: "totalRunsConceded", align: "center" as const, render: (value: any) => value || 0 },
    { header: "Econ", key: "economy", align: "center" as const, render: (_: any, row: any) => (row.totalBallsBowled || 0) > 0 ? (((row.totalRunsConceded || 0) / row.totalBallsBowled) * 6).toFixed(2) : "0.00" },
  ],
  "most-boundaries": [
    rankColumn,
    playerColumn,
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    { header: "Total", key: "totalBoundaries", align: "center" as const, className: "font-bold text-purple-600" },
    { header: "4s", key: "totalFours", align: "center" as const, render: (value: any) => value || 0 },
    { header: "6s", key: "totalSixes", align: "center" as const, render: (value: any) => value || 0 },
  ],
  "most-fours": [
    rankColumn,
    playerColumn,
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    { header: "4s", key: "totalFours", align: "center" as const, className: "font-bold text-blue-600", render: (value: any) => value || 0 },
    { header: "Runs", key: "totalRuns", align: "center" as const },
  ],
  "most-sixes": [
    rankColumn,
    playerColumn,
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    { header: "6s", key: "totalSixes", align: "center" as const, className: "font-bold text-purple-600", render: (value: any) => value || 0 },
    { header: "Runs", key: "totalRuns", align: "center" as const },
  ],
  "highest-scores": [
    rankColumn,
    playerColumn,
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    { header: "Highest Score", key: "highestScore", align: "center" as const, className: "font-bold text-green-600" },
    { header: "Total Runs", key: "totalRuns", align: "center" as const },
  ],
  "most-fifties": [
    rankColumn,
    playerColumn,
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    { header: "50s", key: "fifties", align: "center" as const, className: "font-bold text-orange-600" },
    { header: "Total Runs", key: "totalRuns", align: "center" as const },
  ],
  "most-twenty-fives": [
    rankColumn,
    playerColumn,
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    { header: "25s", key: "twentyFives", align: "center" as const, className: "font-bold text-teal-600" },
    { header: "Total Runs", key: "totalRuns", align: "center" as const },
  ],
  "best-economy": [
    rankColumn,
    playerColumn,
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    { header: "Overs", key: "overs", align: "center" as const, render: (_: any, row: any) => `${Math.floor((row.totalBallsBowled || 0) / 6)}.${(row.totalBallsBowled || 0) % 6}` },
    { header: "Runs", key: "totalRunsConceded", align: "center" as const, render: (value: any) => value || 0 },
    { header: "Wickets", key: "totalWickets", align: "center" as const },
    { header: "Econ", key: "economy", align: "center" as const, className: "font-bold text-emerald-600", render: (value: any) => value?.toFixed(2) || "0.00" },
  ],
  "most-catches": [
    rankColumn,
    playerColumn,
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    { header: "Catches", key: "totalCatches", align: "center" as const, className: "font-bold text-green-600", render: (value: any) => value || 0 },
  ],
  "most-ones": [
    rankColumn,
    playerColumn,
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    { header: "1s", key: "totalOnes", align: "center" as const, className: "font-bold text-indigo-600", render: (value: any) => value || 0 },
    { header: "Total Runs", key: "totalRuns", align: "center" as const },
  ],
};

export default function StatsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const type = params.type as StatsType;

  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const config = statsConfig[type];
  const columns = columnsConfig[type];

  useEffect(() => {
    // Redirect if not owner
    if (user && user.role !== "owner") {
      router.push("/stats");
      return;
    }

    if (!config) {
      router.push("/stats");
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        const result = await config.fetchFn(100);
        setData(result);
      } catch (error: any) {
        notifications.show({
          message: error?.response?.data?.message || "Failed to load stats",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [type, config, user, router]);

  if (!config || !columns) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/stats")}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">{config.title}</h1>
        </div>

        {isLoading ? (
          <Skeleton width={"100%"} height={500} />
        ) : (
          <div className="p-4 border border-gray-300 rounded-md">
            <StatsTable
              columns={columns}
              data={data}
              emptyMessage="No data available"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

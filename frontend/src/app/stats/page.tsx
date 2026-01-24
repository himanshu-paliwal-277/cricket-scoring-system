/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { StatsSection } from "@/components/ui/StatsSection";
import { statsService } from "@/services/statsService";
import { Skeleton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import Image from "next/image";

export default function StatsPage() {
  const [mostRuns, setMostRuns] = useState<any[]>([]);
  const [mostWickets, setMostWickets] = useState<any[]>([]);
  const [mostBoundaries, setMostBoundaries] = useState<any[]>([]);
  const [mostFours, setMostFours] = useState<any[]>([]);
  const [mostSixes, setMostSixes] = useState<any[]>([]);
  const [highestScores, setHighestScores] = useState<any[]>([]);
  const [mostFifties, setMostFifties] = useState<any[]>([]);
  const [mostTwentyFives, setMostTwentyFives] = useState<any[]>([]);
  const [mostCatches, setMostCatches] = useState<any[]>([]);
  const [mostOnes, setMostOnes] = useState<any[]>([]);
  const [bestEconomy, setBestEconomy] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [
        runs,
        wickets,
        boundaries,
        fours,
        sixes,
        highest,
        fifties,
        twentyFives,
        catches,
        ones,
        economy,
      ] = await Promise.all([
        statsService.getMostRuns(),
        statsService.getMostWickets(),
        statsService.getMostBoundaries(),
        statsService.getMostFours(),
        statsService.getMostSixes(),
        statsService.getHighestScores(),
        statsService.getMostFifties(),
        statsService.getMostTwentyFives(),
        statsService.getMostCatches(),
        statsService.getMostOnes(),
        statsService.getBestEconomy(),
      ]);
      setMostRuns(runs);
      setMostWickets(wickets);
      setMostBoundaries(boundaries);
      setMostFours(fours);
      setMostSixes(sixes);
      setHighestScores(highest);
      setMostFifties(fifties);
      setMostTwentyFives(twentyFives);
      setMostCatches(catches);
      setMostOnes(ones);
      setBestEconomy(economy);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load stats";
      notifications.show({
        message: errorMessage,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div>
          <Skeleton width={200} height={28} />
          <Skeleton width={"100%"} height={428} className="mt-6" />
          <Skeleton width={"100%"} height={428} className="mt-6" />
          <Skeleton width={"100%"} height={428} className="mt-6" />
        </div>
      </Layout>
    );
  }

  // Column definitions
  const mostRunsColumns = [
    {
      header: "Rank",
      key: "rank",
      align: "left" as const,
      render: (_: any, __: any, index?: number) => (
        <span className="font-semibold">{(index ?? 0) + 1}</span>
      ),
    },
    {
      header: "Player",
      key: "userId",
      align: "left" as const,
      render: (value: any) => {
        const name = value?.name || "Unknown";
        const photo = value?.photo; // change this if your API uses a different key

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
                  // if image fails to load, hide it
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
    },

    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    {
      header: "Runs",
      key: "totalRuns",
      align: "center" as const,
      className: "font-bold text-blue-600",
    },
    { header: "HS", key: "highestScore", align: "center" as const },
    {
      header: "SR",
      key: "strikeRate",
      align: "center" as const,
      render: (_: any, row: any) =>
        row.totalBallsFaced > 0
          ? ((row.totalRuns / row.totalBallsFaced) * 100).toFixed(2)
          : "0.00",
    },
    {
      header: "4s",
      key: "totalFours",
      align: "center" as const,
      render: (value: any) => value || 0,
    },
    {
      header: "6s",
      key: "totalSixes",
      align: "center" as const,
      render: (value: any) => value || 0,
    },
  ];

  const mostWicketsColumns = [
    {
      header: "Rank",
      key: "rank",
      align: "left" as const,
      render: (_: any, __: any, index?: number) => (
        <span className="font-semibold">{(index ?? 0) + 1}</span>
      ),
    },
    {
      header: "Player",
      key: "userId",
      align: "left" as const,
      render: (value: any) => {
        const name = value?.name || "Unknown";
        const photo = value?.photo; // change this if your API uses a different key

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
                  // if image fails to load, hide it
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
    },
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    {
      header: "Wickets",
      key: "totalWickets",
      align: "center" as const,
      className: "font-bold text-red-600",
    },
    {
      header: "Overs",
      key: "overs",
      align: "center" as const,
      render: (_: any, row: any) => {
        const balls = row.totalBallsBowled || 0;
        return `${Math.floor(balls / 6)}.${balls % 6}`;
      },
    },
    {
      header: "Runs",
      key: "totalRunsConceded",
      align: "center" as const,
      render: (value: any) => value || 0,
    },
    {
      header: "Econ",
      key: "economy",
      align: "center" as const,
      render: (_: any, row: any) => {
        const balls = row.totalBallsBowled || 0;
        const runsConceded = row.totalRunsConceded || 0;
        return balls > 0 ? ((runsConceded / balls) * 6).toFixed(2) : "0.00";
      },
    },
  ];

  const mostBoundariesColumns = [
    {
      header: "Rank",
      key: "rank",
      align: "left" as const,
      render: (_: any, __: any, index?: number) => (
        <span className="font-semibold">{(index ?? 0) + 1}</span>
      ),
    },
    {
      header: "Player",
      key: "userId",
      align: "left" as const,
      render: (value: any) => {
        const name = value?.name || "Unknown";
        const photo = value?.photo; // change this if your API uses a different key

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
                  // if image fails to load, hide it
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
    },
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    {
      header: "Total",
      key: "totalBoundaries",
      align: "center" as const,
      className: "font-bold text-purple-600",
    },
    {
      header: "4s",
      key: "totalFours",
      align: "center" as const,
      render: (value: any) => value || 0,
    },
    {
      header: "6s",
      key: "totalSixes",
      align: "center" as const,
      render: (value: any) => value || 0,
    },
  ];

  const mostFoursColumns = [
    {
      header: "Rank",
      key: "rank",
      align: "left" as const,
      render: (_: any, __: any, index?: number) => (
        <span className="font-semibold">{(index ?? 0) + 1}</span>
      ),
    },
    {
      header: "Player",
      key: "userId",
      align: "left" as const,
      render: (value: any) => {
        const name = value?.name || "Unknown";
        const photo = value?.photo; // change this if your API uses a different key

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
                  // if image fails to load, hide it
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
    },
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    {
      header: "4s",
      key: "totalFours",
      align: "center" as const,
      className: "font-bold text-blue-600",
      render: (value: any) => value || 0,
    },
    { header: "Runs", key: "totalRuns", align: "center" as const },
  ];

  const mostSixesColumns = [
    {
      header: "Rank",
      key: "rank",
      align: "left" as const,
      render: (_: any, __: any, index?: number) => (
        <span className="font-semibold">{(index ?? 0) + 1}</span>
      ),
    },
    {
      header: "Player",
      key: "userId",
      align: "left" as const,
      render: (value: any) => {
        const name = value?.name || "Unknown";
        const photo = value?.photo; // change this if your API uses a different key

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
                  // if image fails to load, hide it
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
    },
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    {
      header: "6s",
      key: "totalSixes",
      align: "center" as const,
      className: "font-bold text-purple-600",
      render: (value: any) => value || 0,
    },
    { header: "Runs", key: "totalRuns", align: "center" as const },
  ];

  const highestScoresColumns = [
    {
      header: "Rank",
      key: "rank",
      align: "left" as const,
      render: (_: any, __: any, index?: number) => (
        <span className="font-semibold">{(index ?? 0) + 1}</span>
      ),
    },
    {
      header: "Player",
      key: "userId",
      align: "left" as const,
      render: (value: any) => {
        const name = value?.name || "Unknown";
        const photo = value?.photo; // change this if your API uses a different key

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
                  // if image fails to load, hide it
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
    },
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    {
      header: "Highest Score",
      key: "highestScore",
      align: "center" as const,
      className: "font-bold text-green-600",
    },
    { header: "Total Runs", key: "totalRuns", align: "center" as const },
  ];

  const mostFiftiesColumns = [
    {
      header: "Rank",
      key: "rank",
      align: "left" as const,
      render: (_: any, __: any, index?: number) => (
        <span className="font-semibold">{(index ?? 0) + 1}</span>
      ),
    },
    {
      header: "Player",
      key: "userId",
      align: "left" as const,
      render: (value: any) => {
        const name = value?.name || "Unknown";
        const photo = value?.photo; // change this if your API uses a different key

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
                  // if image fails to load, hide it
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
    },
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    {
      header: "50s",
      key: "fifties",
      align: "center" as const,
      className: "font-bold text-orange-600",
    },
    { header: "Total Runs", key: "totalRuns", align: "center" as const },
  ];

  const mostTwentyFivesColumns = [
    {
      header: "Rank",
      key: "rank",
      align: "left" as const,
      render: (_: any, __: any, index?: number) => (
        <span className="font-semibold">{(index ?? 0) + 1}</span>
      ),
    },
    {
      header: "Player",
      key: "userId",
      align: "left" as const,
      render: (value: any) => {
        const name = value?.name || "Unknown";
        const photo = value?.photo; // change this if your API uses a different key

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
                  // if image fails to load, hide it
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
    },
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    {
      header: "25s",
      key: "twentyFives",
      align: "center" as const,
      className: "font-bold text-teal-600",
    },
    { header: "Total Runs", key: "totalRuns", align: "center" as const },
  ];

  const bestEconomyColumns = [
    {
      header: "Rank",
      key: "rank",
      align: "left" as const,
      render: (_: any, __: any, index?: number) => (
        <span className="font-semibold">{(index ?? 0) + 1}</span>
      ),
    },
    {
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
    },
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    {
      header: "Overs",
      key: "overs",
      align: "center" as const,
      render: (_: any, row: any) => {
        const balls = row.totalBallsBowled || 0;
        return `${Math.floor(balls / 6)}.${balls % 6}`;
      },
    },
    {
      header: "Runs",
      key: "totalRunsConceded",
      align: "center" as const,
      render: (value: any) => value || 0,
    },
    { header: "Wickets", key: "totalWickets", align: "center" as const },
    {
      header: "Econ",
      key: "economy",
      align: "center" as const,
      className: "font-bold text-emerald-600",
      render: (value: any) => value?.toFixed(2) || "0.00",
    },
  ];

  const mostCatchesColumns = [
    {
      header: "Rank",
      key: "rank",
      align: "left" as const,
      render: (_: any, __: any, index?: number) => (
        <span className="font-semibold">{(index ?? 0) + 1}</span>
      ),
    },
    {
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
    },
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    {
      header: "Catches",
      key: "totalCatches",
      align: "center" as const,
      className: "font-bold text-green-600",
      render: (value: any) => value || 0,
    },
  ];

  const mostOnesColumns = [
    {
      header: "Rank",
      key: "rank",
      align: "left" as const,
      render: (_: any, __: any, index?: number) => (
        <span className="font-semibold">{(index ?? 0) + 1}</span>
      ),
    },
    {
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
    },
    { header: "Matches", key: "matchesPlayed", align: "center" as const },
    {
      header: "1s",
      key: "totalOnes",
      align: "center" as const,
      className: "font-bold text-indigo-600",
      render: (value: any) => value || 0,
    },
    { header: "Total Runs", key: "totalRuns", align: "center" as const },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-6">Player Statistics</h1>

        <StatsSection
          title="Most Runs"
          columns={mostRunsColumns}
          data={mostRuns}
        />
        <StatsSection
          title="Most Wickets"
          columns={mostWicketsColumns}
          data={mostWickets}
        />
        <StatsSection
          title="Most Boundaries"
          columns={mostBoundariesColumns}
          data={mostBoundaries}
        />
        <StatsSection
          title="Most Fours"
          columns={mostFoursColumns}
          data={mostFours}
        />
        <StatsSection
          title="Most Sixes"
          columns={mostSixesColumns}
          data={mostSixes}
        />
        <StatsSection
          title="Highest Scores"
          columns={highestScoresColumns}
          data={highestScores}
        />
        <StatsSection
          title="Most Fifties (50s)"
          columns={mostFiftiesColumns}
          data={mostFifties}
        />
        <StatsSection
          title="Most 25s"
          columns={mostTwentyFivesColumns}
          data={mostTwentyFives}
        />
        <StatsSection
          title="Best Economy"
          columns={bestEconomyColumns}
          data={bestEconomy}
        />
        <StatsSection
          title="Most Catches"
          columns={mostCatchesColumns}
          data={mostCatches}
        />
        <StatsSection
          title="Most 1s"
          columns={mostOnesColumns}
          data={mostOnes}
        />
      </div>
    </Layout>
  );
}

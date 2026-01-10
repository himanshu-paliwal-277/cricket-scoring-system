/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface MatchCardProps {
  match: any;
  userRole?: string;
}

export function MatchCard({ match, userRole }: MatchCardProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const badges = {
      not_started: "bg-gray-200 text-gray-800",
      live: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return badges[status as keyof typeof badges] || badges.not_started;
  };

  // Get innings data
  const inning1 = match.innings?.find((i: any) => i.inningNumber === 1);
  const inning2 = match.innings?.find((i: any) => i.inningNumber === 2);

  // Determine which team batted first (1st inning)
  const teamABattedFirst =
    match.tossDecision === "bat"
      ? match.tossWinner?._id === match.teamA._id
      : match.tossWinner?._id === match.teamB._id;

  // First team in card: team that batted in 1st inning
  // Second team in card: team that batted in 2nd inning
  const firstTeamDisplay = teamABattedFirst ? match.teamA : match.teamB;
  const secondTeamDisplay = teamABattedFirst ? match.teamB : match.teamA;
  const firstTeamSnapshot = teamABattedFirst
    ? match.teamASnapshot
    : match.teamBSnapshot;
  const secondTeamSnapshot = teamABattedFirst
    ? match.teamBSnapshot
    : match.teamASnapshot;
  const firstTeamInning = inning1; // Always 1st inning
  const secondTeamInning = inning2; // Always 2nd inning

  return (
    <button
      className={`p-3 border-1 border-gray-300 rounded-md ${
        match.status === "completed" ? "cursor-pointer" : ""
      }`}
      onClick={() => {
        if (match.status === "completed") {
          router.push(`/view-scoreboard/${match._id}`);
        }
      }}
    >
      <div className="space-y-2">
        {/* Match Header with Status */}
        <div className="flex justify-between items-center pb-2">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
              match.status
            )}`}
          >
            {match.status.replace("_", " ").toUpperCase()}
          </span>
          <span className="text-sm text-gray-600">{match.overs} overs</span>
        </div>

        {/* First Team (1st inning batting team) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {firstTeamDisplay?.logo ? (
              <div className="w-10 h-10 relative rounded-full overflow-hidden">
                <Image
                  src={firstTeamDisplay?.logo}
                  alt={
                    firstTeamSnapshot?.name ||
                    firstTeamDisplay?.name ||
                    "Team Logo"
                  }
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {(firstTeamSnapshot?.name || firstTeamDisplay?.name)?.charAt(
                  0
                ) || "T"}
              </div>
            )}
            <span className="font-semibold text-sm">
              {firstTeamSnapshot?.name || firstTeamDisplay?.name}
            </span>
          </div>
          {firstTeamInning &&
            (match.status === "completed" || match.status === "live") && (
              <div className="text-right">
                <span className="text-lg font-bold">
                  {firstTeamInning.totalRuns}/{firstTeamInning.totalWickets}
                </span>
                <span className="text-gray-600 ml-2">
                  (
                  {`${firstTeamInning.currentOver}${
                    firstTeamInning.currentBall > 0
                      ? "." + firstTeamInning.currentBall
                      : ""
                  }`}
                  )
                </span>
              </div>
            )}
        </div>

        {/* Second Team (2nd inning batting team) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {secondTeamDisplay?.logo ? (
              <div className="w-10 h-10 relative rounded-full overflow-hidden">
                <Image
                  src={secondTeamDisplay?.logo}
                  alt={
                    secondTeamSnapshot?.name ||
                    secondTeamDisplay?.name ||
                    "Team B"
                  }
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                {(secondTeamSnapshot?.name || secondTeamDisplay?.name)?.charAt(
                  0
                ) || "T"}
              </div>
            )}
            <span className="font-semibold text-sm">
              {secondTeamSnapshot?.name || secondTeamDisplay?.name}
            </span>
          </div>
          {secondTeamInning &&
            (match.status === "completed" || match.status === "live") && (
              <div className="text-right">
                <span className="text-lg font-bold">
                  {secondTeamInning.totalRuns}/{secondTeamInning.totalWickets}
                </span>
                <span className="text-gray-600 ml-2">
                  (
                  {`${secondTeamInning.currentOver}${
                    secondTeamInning.currentBall > 0
                      ? "." + secondTeamInning.currentBall
                      : ""
                  }`}
                  )
                </span>
              </div>
            )}
        </div>

        {/* Result Text */}
        {match.resultText && (
          <div className="pt-2">
            <p className="text-emerald-600 font-semibold text-center text-sm">
              {match.resultText}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {match.status !== "completed" && (
          <div className="flex gap-2 pt-2">
            {match.status === "not_started" &&
              userRole &&
              userRole !== "player" && (
                <Link href={`/matches/${match._id}/start`} className="flex-1">
                  <Button className="w-full ">Start Match</Button>
                </Link>
              )}
            {match.status === "live" && (
              <Link href={`/scoring/${match._id}`} className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  {userRole === "scorer" || userRole === "owner"
                    ? "Score"
                    : "View Live Match"}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

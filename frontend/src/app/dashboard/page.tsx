"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMatches } from "@/hooks/useMatches";
import { usePlayerStats } from "@/hooks/usePlayers";
import { MatchCard } from "@/components/MatchCard";
import { Skeleton } from "@mantine/core";
import { Users, Shield, Trophy } from "lucide-react";
import { statsService } from "@/services/statsService";
import Image from "next/image";

export default function DashboardPage() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const { matches, isLoading } = useMatches();
  const { stats: playerStats, isLoading: statsLoading } = usePlayerStats(
    user?.id || "",
  );

  const [updateForm, setUpdateForm] = useState({
    battingStyle: "",
    bowlingStyle: "",
  });

  const [headToHead, setHeadToHead] = useState<{
    teamA: { _id: string; name: string; logo?: string; wins: number };
    teamB: { _id: string; name: string; logo?: string; wins: number };
    totalMatches: number;
  } | null>(null);

  useEffect(() => {
    statsService.getHeadToHead().then(setHeadToHead).catch(console.error);
  }, []);

  const liveMatches = matches?.filter((m) => m.status === "live") || [];
  const upcomingMatches =
    matches?.filter((m) => m.status === "not_started") || [];
  const recentMatches =
    matches
      ?.filter((m) => m.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5) || [];

  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      // await updatePlayer.mutateAsync({
      //   id: user.id,
      //   data: updateForm,
      // });
      alert("Player updated successfully!");
    } catch (error) {
      console.error("Failed to update player:", error);
      alert("Failed to update player");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Loading State for User Authentication */}
        {isLoadingUser && (
          <div className="space-y-6">
            <div>
              <Skeleton width={300} height={40} radius={6} mb={8} />
              <Skeleton width={150} height={24} radius={6} />
            </div>
          </div>
        )}

        {/* Welcome Screen for Non-Logged In Users */}
        {!isLoadingUser && !user && (
          <div className="text-center py-12 space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                Welcome to Cricket Scoring
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Track matches, manage teams, and view comprehensive cricket
                statistics all in one place
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Link href="/login">
                <Button>Login to Get Started</Button>
              </Link>
              {/* <Link href="/register">
                <Button>
                  Create Account
                </Button>
              </Link> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-12">
              <div className="border border-gray-300 rounded-sm shadow-sm  text-center p-6 hover:shadow-lg transition">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-semibold mb-2">Live Scoring</h3>
                <p className="text-gray-600 text-sm">
                  Score matches in real-time with detailed ball-by-ball tracking
                </p>
              </div>

              <div className="border border-gray-300 rounded-sm shadow-sm text-center p-6 hover:shadow-lg transition">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="text-lg font-semibold mb-2">Team Management</h3>
                <p className="text-gray-600 text-sm">
                  Create and manage teams, track player statistics and
                  performance
                </p>
              </div>

              <div className="border border-gray-300 rounded-sm shadow-sm text-center p-6 hover:shadow-lg transition">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="text-lg font-semibold mb-2">Detailed Stats</h3>
                <p className="text-gray-600 text-sm">
                  View comprehensive statistics including runs, wickets, and
                  strike rates
                </p>
              </div>
            </div>
          </div>
        )}

        {user && (
          <div>
            <h1 className="sm:text-3xl text-2xl font-bold">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-600">Role: {user?.role}</p>
          </div>
        )}

        {user && user?.role === "player" && user?.playerProfile && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Cricket Statistics</h2>
            {statsLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((index) => (
                    <Skeleton
                      key={index}
                      width={"100%"}
                      height={96}
                      radius={8}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((index) => (
                    <Skeleton
                      key={index}
                      width={"100%"}
                      height={96}
                      radius={8}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((index) => (
                    <Skeleton
                      key={index}
                      width={"100%"}
                      height={80}
                      radius={8}
                    />
                  ))}
                </div>
              </div>
            ) : user.playerProfile ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {user.playerProfile.matchesPlayed}
                    </p>
                    <p className="text-sm text-gray-600">Matches</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {user.playerProfile.totalRuns}
                    </p>
                    <p className="text-sm text-gray-600">Total Runs</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      {user.playerProfile.highestScore}
                    </p>
                    <p className="text-sm text-gray-600">Highest Score</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-orange-600">
                      {user.playerProfile.totalBallsFaced > 0
                        ? (
                            (user.playerProfile.totalRuns /
                              user.playerProfile.totalBallsFaced) *
                            100
                          ).toFixed(2)
                        : "0.00"}
                    </p>
                    <p className="text-sm text-gray-600">Strike Rate</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {user.playerProfile.totalWickets}
                    </p>
                    <p className="text-sm text-gray-600">Wickets</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-indigo-600">
                      {user.playerProfile.totalFours}
                    </p>
                    <p className="text-sm text-gray-600">Fours</p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-pink-600">
                      {user.playerProfile.totalSixes}
                    </p>
                    <p className="text-sm text-gray-600">Sixes</p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-teal-600">
                      {user.playerProfile.totalFours +
                        user.playerProfile.totalSixes}
                    </p>
                    <p className="text-sm text-gray-600">Boundaries</p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {user.playerProfile.total50s}
                    </p>
                    <p className="text-sm text-gray-600">50s</p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-sky-600">
                      {user.playerProfile.total25s}
                    </p>
                    <p className="text-sm text-gray-600">25s</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Batting Style</p>
                    <p className="text-lg font-semibold capitalize">
                      {user.playerProfile.battingStyle.replace("-", " ")}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Bowling Style</p>
                    <p className="text-lg font-semibold capitalize">
                      {user.playerProfile.bowlingStyle.replace("-", " ")}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-600">No stats available</p>
            )}
          </div>
        )}

        {/* {user?.role === "owner" && (
            <div>
              <h2 className="sm:text-2xl text-xl font-bold mb-4">
                Update Player Details
              </h2>
              <form onSubmit={handleUpdatePlayer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Batting Style
                  </label>
                  <Select
                    value={updateForm.battingStyle}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        battingStyle: e.target.value,
                      })
                    }
                    options={[
                      { value: "right-handed", label: "Right-handed" },
                      { value: "left-handed", label: "Left-handed" },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bowling Style
                  </label>
                  <Select
                    value={updateForm.bowlingStyle}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        bowlingStyle: e.target.value,
                      })
                    }
                    options={[
                      { value: "right-arm-fast", label: "Right-arm Fast" },
                      { value: "right-arm-medium", label: "Right-arm Medium" },
                      {
                        value: "right-arm-off-spin",
                        label: "Right-arm Off-spin",
                      },
                      {
                        value: "right-arm-leg-spin",
                        label: "Right-arm Leg-spin",
                      },
                      { value: "left-arm-fast", label: "Left-arm Fast" },
                      { value: "left-arm-medium", label: "Left-arm Medium" },
                      {
                        value: "left-arm-off-spin",
                        label: "Left-arm Off-spin",
                      },
                      {
                        value: "left-arm-leg-spin",
                        label: "Left-arm Leg-spin",
                      },
                    ]}
                  />
                </div>
                <Button type="submit" disabled={updatePlayer.isPending}>
                  {updatePlayer.isPending ? "Updating..." : "Update Player"}
                </Button>
              </form>
            </div>
          )} */}

        {user && user?.role !== "player" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/players">
              <div className="border border-gray-300 rounded-sm shadow-sm p-6 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Players</h3>
                </div>
                <p className="text-gray-600 text-sm">Manage player profiles</p>
              </div>
            </Link>

            <Link href="/teams">
              <div className="border border-gray-300 rounded-sm shadow-sm p-6 hover:shadow-lg hover:border-green-400 transition-all cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Teams</h3>
                </div>
                <p className="text-gray-600 text-sm">Create and manage teams</p>
              </div>
            </Link>

            <Link href="/matches">
              <div className="border border-gray-300 rounded-sm shadow-sm p-6 hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                    <Trophy className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Matches</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Schedule and score matches
                </p>
              </div>
            </Link>
          </div>
        )}

        {/* Loading State for Matches */}
        {isLoading && (
          <div className="space-y-6">
            <div>
              <Skeleton width={200} height={32} radius={6} mb={16} />
              <div className="grid gap-4">
                {[1, 2].map((index) => (
                  <Skeleton
                    key={index}
                    width={"100%"}
                    height={208}
                    radius={6}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Matches Section - Only show if there are live matches */}
        {!isLoading && liveMatches.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Live Matches</h2>
            <div className="grid gap-4">
              {liveMatches.map((match) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  userRole={user?.role}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Matches Section - Only show if there are upcoming matches */}
        {!isLoading && upcomingMatches.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming Matches</h2>
            <div className="grid gap-4">
              {upcomingMatches.map((match) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  userRole={user?.role}
                />
              ))}
            </div>
          </div>
        )}

        {/* Head to Head Section */}
        {headToHead && headToHead.totalMatches > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Head to Head
            </h2>
            <div className="bg-gradient-to-r from-blue-50 via-white to-green-50 border border-gray-200 rounded-lg sm:p-6 p-4">
              <div className="flex items-center justify-between">
                {/* Team A */}
                <div className="flex-1 text-center">
                  <div className="flex flex-col items-center">
                    {headToHead.teamA.logo ? (
                      <Image
                        src={headToHead.teamA.logo}
                        alt={headToHead.teamA.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-contain sm:mb-2 mb-1"
                        width={64}
                        height={64}
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-100 flex items-center justify-center mb-2 border-2 border-blue-200">
                        <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                          {headToHead.teamA.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <p className="font-semibold text-sm sm:text-base">
                      {headToHead.teamA.name}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-1 text-center px-4">
                  <div className="flex items-center justify-center gap-4 sm:gap-8">
                    <div className="text-center">
                      <p className="text-3xl sm:text-4xl font-bold text-blue-600">
                        {headToHead.teamA.wins}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">Wins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg sm:text-xl font-semibold text-gray-400">
                        {headToHead.totalMatches}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Matches
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl sm:text-4xl font-bold text-green-600">
                        {headToHead.teamB.wins}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">Wins</p>
                    </div>
                  </div>
                </div>

                {/* Team B */}
                <div className="flex-1 text-center">
                  <div className="flex flex-col items-center">
                    {headToHead.teamB.logo ? (
                      <Image
                        src={headToHead.teamB.logo}
                        alt={headToHead.teamB.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-contain sm:mb-2 mb-1"
                        width={64}
                        height={64}
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 flex items-center justify-center mb-2 border-2 border-green-200">
                        <span className="text-2xl sm:text-3xl font-bold text-green-600">
                          {headToHead.teamB.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <p className="font-semibold text-sm sm:text-base">
                      {headToHead.teamB.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Matches Section */}
        {!isLoading && recentMatches.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Matches</h2>
            <div className="grid gap-4">
              {recentMatches.map((match) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  userRole={user?.role}
                />
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/matches">
                <Button variant="secondary">View More Matches</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { useMatches } from "@/hooks/useMatches";
import { usePlayerStats } from "@/hooks/usePlayers";

export default function DashboardPage() {
  const { user } = useAuth();
  const { matches, isLoading } = useMatches();
  const { stats: playerStats, isLoading: statsLoading } = usePlayerStats(
    user?.id || ""
  );
  // const { updatePlayer } = usePlayer(user?.id || "");

  const [updateForm, setUpdateForm] = useState({
    battingStyle: "",
    bowlingStyle: "",
  });

  const liveMatches = matches?.filter((m) => m.status === "live") || [];
  const upcomingMatches =
    matches?.filter((m) => m.status === "not_started") || [];

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
        {!user && (
          <div className="text-center py-12 space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                Welcome to Cricket Scoring
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Track matches, manage teams, and view comprehensive cricket statistics all in one place
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" variant="default">
                  Login to Get Started
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Create Account
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-12">
              <Card className="text-center p-6 hover:shadow-lg transition">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-semibold mb-2">Live Scoring</h3>
                <p className="text-gray-600 text-sm">
                  Score matches in real-time with detailed ball-by-ball tracking
                </p>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="text-lg font-semibold mb-2">Team Management</h3>
                <p className="text-gray-600 text-sm">
                  Create and manage teams, track player statistics and performance
                </p>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="text-lg font-semibold mb-2">Detailed Stats</h3>
                <p className="text-gray-600 text-sm">
                  View comprehensive statistics including runs, wickets, and strike rates
                </p>
              </Card>
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
          <Card>
            <h2 className="text-2xl font-bold mb-4">Your Cricket Statistics</h2>
            {statsLoading ? (
              <p>Loading stats...</p>
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
          </Card>
        )}

        {/* {user?.role === "owner" && (
            <Card>
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
            </Card>
          )} */}

        {user && user?.role !== "player" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/players">
              <Card className="hover:shadow-lg transition cursor-pointer">
                <h3 className="text-xl font-semibold mb-2">Players</h3>
                <p className="text-gray-600">Manage player profiles</p>
              </Card>
            </Link>

            <Link href="/teams">
              <Card className="hover:shadow-lg transition cursor-pointer">
                <h3 className="text-xl font-semibold mb-2">Teams</h3>
                <p className="text-gray-600">Create and manage teams</p>
              </Card>
            </Link>

            <Link href="/matches">
              <Card className="hover:shadow-lg transition cursor-pointer">
                <h3 className="text-xl font-semibold mb-2">Matches</h3>
                <p className="text-gray-600">Schedule and score matches</p>
              </Card>
            </Link>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4">Live Matches</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : liveMatches.length > 0 ? (
            <div className="grid gap-4">
              {liveMatches.map((match) => (
                <Card key={match._id}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {match?.teamA?.name} vs {match?.teamB?.name}
                      </h3>
                      <p className="text-green-600 font-semibold">LIVE</p>
                    </div>
                    <Link href={`/scoring/${match._id}`}>
                      <Button>View Score</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No live matches</p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Upcoming Matches</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : upcomingMatches.length > 0 ? (
            <div className="grid gap-4">
              {upcomingMatches.map((match) => (
                <Card key={match._id}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {match.teamA.name} vs {match.teamB.name}
                      </h3>
                      <p className="text-gray-600">{match.overs} overs</p>
                    </div>
                    {user?.role !== "player" && (
                      <Link href={`/matches/${match._id}/start`}>
                        <Button>Start Match</Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No upcoming matches</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="sm:text-3xl text-2xl font-bold">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-600">Role: {user?.role}</p>
          </div>

          {user?.role === "player" && (
            <Card>
              <h2 className="text-2xl font-bold mb-4">Your Statistics</h2>
              {statsLoading ? (
                <p>Loading stats...</p>
              ) : playerStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {playerStats.totalRuns}
                    </p>
                    <p className="text-sm text-gray-600">Total Runs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {playerStats.totalWickets}
                    </p>
                    <p className="text-sm text-gray-600">Total Wickets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {playerStats.matchesPlayed}
                    </p>
                    <p className="text-sm text-gray-600">Matches Played</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {playerStats.average || 0}
                    </p>
                    <p className="text-sm text-gray-600">Batting Average</p>
                  </div>
                </div>
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

          {user?.role !== "player" && (
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
    </ProtectedRoute>
  );
}

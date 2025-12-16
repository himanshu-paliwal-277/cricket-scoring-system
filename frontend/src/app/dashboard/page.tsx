"use client";

import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMatches } from "@/hooks/useMatches";

export default function DashboardPage() {
  const { user } = useAuth();
  const { matches, isLoading } = useMatches();

  const liveMatches = matches.filter((m) => m.status === "live");
  const upcomingMatches = matches.filter((m) => m.status === "not_started");

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
            <p className="text-gray-600">Role: {user?.role}</p>
          </div>

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
                          {match.teamA.name} vs {match.teamB.name}
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
            {upcomingMatches.length > 0 ? (
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

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useMatches } from "@/hooks/useMatches";
import { useTeams } from "@/hooks/useTeams";
import { useAuth } from "@/hooks/useAuth";

export default function MatchesPage() {
  const { matches, isLoading, createMatch, isCreating } = useMatches();
  const { teams } = useTeams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    teamA: "",
    teamB: "",
    overs: 6,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMatch(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ teamA: "", teamB: "", overs: 6 });
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      not_started: "bg-gray-200 text-gray-800",
      live: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return badges[status as keyof typeof badges] || badges.not_started;
  };

  // Group matches by date
  const groupMatchesByDate = (matches: any[]) => {
    const groups: { [key: string]: any[] } = {};

    matches.forEach((match) => {
      const date = new Date(match.createdAt);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(match);
    });

    return groups;
  };

  // Format date label (Today, Yesterday, or date)
  const formatDateLabel = (dateKey: string) => {
    const date = new Date(dateKey);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time parts for comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "Today";
    } else if (date.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      // Format: "December 25, 2025 - Sunday"
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });
    }
  };

  const groupedMatches = matches ? groupMatchesByDate(matches) : {};
  const sortedDateKeys = Object.keys(groupedMatches).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <Layout>
      <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Matches</h1>
            {user && user?.role === "owner" && (
              <Button onClick={() => setIsModalOpen(true)}>Create Match</Button>
            )}
          </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-8">
            {sortedDateKeys.map((dateKey) => (
              <div key={dateKey}>
                {/* Date Header */}
                <div className="sticky top-0 z-10 bg-gray-100 rounded-lg px-4 py-2 mb-4">
                  <h2 className="text-sm font-semibold text-gray-700 text-center">
                    {formatDateLabel(dateKey)}
                  </h2>
                </div>

                {/* Matches for this date */}
                <div className="grid gap-4">
                  {groupedMatches[dateKey].map((match) => (
                    <Card key={match._id}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">
                            {match?.teamA?.name} vs {match?.teamB?.name}
                          </h3>
                          <p className="text-gray-600">{match.overs} overs</p>
                          <span
                            className={`inline-block px-2 py-1 rounded text-sm mt-2 ${getStatusBadge(
                              match.status
                            )}`}
                          >
                            {match.status.replace("_", " ").toUpperCase()}
                          </span>
                          {match.resultText && (
                            <p className="text-emerald-600 font-semibold mt-2">
                              {match.resultText}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {match.status === "not_started" &&
                            user?.role !== "player" && (
                              <Link href={`/matches/${match._id}/start`}>
                                <Button>Start</Button>
                              </Link>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {match.status === "not_started" && user &&
                              user?.role !== "player" && (
                                <Link href={`/matches/${match._id}/start`}>
                                  <Button>Start</Button>
                                </Link>
                              )}
                            {match.status === "live" && user?.role !== "player" && (
                              <Link href={`/scoring/${match._id}`}>
                                <Button>Score</Button>
                              </Link>
                            )}
                          {match.status === "completed" && (
                            <Link href={`/view-scoreboard/${match._id}`}>
                              <Button>View</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {sortedDateKeys.length === 0 && (
              <Card>
                <p className="text-center text-gray-500 py-8">
                  No matches found. Create your first match!
                </p>
              </Card>
            )}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Match"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Team A"
              value={formData.teamA}
              onChange={(e) =>
                setFormData({ ...formData, teamA: e.target.value })
              }
              options={[
                { value: "", label: "Select Team A" },
                ...teams.map((team) => ({
                  value: team._id,
                  label: team.name,
                })),
              ]}
              required
            />

            <Select
              label="Team B"
              value={formData.teamB}
              onChange={(e) =>
                setFormData({ ...formData, teamB: e.target.value })
              }
              options={[
                { value: "", label: "Select Team B" },
                ...teams.map((team) => ({
                  value: team._id,
                  label: team.name,
                })),
              ]}
              required
            />

            <Input
              label="Overs"
              type="number"
              min="1"
              max="50"
              value={formData.overs}
              onChange={(e) =>
                setFormData({ ...formData, overs: parseInt(e.target.value) })
              }
              required
            />

            <Button type="submit" className="w-full" isLoading={isCreating}>
              Create Match
            </Button>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}

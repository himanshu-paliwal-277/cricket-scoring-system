/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useMatches } from "@/hooks/useMatches";
import { useTeams } from "@/hooks/useTeams";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function MatchesPage() {
  const { matches, isLoading, createMatch, isCreating } = useMatches();
  const { teams } = useTeams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  // Initialize formData with default team selections
  const [formData, setFormData] = useState({
    teamA: "",
    teamB: "",
    overs: 6,
  });

  const router = useRouter();

  // Get default team A and B based on teams array
  const defaultTeamA = useMemo(
    () => (teams && teams.length >= 1 ? teams[0]._id : ""),
    [teams]
  );
  const defaultTeamB = useMemo(
    () => (teams && teams.length >= 2 ? teams[1]._id : ""),
    [teams]
  );

  // Update formData when modal opens with default values
  const handleModalOpen = () => {
    setFormData({
      teamA: defaultTeamA,
      teamB: defaultTeamB,
      overs: 6,
    });
    setIsModalOpen(true);
  };

  // Filter teams for Team A dropdown (exclude Team B)
  const teamAOptions = useMemo(() => {
    return teams.filter((team) => team._id !== formData.teamB);
  }, [teams, formData.teamB]);

  // Filter teams for Team B dropdown (exclude Team A)
  const teamBOptions = useMemo(() => {
    return teams.filter((team) => team._id !== formData.teamA);
  }, [teams, formData.teamA]);

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
          <h1 className="text-2xl font-bold">Matches</h1>
          {user && user?.role === "owner" && (
            <Button onClick={handleModalOpen}>Create Match</Button>
          )}
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-8">
            {sortedDateKeys.map((dateKey) => (
              <div key={dateKey}>
                {/* Date Header */}
                <div className="sticky top-0 z-10 bg-gray-100 rounded-sm px-4 py-2 mb-4">
                  <h2 className="text-sm font-semibold text-gray-700 text-center">
                    {formatDateLabel(dateKey)}
                  </h2>
                </div>

                {/* Matches for this date */}
                <div className="grid gap-4">
                  {groupedMatches[dateKey].map((match) => {
                    // Get innings data
                    const inning1 = match.innings?.find(
                      (i: any) => i.inningNumber === 1
                    );
                    const inning2 = match.innings?.find(
                      (i: any) => i.inningNumber === 2
                    );

                    // Determine which team batted first based on toss
                    const teamABattedFirst =
                      match.tossDecision === "bat"
                        ? match.tossWinner?._id === match.teamA._id
                        : match.tossWinner?._id === match.teamB._id;

                    const teamAInning = teamABattedFirst ? inning1 : inning2;
                    const teamBInning = teamABattedFirst ? inning2 : inning1;

                    return (
                      <button
                        className="p-3 border-1 border-gray-300 rounded-md"
                        key={match._id}
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
                            <span className="text-sm text-gray-600">
                              {match.overs} overs
                            </span>
                          </div>

                          {/* Team A */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {match.teamA?.logo ? (
                                <div className="w-10 h-10 relative rounded-full overflow-hidden">
                                  <Image
                                    src={match?.teamA?.logo}
                                    alt={match?.teamA?.name || "Team Logo"}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                  {match.teamA?.name?.charAt(0) || "T"}
                                </div>
                              )}
                              <span className="font-semibold text-sm">
                                {match.teamA?.name}
                              </span>
                            </div>
                            {teamAInning && match.status === "completed" && (
                              <div className="text-right">
                                <span className="text-lg font-bold">
                                  {teamAInning.totalRuns}/
                                  {teamAInning.totalWickets}
                                </span>
                                <span className="text-gray-600 ml-2">
                                  (
                                  {`${teamAInning.currentOver}${
                                    teamAInning.currentBall > 0
                                      ? "." + teamAInning.currentBall
                                      : ""
                                  }`}
                                  )
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Team B */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {match.teamB?.logo ? (
                                <div className="w-10 h-10 relative rounded-full overflow-hidden">
                                  <Image
                                    src={match?.teamB?.logo}
                                    alt={match?.teamB?.name || "Team B"}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                                  {match.teamB?.name?.charAt(0) || "T"}
                                </div>
                              )}
                              <span className="font-semibold text-sm">
                                {match.teamB?.name}
                              </span>
                            </div>
                            {teamBInning && match.status === "completed" && (
                              <div className="text-right">
                                <span className="text-lg font-bold">
                                  {teamBInning.totalRuns}/
                                  {teamBInning.totalWickets}
                                </span>
                                <span className="text-gray-600 ml-2">
                                  (
                                  {`${teamBInning.currentOver}${
                                    teamBInning.currentBall > 0
                                      ? "." + teamBInning.currentBall
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
                                user &&
                                user?.role !== "player" && (
                                  <Link
                                    href={`/matches/${match._id}/start`}
                                    className="flex-1"
                                  >
                                    <Button className="w-full ">
                                      Start Match
                                    </Button>
                                  </Link>
                                )}
                              {match.status === "live" &&
                                user?.role !== "player" && (
                                  <Link
                                    href={`/scoring/${match._id}`}
                                    className="flex-1"
                                  >
                                    <Button className="w-full bg-green-600 hover:bg-green-700">
                                      Score
                                    </Button>
                                  </Link>
                                )}
                              {/* {match.status === "completed" && (
                                <Link
                                  href={`/view-scoreboard/${match._id}`}
                                  className="flex-1 "
                                >
                                  <Button className="w-full ">
                                    View Scorecard
                                  </Button>
                                </Link>
                              )} */}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
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
            {/* Old logic - commented out */}
            {/* <Select
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
            /> */}

            {/* New logic - Team A defaults to teams[0], Team B defaults to teams[1] */}
            {/* If one team is selected, it won't show in the other dropdown */}
            <Select
              label="Team A"
              value={formData.teamA}
              onChange={(e) =>
                setFormData({ ...formData, teamA: e.target.value })
              }
              options={teamAOptions.map((team) => ({
                value: team._id,
                label: team.name,
              }))}
              required
            />

            <Select
              label="Team B"
              value={formData.teamB}
              onChange={(e) =>
                setFormData({ ...formData, teamB: e.target.value })
              }
              options={teamBOptions.map((team) => ({
                value: team._id,
                label: team.name,
              }))}
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

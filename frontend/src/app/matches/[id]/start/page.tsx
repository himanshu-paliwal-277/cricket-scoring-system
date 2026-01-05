"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useMatch, useMatches } from "@/hooks/useMatches";
import { usePlayers } from "@/hooks/usePlayers";
import Image from "next/image";

export default function StartMatchPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.id as string;
  const { match, isLoading } = useMatch(matchId);
  const { startMatch, isStarting } = useMatches();
  const { players } = usePlayers();

  const [formData, setFormData] = useState({
    tossWinner: "",
    tossDecision: "bat" as "bat" | "bowl",
    striker: "",
    nonStriker: "",
    bowler: "",
  });

  const teamAPlayers = match?.teamA.players || [];
  const teamBPlayers = match?.teamB.players || [];
  const battingTeamPlayers =
    formData.tossWinner === match?.teamA._id
      ? formData.tossDecision === "bat"
        ? teamAPlayers
        : teamBPlayers
      : formData.tossDecision === "bat"
      ? teamBPlayers
      : teamAPlayers;
  const bowlingTeamPlayers =
    formData.tossWinner === match?.teamA._id
      ? formData.tossDecision === "bowl"
        ? teamAPlayers
        : teamBPlayers
      : formData.tossDecision === "bowl"
      ? teamBPlayers
      : teamAPlayers;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startMatch(
      { id: matchId, data: formData },
      {
        onSuccess: () => {
          router.push(`/scoring/${matchId}`);
        },
      }
    );
  };

  if (isLoading || !match)
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );

  return (
    <ProtectedRoute allowedRoles={["owner", "scorer"]}>
      <Layout>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Start Match</h1>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <Image src={match.teamA.logo} alt="logo" width={50} height={50} />
              <h2 className="text-md mb-6 min-w-36 text-center">
                {match.teamA.name}
              </h2>
            </div>
            <span className="text-gray-500">VS</span>
            <div className="flex flex-col items-center">
              <Image src={match.teamB.logo} alt="logo" width={50} height={50} />
              <h2 className="text-md mb-6 min-w-36 text-center">
                {match.teamB.name}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Toss Winner"
              value={formData.tossWinner}
              onChange={(e) =>
                setFormData({ ...formData, tossWinner: e.target.value })
              }
              options={[
                { value: "", label: "Select Toss Winner" },
                { value: match.teamA._id, label: match.teamA.name },
                { value: match.teamB._id, label: match.teamB.name },
              ]}
              required
            />

            <Select
              label="Toss Decision"
              value={formData.tossDecision}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tossDecision: e.target.value as "bat" | "bowl",
                })
              }
              options={[
                { value: "bat", label: "Bat" },
                { value: "bowl", label: "Bowl" },
              ]}
            />

            {formData.tossWinner && (
              <>
                <Select
                  label="Striker"
                  value={formData.striker}
                  onChange={(e) =>
                    setFormData({ ...formData, striker: e.target.value })
                  }
                  options={[
                    { value: "", label: "Select Striker" },
                    ...battingTeamPlayers.map((playerId: string) => {
                      const player = players.find((p) => p._id === playerId);
                      return {
                        value: playerId,
                        label: player?.userId.name || "",
                      };
                    }),
                  ]}
                  required
                />

                <Select
                  label="Non-Striker"
                  value={formData.nonStriker}
                  onChange={(e) =>
                    setFormData({ ...formData, nonStriker: e.target.value })
                  }
                  options={[
                    { value: "", label: "Select Non-Striker" },
                    ...battingTeamPlayers
                      .filter((id: string) => id !== formData.striker)
                      .map((playerId: string) => {
                        const player = players.find((p) => p._id === playerId);
                        return {
                          value: playerId,
                          label: player?.userId.name || "",
                        };
                      }),
                  ]}
                  required
                />

                <Select
                  label="Bowler"
                  value={formData.bowler}
                  onChange={(e) =>
                    setFormData({ ...formData, bowler: e.target.value })
                  }
                  options={[
                    { value: "", label: "Select Bowler" },
                    ...bowlingTeamPlayers.map((playerId: string) => {
                      const player = players.find((p) => p._id === playerId);
                      return {
                        value: playerId,
                        label: player?.userId.name || "",
                      };
                    }),
                  ]}
                  required
                />
              </>
            )}

            <Button type="submit" className="w-full" isLoading={isStarting}>
              Start Match
            </Button>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

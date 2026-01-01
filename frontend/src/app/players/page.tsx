"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { usePlayers } from "@/hooks/usePlayers";

export default function PlayersPage() {
  const { players, isLoading, createPlayer, isCreating, deletePlayer } =
    usePlayers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    battingStyle: "right-hand",
    bowlingStyle: "right-arm-fast",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPlayer(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          battingStyle: "right-hand",
          bowlingStyle: "right-arm-fast",
        });
      },
    });
  };

  return (
    <ProtectedRoute allowedRoles={["owner", "scorer"]}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Players</h1>
            <Button onClick={() => setIsModalOpen(true)}>Add Player</Button>
          </div>

          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player) => (
                <Card key={player._id}>
                  <h3 className="text-xl font-semibold mb-2">
                    {player.userId.name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Batting: {player.battingStyle}</p>
                    <p>Bowling: {player.bowlingStyle}</p>
                    <p>Matches: {player.matchesPlayed}</p>
                    <p>Runs: {player.totalRuns}</p>
                    <p>Wickets: {player.totalWickets}</p>
                    <p>Highest Score: {player.highestScore}</p>
                  </div>
                  {/* <Button
                    variant="danger"
                    className="mt-4 w-full"
                    onClick={() => deletePlayer(player._id)}
                  >
                    Delete
                  </Button> */}
                </Card>
              ))}
            </div>
          )}

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Add Player"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Player name"
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="player@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Create password"
                required
              />

              <Select
                label="Batting Style"
                value={formData.battingStyle}
                onChange={(e) =>
                  setFormData({ ...formData, battingStyle: e.target.value })
                }
                options={[
                  { value: "right-hand", label: "Right Hand" },
                  { value: "left-hand", label: "Left Hand" },
                ]}
              />

              <Select
                label="Bowling Style"
                value={formData.bowlingStyle}
                onChange={(e) =>
                  setFormData({ ...formData, bowlingStyle: e.target.value })
                }
                options={[
                  { value: "right-arm-fast", label: "Right Arm Fast" },
                  { value: "left-arm-fast", label: "Left Arm Fast" },
                  { value: "right-arm-spin", label: "Right Arm Spin" },
                  { value: "left-arm-spin", label: "Left Arm Spin" },
                  { value: "none", label: "None" },
                ]}
              />

              <Button type="submit" className="w-full" isLoading={isCreating}>
                Create Player
              </Button>
            </form>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

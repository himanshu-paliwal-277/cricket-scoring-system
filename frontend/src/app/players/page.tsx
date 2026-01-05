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
        <div className="">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Players</h1>
            <Button onClick={() => setIsModalOpen(true)}>Add Player</Button>
          </div>

          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="border-1 border-gray-300 rounded-sm overflow-hidden">
              <div className="border-b-1 text-sm border-gray-400 bg-gray-100 px-3 py-2 flex items-center justify-between">
                <div className="flex gap-5">
                  <p className="text-md font-bold min-w-8">S.no</p>
                  <p className="text-md font-bold min-w-28">Name</p>
                </div>
                <p className="text-md min-w-8 font-bold">Matches</p>
                <p className="text-md min-w-8 font-bold">Runs</p>
              </div>
              {players.map((player, index) => (
                <div
                  className="border-b-1 text-sm border-gray-300 px-3 py-2 flex items-center justify-between"
                  key={player._id}
                >
                  <div className="flex gap-5">
                    <p className="min-w-8">{index + 1}</p>
                    <p className="font-semibold min-w-28">
                      {player.userId.name}
                    </p>
                  </div>
                  <p className="min-w-8">{player.matchesPlayed}</p>
                  <p className="min-w-8">{player.totalRuns}</p>
                </div>
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

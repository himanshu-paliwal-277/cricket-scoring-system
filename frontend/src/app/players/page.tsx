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
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@mantine/core";
import { Player } from "@/services/playerService";

export default function PlayersPage() {
  const {
    players,
    isLoading,
    createPlayer,
    isCreating,
    deletePlayer,
    togglePlayerActive,
    isTogglingActive,
  } = usePlayers();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
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

  const handlePlayerClick = (player: Player) => {
    if (user?.role === "owner") {
      setSelectedPlayer(player);
    }
  };

  const handleToggleActive = () => {
    if (selectedPlayer) {
      togglePlayerActive(selectedPlayer._id, {
        onSuccess: () => {
          setSelectedPlayer(null);
        },
      });
    }
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
            <Skeleton width={"100%"} height={500} className="" />
          ) : (
            <div className="border-1 border-gray-300 rounded-sm overflow-hidden">
              <div className="border-b-1 text-sm border-gray-400 bg-gray-100 px-3 py-2 flex items-center justify-between">
                <div className="flex gap-5">
                  <p className="text-md font-bold min-w-8">S.no</p>
                  <p className="text-md font-bold min-w-32">Name</p>
                </div>
                {/* <p className="text-md min-w-16 font-bold">Status</p> */}
                <p className="text-md min-w-20 font-bold">Matches</p>
                <p className="text-md min-w-16 font-bold">Runs</p>
              </div>
              {players.map((player, index) => (
                <div
                  className={`border-b-1 text-sm border-gray-300 px-3 py-2 flex items-center justify-between ${
                    user?.role === "owner"
                      ? "cursor-pointer hover:bg-gray-50"
                      : ""
                  } ${!player.isActive ? "opacity-60 bg-gray-50" : ""}`}
                  key={player._id}
                  onClick={() => handlePlayerClick(player)}
                >
                  <div className="flex gap-5 items-center">
                    <p className="min-w-8">{index + 1}</p>
                    <div className="flex items-center gap-1.5 min-w-32">
                      <div
                        className={`w-1 h-1 rounded-full ${
                          player.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                        title={player.isActive ? "Active" : "Inactive"}
                      />
                      <p className="font-semibold">{player.userId.name}</p>
                    </div>
                  </div>
                  {/* <p className="min-w-16">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      player.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {player.isActive ? "Active" : "Inactive"}
                    </span>
                  </p> */}
                  <p className="min-w-20">{player.matchesPlayed}</p>
                  <p className="min-w-16">{player.totalRuns}</p>
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

          {/* Player Details Modal */}
          <Modal
            isOpen={!!selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
            title="Player Details"
          >
            {selectedPlayer && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">
                      {selectedPlayer.userId.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">
                      {selectedPlayer.userId.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Batting Style</p>
                    <p className="font-semibold capitalize">
                      {selectedPlayer.battingStyle.replace("-", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bowling Style</p>
                    <p className="font-semibold capitalize">
                      {selectedPlayer.bowlingStyle.replace("-", " ")}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Matches</p>
                      <p className="text-lg font-bold">
                        {selectedPlayer.matchesPlayed}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Runs</p>
                      <p className="text-lg font-bold">
                        {selectedPlayer.totalRuns}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Wickets</p>
                      <p className="text-lg font-bold">
                        {selectedPlayer.totalWickets}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Highest Score</p>
                      <p className="text-lg font-bold">
                        {selectedPlayer.highestScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fours</p>
                      <p className="text-lg font-bold">
                        {selectedPlayer.totalFours}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sixes</p>
                      <p className="text-lg font-bold">
                        {selectedPlayer.totalSixes}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fifties</p>
                      <p className="text-lg font-bold">
                        {selectedPlayer.total50s}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Twenty-Fives</p>
                      <p className="text-lg font-bold">
                        {selectedPlayer.total25s}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Player Status</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          selectedPlayer.isActive
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="font-medium">
                        {selectedPlayer.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <Button
                      onClick={handleToggleActive}
                      isLoading={isTogglingActive}
                      variant={
                        selectedPlayer.isActive ? "secondary" : "primary"
                      }
                    >
                      {selectedPlayer.isActive
                        ? "Deactivate Player"
                        : "Activate Player"}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedPlayer.isActive
                      ? "Active players can be selected for teams and matches."
                      : "Inactive players cannot be selected for teams or matches."}
                  </p>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

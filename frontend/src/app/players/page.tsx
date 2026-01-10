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
import Image from "next/image";

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
                {/* Player Header */}
                <div className="flex items-center gap-4 ">
                  {selectedPlayer.userId.photo ? (
                    <Image
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      src={selectedPlayer.userId.photo}
                      alt={selectedPlayer.userId.name}
                      width={80}
                      height={80}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-200">
                      {selectedPlayer.userId.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedPlayer.userId.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedPlayer.userId.email}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Batting:</span>
                        <span className="text-xs font-semibold text-gray-700 capitalize">
                          {selectedPlayer.battingStyle.replace("-", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Bowling:</span>
                        <span className="text-xs font-semibold text-gray-700 capitalize">
                          {selectedPlayer.bowlingStyle.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">
                    Career Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg px-4 py-3 border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium">
                        Matches Played
                      </p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {selectedPlayer.matchesPlayed}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg px-4 py-3 border border-green-200">
                      <p className="text-xs text-green-700 font-medium">
                        Total Runs
                      </p>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {selectedPlayer.totalRuns}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg px-4 py-3 border border-red-200">
                      <p className="text-xs text-red-700 font-medium">
                        Wickets
                      </p>
                      <p className="text-2xl font-bold text-red-900 mt-1">
                        {selectedPlayer.totalWickets}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg px-4 py-3 border border-purple-200">
                      <p className="text-xs text-purple-700 font-medium">
                        Highest Score
                      </p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        {selectedPlayer.highestScore}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg px-4 py-3 border border-orange-200">
                      <p className="text-xs text-orange-700 font-medium">
                        Fours
                      </p>
                      <p className="text-2xl font-bold text-orange-900 mt-1">
                        {selectedPlayer.totalFours}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg px-4 py-3 border border-pink-200">
                      <p className="text-xs text-pink-700 font-medium">Sixes</p>
                      <p className="text-2xl font-bold text-pink-900 mt-1">
                        {selectedPlayer.totalSixes}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg px-4 py-3 border border-indigo-200">
                      <p className="text-xs text-indigo-700 font-medium">
                        Fifties
                      </p>
                      <p className="text-2xl font-bold text-indigo-900 mt-1">
                        {selectedPlayer.total50s}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg px-4 py-3 border border-teal-200">
                      <p className="text-xs text-teal-700 font-medium">
                        Twenty-Fives
                      </p>
                      <p className="text-2xl font-bold text-teal-900 mt-1">
                        {selectedPlayer.total25s}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Player Status */}
                <div className="">
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">
                    Player Status
                  </h3>
                  <div className="">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            selectedPlayer.isActive
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span className="font-semibold text-gray-900">
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
                    <p className="text-xs mx-auto text-center mb-2 text-gray-600">
                      {selectedPlayer.isActive
                        ? "Active players can be selected for teams and matches."
                        : "Inactive players cannot be selected for teams or matches."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

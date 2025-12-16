"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useTeams } from "@/hooks/useTeams";
import { usePlayers } from "@/hooks/usePlayers";

export default function TeamsPage() {
  const { teams, isLoading, createTeam, isCreating, deleteTeam } = useTeams();
  const { players } = usePlayers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    players: [] as string[],
  });

  const handlePlayerToggle = (playerId: string) => {
    setFormData((prev) => ({
      ...prev,
      players: prev.players.includes(playerId)
        ? prev.players.filter((id) => id !== playerId)
        : [...prev.players, playerId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTeam(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ name: "", players: [] });
      },
    });
  };

  return (
    <ProtectedRoute allowedRoles={["owner", "scorer"]}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Teams</h1>
            <Button onClick={() => setIsModalOpen(true)}>Create Team</Button>
          </div>

          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <Card key={team._id}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{team.name}</h3>
                    {team.isLocked && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{team.players.length} players</p>
                  {!team.isLocked && (
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={() => deleteTeam(team._id)}
                    >
                      Delete
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Team">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Team Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Players (Minimum 2)
                </label>
                <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-2">
                  {players.map((player) => (
                    <div key={player._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={player._id}
                        checked={formData.players.includes(player._id)}
                        onChange={() => handlePlayerToggle(player._id)}
                        className="mr-2"
                      />
                      <label htmlFor={player._id} className="cursor-pointer">
                        {player.userId.name}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {formData.players.length}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isCreating}
                disabled={formData.players.length < 2}
              >
                Create Team
              </Button>
            </form>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

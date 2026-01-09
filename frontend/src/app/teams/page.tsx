"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useTeams } from "@/hooks/useTeams";
import { usePlayers } from "@/hooks/usePlayers";
import { Team } from "@/services/teamService";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@mantine/core";

export default function TeamsPage() {
  const { teams, isLoading, updateTeam, isUpdating } = useTeams();
  const { players } = usePlayers();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    players: [] as string[],
    captain: "",
  });
  const [selectedCommonPlayer, setSelectedCommonPlayer] = useState<string>("");
  const [isAddingCommonPlayer, setIsAddingCommonPlayer] = useState(false);

  // Initialize teams on component mount
  useEffect(() => {
    // Teams will be automatically fetched by useTeams hook
  }, []);

  const team1 = teams?.find((t) => t.teamType === "team1");
  const team2 = teams?.find((t) => t.teamType === "team2");

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    const captainId =
      typeof team.captain === "string" ? team.captain : team.captain?._id || "";
    setFormData({
      name: team.name,
      players: team.players.map((p) => p._id),
      captain: captainId,
    });
  };

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
    if (!editingTeam) return;

    updateTeam(
      { id: editingTeam._id, data: formData },
      {
        onSuccess: () => {
          setEditingTeam(null);
          setFormData({ name: "", players: [], captain: "" });
        },
      }
    );
  };

  const handleAddCommonPlayer = async () => {
    if (!selectedCommonPlayer || !team1 || !team2) return;

    setIsAddingCommonPlayer(true);

    try {
      // Add common player to team1
      const team1Players = [
        ...team1.players.map((p) => p._id),
        selectedCommonPlayer,
      ];

      await updateTeam(
        {
          id: team1._id,
          data: { players: team1Players },
        },
        { onSuccess: () => {} }
      );

      // Add common player to team2
      const team2Players = [
        ...team2.players.map((p) => p._id),
        selectedCommonPlayer,
      ];

      await updateTeam(
        {
          id: team2._id,
          data: { players: team2Players },
        },
        { onSuccess: () => {} }
      );

      // Clear selection after adding
      setSelectedCommonPlayer("");
    } catch (error) {
      console.error("Error adding common player:", error);
    } finally {
      setIsAddingCommonPlayer(false);
    }
  };

  // Get players who are not in either team
  const getPlayersNotInAnyTeam = () => {
    const team1PlayerIds = team1?.players.map((p) => p._id) || [];
    const team2PlayerIds = team2?.players.map((p) => p._id) || [];
    const allTeamPlayerIds = [...team1PlayerIds, ...team2PlayerIds];

    return players.filter((player) => !allTeamPlayerIds.includes(player._id));
  };

  const getAvailablePlayers = (currentTeam: Team) => {
    const otherTeam = currentTeam.teamType === "team1" ? team2 : team1;
    const otherTeamPlayerIds = otherTeam?.players.map((p) => p._id) || [];

    return players.filter((player) => !otherTeamPlayerIds.includes(player._id));
  };

  const renderTeamCard = (team: Team | undefined) => {
    if (!team) return null;

    return (
      <div className="border-1 p-4 border-gray-300 rounded-md" key={team._id}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">{team.name}</h3>
            <p className="text-xs text-gray-500">
              {team.teamType === "team1" ? "First Team" : "Second Team"}
            </p>
            {team.captain &&
              typeof team.captain === "object" &&
              team.captain.userId && (
                <p className="text-xs font-semibold text-blue-600 mt-1">
                  Captain: {team.captain.userId.name}
                </p>
              )}
          </div>
          {user?.role === "owner" && (
            <button
              className="bg-gray-200 rounded-sm px-3 py-1.5 text-sm!"
              onClick={() => handleEditTeam(team)}
            >
              Edit Team
            </button>
          )}
        </div>

        <div className="">
          <h4 className="font-semibold mb-2">
            Players ({team.players.length})
          </h4>
          {team.players.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2">
              {team.players.map((player) => (
                <li
                  key={player._id}
                  className="text-sm flex items-center justify-between bg-gray-50 border-1 border-gray-200 p-2 rounded"
                >
                  <span>{player.userId.name}</span>
                  {/* <span className=" text-gray-500">{player.userId.email}</span> */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No players added yet</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={["owner", "scorer", "player"]}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Teams</h1>
              {/* <p className="text-gray-600 mt-1">
                Manage your two teams. Players can only be in one team at a
                time.
              </p> */}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-6">
              <Skeleton width={"100%"} height={227} className="mt-6" />
              <Skeleton width={"100%"} height={227} className="mt-6" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderTeamCard(team1)}
              {renderTeamCard(team2)}
            </div>
          )}

          {!team1 && !team2 && !isLoading && (
            <div>
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  No teams found. Teams will be automatically created when you
                  access this page.
                </p>
                <p className="text-sm text-gray-500">
                  Please refresh the page if teams don&apos;t appear.
                </p>
              </div>
            </div>
          )}

          {/* Common Player Section */}
          {user?.role === "owner" && !isLoading && team1 && team2 && (
            <div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Add Common Player
                  </h3>
                  {/* <p className="text-sm text-gray-600">
                    Select a player to add to both teams automatically. The common player will appear in both Team 1 and Team 2.
                  </p> */}
                </div>

                {/* Select Player Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Common Player
                  </label>
                  <select
                    value={selectedCommonPlayer}
                    onChange={(e) => setSelectedCommonPlayer(e.target.value)}
                    className="w-full border border-gray-300 rounded-sm px-3 py-2 bg-white"
                  >
                    <option value="">Select a player</option>
                    {getPlayersNotInAnyTeam().map((player) => (
                      <option key={player._id} value={player._id}>
                        {player?.userId?.name}
                      </option>
                    ))}
                  </select>
                  {getPlayersNotInAnyTeam().length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      All players are already in teams
                    </p>
                  )}
                </div>

                {/* Add Button */}
                <Button
                  onClick={handleAddCommonPlayer}
                  disabled={!selectedCommonPlayer || isAddingCommonPlayer}
                  isLoading={isAddingCommonPlayer}
                  className="w-full"
                >
                  Add Common Player to Both Teams
                </Button>
              </div>
            </div>
          )}

          <Modal
            isOpen={!!editingTeam}
            onClose={() => {
              setEditingTeam(null);
              setFormData({ name: "", players: [], captain: "" });
            }}
            title={`Edit ${editingTeam?.name}`}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Team Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border rounded-sm px-3 py-2 !text-sm"
                  placeholder="Enter team name"
                  required
                />
              </div>

              {/* Selected Players Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Selected Players
                  </label>
                  <span className="text-sm font-semibold text-blue-600">
                    Count: {formData.players.length}
                  </span>
                </div>
                <div
                  className="border border-gray-300 rounded-sm p-2 bg-green-50 min-h-[40px] max-h-40 overflow-y-auto"
                  style={{
                    scrollbarWidth: "thin",
                  }}
                >
                  {formData.players.length > 0 ? (
                    <div className="space-y-2">
                      {formData.players.map((playerId) => {
                        const player = players.find((p) => p._id === playerId);
                        return (
                          <div
                            key={playerId}
                            className="flex items-center justify-between bg-white px-3 py-1 rounded-sm shadow-sm"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-sm">
                                {player?.userId.name}
                              </span>
                              {/* <span className="text-xs text-gray-500 ml-2">
                                ({player?.userId.email})
                              </span> */}
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePlayerToggle(playerId)}
                              className="text-red-500 hover:text-red-700 ml-2 !text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-8">
                      No players selected yet. Select players from below.
                    </p>
                  )}
                </div>
              </div>

              {/* Select New Player Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Player
                </label>
                {/* <p className="text-xs text-gray-500 mb-2">
                  Players already in the other team are not available for
                  selection
                </p> */}
                <div
                  className="max-h-40 overflow-y-auto border border-gray-300 rounded-sm p-2 space-y-2 bg-gray-50"
                  style={{
                    scrollbarWidth: "thin",
                  }}
                >
                  {editingTeam &&
                    getAvailablePlayers(editingTeam)
                      .filter(
                        (player) => !formData.players.includes(player._id)
                      )
                      .map((player) => (
                        <div
                          key={player._id}
                          className="flex items-center bg-white px-3 py-1.5 rounded-sm hover:bg-blue-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            id={player._id}
                            checked={formData.players.includes(player._id)}
                            onChange={() => handlePlayerToggle(player._id)}
                            className="mr-2 cursor-pointer"
                          />
                          <label
                            htmlFor={player._id}
                            className="cursor-pointer flex-1 text-sm"
                          >
                            {player.userId.name}
                            {/* <span className="text-xs text-gray-500 ml-2">
                              ({player.userId.email})
                            </span> */}
                          </label>
                        </div>
                      ))}
                  {editingTeam &&
                    getAvailablePlayers(editingTeam).filter(
                      (player) => !formData.players.includes(player._id)
                    ).length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">
                        All available players have been selected
                      </p>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Captain
                </label>
                <select
                  value={formData.captain}
                  onChange={(e) =>
                    setFormData({ ...formData, captain: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                >
                  <option value="">Select Captain</option>
                  {formData.players.map((playerId) => {
                    const player = players.find((p) => p._id === playerId);
                    return (
                      <option key={playerId} value={playerId}>
                        {player?.userId.name}
                      </option>
                    );
                  })}
                </select>
                {/* <p className="text-xs text-gray-500 mt-1">
                  Team name will be auto-generated as:{" "}
                  {formData.captain &&
                    players.find((p) => p._id === formData.captain)?.userId
                      .name}{" "}
                  - Team
                </p> */}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" isLoading={isUpdating}>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setEditingTeam(null);
                    setFormData({ name: "", players: [], captain: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

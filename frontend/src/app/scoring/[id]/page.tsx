"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useScoring } from "@/hooks/useScoring";
import { useMatch } from "@/hooks/useMatches";
import { usePlayers } from "@/hooks/usePlayers";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";

export default function ScoringPage() {
  const params = useParams();
  const matchId = params.id as string;
  const { inning, isLoading, addBall, undoLastBall, swapStrike, changeBowler, changeBatsman, isAddingBall } =
    useScoring(matchId);
  const { match } = useMatch(matchId);
  const { players } = usePlayers();
  const [ballType, setBallType] = useState<string>("normal");
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showBatsmanModal, setShowBatsmanModal] = useState(false);
  const [newBowlerId, setNewBowlerId] = useState("");
  const [newBatsmanId, setNewBatsmanId] = useState("");

  const handleAddBall = (runs: number, type: string = "normal", wicketType?: string) => {
    if (!inning) return;
    addBall({
      inningId: inning._id,
      runs,
      ballType: type as any,
      wicketType,
    });
    setBallType("normal");
  };

  const handleChangeBowler = () => {
    if (newBowlerId && inning) {
      changeBowler({ inningId: inning._id, bowlerId: newBowlerId });
      setShowBowlerModal(false);
      setNewBowlerId("");
    }
  };

  const handleChangeBatsman = () => {
    if (newBatsmanId && inning) {
      changeBatsman({ inningId: inning._id, newBatsmanId });
      setShowBatsmanModal(false);
      setNewBatsmanId("");
    }
  };

  const bowlingTeamPlayers =
    match?.teamA._id === inning?.bowlingTeam._id
      ? match?.teamA.players || []
      : match?.teamB.players || [];

  const battingTeamPlayers =
    match?.teamA._id === inning?.battingTeam._id
      ? match?.teamA.players || []
      : match?.teamB.players || [];

  if (isLoading) return <Layout><p>Loading...</p></Layout>;

  if (!inning) {
    return (
      <ProtectedRoute allowedRoles={["owner", "scorer"]}>
        <Layout>
          <Card className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Match Not Started</h1>
            <p className="text-gray-600">This match hasn't been started yet. Please start the match first.</p>
          </Card>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["owner", "scorer"]}>
      <Layout>
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <h1 className="text-2xl font-bold mb-4">
              {match?.teamA.name} vs {match?.teamB.name}
            </h1>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Batting: {inning?.battingTeam.name}</p>
                <p className="text-gray-600">Bowling: {inning?.bowlingTeam.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Inning: {inning?.inningNumber}</p>
                <p className="text-gray-600">
                  Overs: {inning?.currentOver}.{inning?.currentBall}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="text-center mb-6">
              <h2 className="text-5xl font-bold mb-2">
                {inning?.totalRuns}/{inning?.totalWickets}
              </h2>
              <p className="text-xl text-gray-600">
                {inning?.currentOver}.{inning?.currentBall} overs
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border-r pr-4">
                <h3 className="font-semibold mb-2">Striker</h3>
                <p className="text-lg">{inning?.striker?.userId.name || "N/A"}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Non-Striker</h3>
                <p className="text-lg">{inning?.nonStriker?.userId.name || "N/A"}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Current Bowler</h3>
              <div className="flex justify-between items-center">
                <p className="text-lg">{inning?.currentBowler?.userId.name || "N/A"}</p>
                <Button variant="secondary" onClick={() => setShowBowlerModal(true)}>
                  Change
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Ball Type</label>
              <div className="flex gap-2">
                <Button
                  variant={ballType === "normal" ? "primary" : "secondary"}
                  onClick={() => setBallType("normal")}
                >
                  Normal
                </Button>
                <Button
                  variant={ballType === "wide" ? "primary" : "secondary"}
                  onClick={() => setBallType("wide")}
                >
                  Wide
                </Button>
                <Button
                  variant={ballType === "noBall" ? "primary" : "secondary"}
                  onClick={() => setBallType("noBall")}
                >
                  No Ball
                </Button>
                <Button
                  variant={ballType === "wicket" ? "primary" : "secondary"}
                  onClick={() => setBallType("wicket")}
                >
                  Wicket
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Add Runs</label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3, 4, 6].map((runs) => (
                  <Button
                    key={runs}
                    onClick={() =>
                      handleAddBall(
                        runs,
                        ballType,
                        ballType === "wicket" ? "bowled" : undefined
                      )
                    }
                    isLoading={isAddingBall}
                    className="text-2xl h-16"
                  >
                    {runs}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="danger"
                onClick={() => inning && undoLastBall(inning._id)}
              >
                Undo Last Ball
              </Button>
              <Button
                variant="secondary"
                onClick={() => inning && swapStrike(inning._id)}
              >
                Swap Strike
              </Button>
              <Button variant="secondary" onClick={() => setShowBatsmanModal(true)}>
                Change Batsman
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Current Over</h3>
            <div className="flex gap-2 mb-6 flex-wrap">
              {inning?.balls
                ?.filter((ball) => ball.overNumber === inning.currentOver && ball.isValid)
                .map((ball, index) => (
                  <div
                    key={ball._id}
                    className={`w-12 h-12 flex items-center justify-center rounded font-bold text-lg ${
                      ball.ballType === "wicket"
                        ? "bg-red-500 text-white"
                        : ball.ballType === "wide" || ball.ballType === "noBall"
                        ? "bg-yellow-500 text-white"
                        : ball.runs === 4
                        ? "bg-blue-500 text-white"
                        : ball.runs === 6
                        ? "bg-purple-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {ball.ballType === "wicket"
                      ? "W"
                      : ball.ballType === "wide"
                      ? `${ball.runs}Wd`
                      : ball.ballType === "noBall"
                      ? `${ball.runs}Nb`
                      : ball.runs}
                  </div>
                ))}
            </div>

            <h3 className="font-semibold mb-2">Extras</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Wides</p>
                <p className="text-lg font-semibold">{inning?.extras.wides}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">No Balls</p>
                <p className="text-lg font-semibold">{inning?.extras.noBalls}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Byes</p>
                <p className="text-lg font-semibold">{inning?.extras.byes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Leg Byes</p>
                <p className="text-lg font-semibold">{inning?.extras.legByes}</p>
              </div>
            </div>
          </Card>

          <Modal
            isOpen={showBowlerModal}
            onClose={() => setShowBowlerModal(false)}
            title="Change Bowler"
          >
            <div className="space-y-4">
              <Select
                label="Select New Bowler"
                value={newBowlerId}
                onChange={(e) => setNewBowlerId(e.target.value)}
                options={[
                  { value: "", label: "Select Bowler" },
                  ...bowlingTeamPlayers
                    .filter((id: string) => id !== inning?.currentBowler?._id)
                    .map((playerId: string) => {
                      const player = players.find((p) => p._id === playerId);
                      return { value: playerId, label: player?.userId.name || "" };
                    }),
                ]}
              />
              <Button onClick={handleChangeBowler} className="w-full">
                Confirm
              </Button>
            </div>
          </Modal>

          <Modal
            isOpen={showBatsmanModal}
            onClose={() => setShowBatsmanModal(false)}
            title="Change Batsman"
          >
            <div className="space-y-4">
              <Select
                label="Select New Batsman"
                value={newBatsmanId}
                onChange={(e) => setNewBatsmanId(e.target.value)}
                options={[
                  { value: "", label: "Select Batsman" },
                  ...battingTeamPlayers
                    .filter(
                      (id: string) =>
                        id !== inning?.striker?._id && id !== inning?.nonStriker?._id
                    )
                    .map((playerId: string) => {
                      const player = players.find((p) => p._id === playerId);
                      return { value: playerId, label: player?.userId.name || "" };
                    }),
                ]}
              />
              <Button onClick={handleChangeBatsman} className="w-full">
                Confirm
              </Button>
            </div>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

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
  const {
    inning,
    isLoading,
    addBall,
    undoLastBall,
    swapStrike,
    changeBowler,
    changeBatsman,
    isAddingBall,
  } = useScoring(matchId);
  const { match, endMatch, startInning, isEndingMatch, isStartingInning } =
    useMatch(matchId);
  const { players } = usePlayers();
  const [ballType, setBallType] = useState<
    "normal" | "wide" | "noBall" | "wicket"
  >("normal");
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showBatsmanModal, setShowBatsmanModal] = useState(false);
  const [showEndMatchModal, setShowEndMatchModal] = useState(false);
  const [newBowlerId, setNewBowlerId] = useState("");
  const [newBatsmanId, setNewBatsmanId] = useState("");
  const [inningStriker, setInningStriker] = useState("");
  const [inningNonStriker, setInningNonStriker] = useState("");
  const [inningBowler, setInningBowler] = useState("");

  const firstInning = match?.innings?.find((i) => i.inningNumber === 1);

  // Determine teams for current inning
  const currentInningBattingTeam =
    match?.currentInning === 1
      ? match.tossDecision === "bat" && match.tossWinner
        ? match.tossWinner._id === match.teamA._id
          ? match.teamA
          : match.teamB
        : match.tossWinner
        ? match.tossWinner._id === match.teamA._id
          ? match.teamB
          : match.teamA
        : match.teamA
      : firstInning?.bowlingTeam;

  const currentInningBowlingTeam =
    match?.currentInning === 1
      ? match.tossDecision === "bat" && match.tossWinner
        ? match.tossWinner._id === match.teamA._id
          ? match.teamB
          : match.teamA
        : match.tossWinner
        ? match.tossWinner._id === match.teamA._id
          ? match.teamA
          : match.teamB
        : match.teamB
      : firstInning?.battingTeam;

  const handleEndMatch = () => {
    setShowEndMatchModal(true);
  };

  const confirmEndMatch = () => {
    endMatch(matchId);
    setShowEndMatchModal(false);
  };

  const handleAddBall = (
    runs: number,
    type: "normal" | "wide" | "noBall" | "wicket" | "bye" | "legBye" = "normal",
    wicketType?: string
  ) => {
    if (!inning) return;
    addBall({
      inningId: inning._id,
      runs,
      ballType: type,
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

  const handleStartInning = () => {
    if (inningStriker && inningNonStriker && inningBowler) {
      startInning({
        striker: inningStriker,
        nonStriker: inningNonStriker,
        bowler: inningBowler,
      });
      setInningStriker("");
      setInningNonStriker("");
      setInningBowler("");
    }
  };

  const getBatsmanStats = (playerId: string) => {
    if (!inning?.balls) return { runs: 0, balls: 0 };
    let runs = 0;
    let balls = 0;
    inning.balls.forEach((ball) => {
      if (ball.batsman._id === playerId) {
        if (ball.ballType === "normal" || ball.ballType === "wicket") {
          balls += 1;
        }
        if (ball.ballType !== "wide" && ball.ballType !== "noBall") {
          runs += ball.runs;
        }
      }
    });
    return { runs, balls };
  };

  const getBowlerStats = (playerId: string) => {
    if (!inning?.balls)
      return { balls: 0, runs: 0, wickets: 0, economy: "0.0" };
    let balls = 0;
    let runs = 0;
    let wickets = 0;
    inning.balls.forEach((ball) => {
      if (ball.bowler._id === playerId) {
        if (ball.ballType === "normal" || ball.ballType === "wicket") {
          balls += 1;
        }
        runs += ball.runs;
        if (ball.ballType === "wicket") {
          wickets += 1;
        }
      }
    });
    const overs = Math.floor(balls / 6) + (balls % 6) / 10;
    const economy = balls > 0 ? ((runs / balls) * 6).toFixed(1) : "0.0";
    return { balls, runs, wickets, overs, economy };
  };

  if (isLoading)
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );

  if (!inning || !inning._id) {
    return (
      <ProtectedRoute allowedRoles={["owner", "scorer"]}>
        <Layout>
          <Card className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Start {match?.currentInning === 1 ? "First" : "Second"} Inning
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              Select the opening batsmen and bowler for the{" "}
              {match?.currentInning === 1 ? "first" : "second"} inning.
            </p>
            <div className="space-y-4">
              <Select
                label={`Striker (${currentInningBattingTeam?.name})`}
                value={inningStriker}
                onChange={(e) => setInningStriker(e.target.value)}
                options={[
                  { value: "", label: "Select Striker" },
                  ...(currentInningBattingTeam?.players || []).map(
                    (playerId: string) => {
                      const player = players.find((p) => p._id === playerId);
                      return {
                        value: playerId,
                        label: player?.userId.name || "",
                      };
                    }
                  ),
                ]}
              />
              <Select
                label={`Non-Striker (${currentInningBattingTeam?.name})`}
                value={inningNonStriker}
                onChange={(e) => setInningNonStriker(e.target.value)}
                options={[
                  { value: "", label: "Select Non-Striker" },
                  ...(currentInningBattingTeam?.players || [])
                    .filter((id: string) => id !== inningStriker)
                    .map((playerId: string) => {
                      const player = players.find((p) => p._id === playerId);
                      return {
                        value: playerId,
                        label: player?.userId.name || "",
                      };
                    }),
                ]}
              />
              <Select
                label={`Bowler (${currentInningBowlingTeam?.name})`}
                value={inningBowler}
                onChange={(e) => setInningBowler(e.target.value)}
                options={[
                  { value: "", label: "Select Bowler" },
                  ...(currentInningBowlingTeam?.players || []).map(
                    (playerId: string) => {
                      const player = players.find((p) => p._id === playerId);
                      return {
                        value: playerId,
                        label: player?.userId.name || "",
                      };
                    }
                  ),
                ]}
              />
              <Button
                onClick={handleStartInning}
                className="w-full"
                isLoading={isStartingInning}
                disabled={!inningStriker || !inningNonStriker || !inningBowler}
              >
                Start {match?.currentInning === 1 ? "First" : "Second"} Inning
              </Button>
            </div>
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
                <p className="text-gray-600">
                  Batting: {inning?.battingTeam.name}
                </p>
                <p className="text-gray-600">
                  Bowling: {inning?.bowlingTeam.name}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Inning: {inning?.inningNumber}</p>
                <p className="text-gray-600">
                  Overs: {inning?.currentOver}.{inning?.currentBall}
                </p>
              </div>
            </div>
          </Card>

          {/* Current Inning Scoreboard */}
          <Card>
            <h2 className="text-xl font-bold mb-4">
              Current Inning Scoreboard
            </h2>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {inning?.battingTeam.name}: {inning?.totalRuns}/
                {inning?.totalWickets}
              </p>
              <p className="text-lg text-gray-600">
                Overs: {inning?.currentOver}.{inning?.currentBall}
              </p>
            </div>
          </Card>

          {/* First Inning Scoreboard (when in second inning) */}
          {match?.currentInning === 2 && firstInning && (
            <Card>
              <h2 className="text-xl font-bold mb-4">
                First Inning Scoreboard
              </h2>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {firstInning.battingTeam.name}: {firstInning.totalRuns}/
                  {firstInning.totalWickets}
                </p>
                <p className="text-lg text-gray-600">
                  Overs:{" "}
                  {Math.floor(
                    firstInning.currentOver + firstInning.currentBall / 6
                  )}
                  .{firstInning.currentBall % 6}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Target: {firstInning.totalRuns + 1} runs
                </p>
              </div>
            </Card>
          )}

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
                <p className="text-lg">
                  <span className="mr-5">
                    {inning?.striker?.userId.name + "* " || "N/A"}
                  </span>
                  {inning?.striker
                    ? `${getBatsmanStats(inning.striker._id).runs}(${
                        getBatsmanStats(inning.striker._id).balls
                      })`
                    : ""}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Non-Striker</h3>
                <p className="text-lg">
                  <span className="mr-5">
                    {inning?.nonStriker?.userId.name || "N/A"}
                  </span>
                  {inning?.nonStriker
                    ? `${getBatsmanStats(inning.nonStriker._id).runs}(${
                        getBatsmanStats(inning.nonStriker._id).balls
                      })`
                    : ""}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Current Bowler</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg">
                    {inning?.currentBowler?.userId.name || "N/A"}
                  </p>
                  {inning?.currentBowler && (
                    <p className="text-sm text-gray-600">
                      Balls:{" "}
                      {Math.floor(
                        getBowlerStats(inning.currentBowler._id).balls / 6
                      )}
                      .{getBowlerStats(inning.currentBowler._id).balls % 6}{" "}
                      Runs: {getBowlerStats(inning.currentBowler._id).runs}{" "}
                      Economy:{" "}
                      {getBowlerStats(inning.currentBowler._id).economy}{" "}
                      Wickets:{" "}
                      {getBowlerStats(inning.currentBowler._id).wickets}
                    </p>
                  )}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setShowBowlerModal(true)}
                >
                  Change
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Ball Type
              </label>
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
              <Button
                variant="secondary"
                onClick={() => setShowBatsmanModal(true)}
              >
                Change Batsman
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Current Over</h3>
            <div className="flex gap-2 mb-6 flex-wrap">
              {inning?.balls && inning.balls.length > 0 ? (
                inning.balls
                  .filter(
                    (ball) =>
                      ball.overNumber === inning.currentOver && ball.isValid
                  )
                  .map((ball) => (
                    <div
                      key={ball._id}
                      className={`w-12 h-12 flex items-center justify-center rounded font-bold text-lg ${
                        ball.ballType === "wicket"
                          ? "bg-red-500 text-white"
                          : ball.ballType === "wide" ||
                            ball.ballType === "noBall"
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
                  ))
              ) : (
                <p className="text-gray-500 text-sm">No balls bowled yet</p>
              )}
            </div>

            <h3 className="font-semibold mb-2">Extras</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Wides</p>
                <p className="text-lg font-semibold">{inning?.extras.wides}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">No Balls</p>
                <p className="text-lg font-semibold">
                  {inning?.extras.noBalls}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Byes</p>
                <p className="text-lg font-semibold">{inning?.extras.byes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Leg Byes</p>
                <p className="text-lg font-semibold">
                  {inning?.extras.legByes}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Previous Overs</h3>
            <div className="space-y-4">
              {inning?.balls && inning.balls.length > 0 ? (
                Array.from(
                  new Set(
                    inning.balls
                      .filter((ball) => ball.overNumber < inning.currentOver)
                      .map((ball) => ball.overNumber)
                  )
                )
                  .sort((a, b) => b - a) // Show latest overs first
                  .map((overNumber) => (
                    <div key={overNumber} className="flex items-center gap-4">
                      <span className="font-medium text-sm w-12">
                        Over {overNumber + 1}:
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {inning.balls
                          ?.filter(
                            (ball) =>
                              ball.overNumber === overNumber && ball.isValid
                          )
                          .map((ball) => (
                            <div
                              key={ball._id}
                              className={`w-10 h-10 flex items-center justify-center rounded font-bold text-sm ${
                                ball.ballType === "wicket"
                                  ? "bg-red-500 text-white"
                                  : ball.ballType === "wide" ||
                                    ball.ballType === "noBall"
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
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-sm">No previous overs</p>
              )}
            </div>
          </Card>

          {match?.status !== "completed" && (
            <Card>
              <div className="text-center">
                <h3 className="font-semibold mb-4">Match Controls</h3>
                <Button
                  variant="danger"
                  onClick={handleEndMatch}
                  className="w-full"
                  isLoading={isEndingMatch}
                >
                  End Match
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Use this to manually end the match before completion
                </p>
              </div>
            </Card>
          )}

          {match?.status === "completed" && (
            <Card>
              <div className="text-center">
                <h3 className="font-semibold text-xl mb-2">Match Completed</h3>
                <p className="text-lg text-green-600 font-semibold mb-4">
                  {match.resultText || "Match has ended"}
                </p>
                {match.winner && (
                  <p className="text-gray-600">Winner: {match.winner.name}</p>
                )}
              </div>
            </Card>
          )}

          {(() => {
            // Calculate team players only when inning is active
            const bowlingTeamPlayers =
              match?.teamA._id === inning?.bowlingTeam?._id
                ? match?.teamA.players || []
                : match?.teamB.players || [];

            const battingTeamPlayers =
              match?.teamA._id === inning?.battingTeam?._id
                ? match?.teamA.players || []
                : match?.teamB.players || [];

            return (
              <>
                <Modal
                  isOpen={showEndMatchModal}
                  onClose={() => setShowEndMatchModal(false)}
                  title="End Match Confirmation"
                >
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Are you sure you want to end this match? This action
                      cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="danger"
                        onClick={confirmEndMatch}
                        className="flex-1"
                        isLoading={isEndingMatch}
                      >
                        Yes, End Match
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setShowEndMatchModal(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Modal>

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
                          .filter(
                            (id: string) => id !== inning?.currentBowler?._id
                          )
                          .map((playerId: string) => {
                            const player = players.find(
                              (p) => p._id === playerId
                            );
                            return {
                              value: playerId,
                              label: player?.userId.name || "",
                            };
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
                              id !== inning?.striker?._id &&
                              id !== inning?.nonStriker?._id
                          )
                          .map((playerId: string) => {
                            const player = players.find(
                              (p) => p._id === playerId
                            );
                            return {
                              value: playerId,
                              label: player?.userId.name || "",
                            };
                          }),
                      ]}
                    />
                    <Button onClick={handleChangeBatsman} className="w-full">
                      Confirm
                    </Button>
                  </div>
                </Modal>
              </>
            );
          })()}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

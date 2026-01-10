"use client";

import { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";

interface WicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    wicketType: string;
    newBatsmanId: string;
    fielderId?: string;
    runOutRuns?: number;
  }) => void;
  availableBatsmen: Array<{ _id: string; userId: { name: string } }>;
  bowlingTeamPlayers: Array<{ _id: string; userId: { name: string } }>;
  currentStrikerId?: string;
  currentNonStrikerId?: string;
}

export function WicketModal({
  isOpen,
  onClose,
  onConfirm,
  availableBatsmen,
  bowlingTeamPlayers,
  currentStrikerId,
  currentNonStrikerId,
}: WicketModalProps) {
  const [wicketType, setWicketType] = useState<string>("bowled");
  const [newBatsmanId, setNewBatsmanId] = useState<string>("");
  const [fielderId, setFielderId] = useState<string>("");
  const [runOutRuns, setRunOutRuns] = useState<number>(0);

  // Filter out the striker (who just got out) from available batsmen
  const filteredAvailableBatsmen = availableBatsmen.filter(
    (batsman) => batsman._id !== currentStrikerId
  );

  // Auto-select if only one batsman is available (last man)
  useEffect(() => {
    if (isOpen && filteredAvailableBatsmen.length === 1) {
      setNewBatsmanId(filteredAvailableBatsmen[0]._id);
    } else if (isOpen && filteredAvailableBatsmen.length === 0) {
      setNewBatsmanId("");
    }
  }, [isOpen, filteredAvailableBatsmen.length]);

  const handleConfirm = () => {
    // Allow confirmation without new batsman if none available (all out)
    if (filteredAvailableBatsmen.length > 0 && !newBatsmanId) return;

    onConfirm({
      wicketType,
      newBatsmanId: newBatsmanId || "", // Empty string if final wicket
      fielderId: fielderId || undefined,
      runOutRuns: wicketType === "runOut" ? runOutRuns : undefined,
    });
    setWicketType("bowled");
    setNewBatsmanId("");
    setFielderId("");
    setRunOutRuns(0);
  };

  const needsFielder = wicketType === "caught" || wicketType === "stumped";
  const isRunOut = wicketType === "runOut";
  const isLastMan = filteredAvailableBatsmen.length === 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Wicket!">
      <div className="space-y-4">
        <Select
          label="Dismissal Type"
          value={wicketType}
          onChange={(e) => setWicketType(e.target.value)}
          options={[
            { value: "bowled", label: "Bowled" },
            { value: "caught", label: "Caught" },
            // { value: "lbw", label: "LBW" },
            // { value: "stumped", label: "Stumped" },
            { value: "runOut", label: "Run Out" },
            // { value: "hitWicket", label: "Hit Wicket" },
          ]}
        />

        {needsFielder && (
          <Select
            label="Fielder"
            value={fielderId}
            onChange={(e) => setFielderId(e.target.value)}
            options={[
              { value: "", label: "Select Fielder" },
              ...bowlingTeamPlayers.map((p) => ({
                value: p._id,
                label: p.userId.name,
              })),
            ]}
          />
        )}

        {isRunOut && (
          <Select
            label="Runs on Run Out"
            value={runOutRuns.toString()}
            onChange={(e) => setRunOutRuns(parseInt(e.target.value))}
            options={[
              { value: "0", label: "0 runs" },
              { value: "1", label: "1 run" },
              { value: "2", label: "2 runs" },
              { value: "3", label: "3 runs" },
            ]}
          />
        )}

        {filteredAvailableBatsmen.length > 0 ? (
          <>
            <Select
              label="New Batsman"
              value={newBatsmanId}
              onChange={(e) => setNewBatsmanId(e.target.value)}
              options={[
                { value: "", label: "Select New Batsman" },
                ...filteredAvailableBatsmen.map((p) => ({
                  value: p._id,
                  label: p.userId.name,
                })),
              ]}
            />
            {isLastMan && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                Last man standing! This batsman will continue batting solo.
              </div>
            )}
          </>
        ) : (
          <div className="p-3 bg-gray-100 rounded text-sm text-gray-700">
            All out! No more batsmen available.
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={filteredAvailableBatsmen.length > 0 && !newBatsmanId}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
}

"use client";

import { useState } from "react";
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
  }) => void;
  availableBatsmen: Array<{ _id: string; userId: { name: string } }>;
  bowlingTeamPlayers: Array<{ _id: string; userId: { name: string } }>;
}

export function WicketModal({
  isOpen,
  onClose,
  onConfirm,
  availableBatsmen,
  bowlingTeamPlayers,
}: WicketModalProps) {
  const [wicketType, setWicketType] = useState<string>("bowled");
  const [newBatsmanId, setNewBatsmanId] = useState<string>("");
  const [fielderId, setFielderId] = useState<string>("");

  const handleConfirm = () => {
    if (!newBatsmanId) return;
    onConfirm({
      wicketType,
      newBatsmanId,
      fielder: fielderId || undefined,
    });
    setWicketType("bowled");
    setNewBatsmanId("");
    setFielderId("");
  };

  const needsFielder = wicketType === "caught" || wicketType === "stumped";

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
            { value: "lbw", label: "LBW" },
            { value: "stumped", label: "Stumped" },
            { value: "runOut", label: "Run Out" },
            { value: "hitWicket", label: "Hit Wicket" },
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

        <Select
          label="New Batsman"
          value={newBatsmanId}
          onChange={(e) => setNewBatsmanId(e.target.value)}
          options={[
            { value: "", label: "Select New Batsman" },
            ...availableBatsmen.map((p) => ({
              value: p._id,
              label: p.userId.name,
            })),
          ]}
        />

        <div className="flex gap-2">
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="flex-1" disabled={!newBatsmanId}>
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import { ScoreTable, TableColumn } from "./ScoreTable";

interface BowlingStat {
  playerId: {
    userId: {
      name: string;
    };
  };
  overs: number;
  runsConceded: number;
  wickets: number;
  economy: number;
}

interface BowlingScorecardProps {
  bowlingStats: BowlingStat[];
}

export function BowlingScorecard({ bowlingStats }: BowlingScorecardProps) {
  const columns: TableColumn[] = [
    {
      header: "Bowler",
      accessor: "bowler",
      align: "left",
      className: "font-medium",
      render: (_, row: BowlingStat) => row.playerId.userId.name,
    },
    {
      header: "O",
      accessor: "overs",
      align: "center",
      render: (value: number) => value.toFixed(1),
    },
    {
      header: "R",
      accessor: "runsConceded",
      align: "center",
    },
    {
      header: "W",
      accessor: "wickets",
      align: "center",
      className: "font-semibold text-red-600",
    },
    {
      header: "Econ",
      accessor: "economy",
      align: "center",
      render: (value: number) => value.toFixed(2),
    },
  ];

  return (
    <div>
      <h3 className="font-semibold mb-3">Bowling</h3>
      <ScoreTable columns={columns} data={bowlingStats} />
    </div>
  );
}

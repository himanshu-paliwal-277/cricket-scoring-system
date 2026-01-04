/* eslint-disable @typescript-eslint/no-explicit-any */
import { ScoreTable, TableColumn } from "./ScoreTable";
import { truncateString } from "@/utils/truncateString";

interface BattingStat {
  playerId: {
    _id: string;
    userId: {
      name: string;
    };
  };
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissalType?: string;
  dismissedBy?: {
    userId?: {
      name?: string;
    };
  };
  fielder?: {
    userId?: {
      name?: string;
    };
  };
}

interface BattingScorecardProps {
  battingStats: BattingStat[];
  captainId?: string;
  getDismissalText: (stat: any) => string;
}

export function BattingScorecard({
  battingStats,
  captainId,
  getDismissalText,
}: BattingScorecardProps) {
  const columns: TableColumn[] = [
    {
      header: "Batsman",
      accessor: "batsman",
      align: "left",
      minWidth: "min-w-30",
      className: "",
      render: (_, row: BattingStat) => (
        <>
          <div>
            <span className="font-medium">
              {truncateString(row.playerId.userId.name, 14)}
              {captainId === row.playerId._id && " (C)"}
              {!row.isOut && (
                <span className="ml-2 text-xs text-green-600 font-bold">*</span>
              )}
            </span>
            <br />
            <span className="text-[11px] text-gray-400 italic">
              {getDismissalText(row)}
            </span>
          </div>
        </>
      ),
    },
    // {
    //   header: "Dismissal",
    //   accessor: "dismissal",
    //   align: "left",
    //   minWidth: "min-w-30",
    //   className: "text-[11px] text-gray-600 italic",
    //   render: (_, row: BattingStat) => getDismissalText(row),
    // },
    {
      header: "R",
      accessor: "runs",
      align: "center",
      className: "font-semibold text-blue-600",
    },
    {
      header: "B",
      accessor: "balls",
      align: "center",
    },
    {
      header: "4s",
      accessor: "fours",
      align: "center",
    },
    {
      header: "6s",
      accessor: "sixes",
      align: "center",
    },
    {
      header: "SR",
      accessor: "strikeRate",
      align: "center",
      render: (value: number) => value.toFixed(2),
    },
  ];

  return (
    <div>
      <h3 className="font-semibold mb-3">Batting</h3>
      <ScoreTable
        columns={columns}
        data={battingStats}
        getRowClassName={(row: BattingStat) => (row.isOut ? "" : "")}
      />
    </div>
  );
}

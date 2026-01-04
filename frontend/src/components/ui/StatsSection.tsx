/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatsTable } from "./StatsTable";

interface Column {
  header: string;
  key: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: any, index?: number) => React.ReactNode;
  className?: string;
}

interface StatsSectionProps {
  title: string;
  columns: Column[];
  data: any[];
  emptyMessage?: string;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  title,
  columns,
  data,
  emptyMessage,
}) => {
  return (
    <div className="p-4 border-1 border-gray-300 rounded-md">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <StatsTable columns={columns} data={data} emptyMessage={emptyMessage} />
    </div>
  );
};

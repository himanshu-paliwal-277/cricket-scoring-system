/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "./Card";
import { StatsTable } from "./StatsTable";

interface Column {
  header: string;
  key: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: any) => React.ReactNode;
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
    <Card>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <StatsTable columns={columns} data={data} emptyMessage={emptyMessage} />
    </Card>
  );
};

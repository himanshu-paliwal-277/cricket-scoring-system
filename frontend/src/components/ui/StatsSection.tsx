/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { StatsTable } from "./StatsTable";
import { ChevronRight } from "lucide-react";

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
  seeMoreLink?: string;
  showSeeMore?: boolean;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  title,
  columns,
  data,
  emptyMessage,
  seeMoreLink,
  showSeeMore = false,
}) => {
  return (
    <div className="p-4 border-1 border-gray-300 rounded-md">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <StatsTable columns={columns} data={data} emptyMessage={emptyMessage} />
      {showSeeMore && seeMoreLink && data.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Link
            href={seeMoreLink}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
          >
            See More
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

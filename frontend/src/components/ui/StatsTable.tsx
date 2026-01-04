/* eslint-disable @typescript-eslint/no-explicit-any */
interface Column {
  header: string;
  key: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: any, index?: number) => React.ReactNode;
  className?: string;
}

interface StatsTableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
}

export const StatsTable: React.FC<StatsTableProps> = ({
  columns,
  data,
  emptyMessage = "No data available",
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="sm:w-full w-[450px] text-sm">
        <thead>
          <tr className="border-b border-gray-400 bg-gray-50">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`sm:py-3 sm:px-4 py-1.5 px-3 font-semibold ${
                  column.align === "center"
                    ? "text-center"
                    : column.align === "right"
                    ? "text-right"
                    : "text-left"
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={row._id || rowIndex}
                className="border-b hover:bg-gray-50 border-gray-300"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`sm:py-3 sm:px-4 py-1.5 px-3 ${
                      column.align === "center"
                        ? "text-center"
                        : column.align === "right"
                        ? "text-right"
                        : "text-left"
                    } ${column.className || ""}`}
                  >
                    {column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-8 text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

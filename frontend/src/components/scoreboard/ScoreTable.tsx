/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

export interface TableColumn {
  header: string;
  accessor: string;
  align?: "left" | "center" | "right";
  className?: string;
  minWidth?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ScoreTableProps {
  columns: TableColumn[];
  data: any[];
  getRowClassName?: (row: any, index: number) => string;
}

export function ScoreTable({
  columns,
  data,
  getRowClassName,
}: ScoreTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="sm:w-full w-[350px] sm:text-md text-xs">
        <thead>
          <tr className="border-b border-gray-400 bg-gray-50">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`py-3 px-2 font-semibold ${
                  column.align === "center"
                    ? "text-center"
                    : column.align === "right"
                    ? "text-right"
                    : "text-left"
                } ${column.minWidth || ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-gray-300 hover:bg-gray-50 ${
                getRowClassName ? getRowClassName(row, rowIndex) : ""
              }`}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`py-2.5 px-2 ${
                    column.align === "center"
                      ? "text-center"
                      : column.align === "right"
                      ? "text-right"
                      : "text-left"
                  } ${column.className || ""} `}
                >
                  {column.render
                    ? column.render(row[column.accessor], row)
                    : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

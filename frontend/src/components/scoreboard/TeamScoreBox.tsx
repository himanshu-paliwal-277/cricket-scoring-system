import Image from "next/image";

interface TeamScoreBoxProps {
  teamLogo?: string;
  teamName: string;
  runs: number;
  wickets: number;
  overs: string;
  isSecond?: boolean;
}

export function TeamScoreBox({
  teamLogo,
  teamName,
  runs,
  wickets,
  overs,
  isSecond,
}: TeamScoreBoxProps) {
  return (
    <div
      className={`flex items-center gap-4 ${
        isSecond ? "flex-row-reverse" : ""
      }`}
    >
      <div className="flex flex-col items-center">
        {teamLogo ? (
          <div className="w-14 h-14 relative rounded-full overflow-hidden">
            <Image
              src={teamLogo}
              alt={teamName || "Team Logo"}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
            {teamName?.charAt(0) || "T"}
          </div>
        )}
        <h2 className="font-bold text-center min-w-20">{teamName}</h2>
      </div>
      <div className="flex flex-col items-center">
        <p className="font-bold text-blue-600 text-xl">
          {runs}/{wickets}
        </p>
        <p className="text-gray-600 text-sm">({overs})</p>
      </div>
    </div>
  );
}

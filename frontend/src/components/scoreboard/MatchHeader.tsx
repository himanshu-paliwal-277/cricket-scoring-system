import { TeamScoreBox } from "./TeamScoreBox";

interface InningData {
  battingTeam: {
    name: string;
    shortName?: string;
  };
  totalRuns: number;
  totalWickets: number;
  currentOver: number;
  currentBall: number;
}

interface Team {
  name: string;
  shortName?: string;
  logo?: string;
}

interface MatchHeaderProps {
  date: string;
  teamA?: Team;
  teamB?: Team;
  innings: InningData[];
  resultText?: string;
  matchStatus?: string;
  isLive?: boolean;
}

export function MatchHeader({
  date,
  teamA,
  teamB,
  innings,
  resultText,
  matchStatus,
  isLive,
}: MatchHeaderProps) {
  const firstInning = innings.length > 0 && innings[0] ? innings[0] : null;
  const secondInning = innings.length > 1 && innings[1] ? innings[1] : null;

  // Determine which team logo to use for each inning
  const getTeamLogo = (inningIndex: number) => {
    if (!innings[inningIndex]) return undefined;

    const battingTeamName = innings[inningIndex].battingTeam.name;

    if (teamA?.name === battingTeamName) {
      return teamA.logo;
    } else if (teamB?.name === battingTeamName) {
      return teamB.logo;
    }

    return undefined;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-gray-600 text-xs">{date}</p>
        {isLive && (
          <div className="w-auto">
            <p className="text-green-500 font-semibold">Live</p>
            <div className="relative h-[2px] overflow-hidden bg-gray-300">
              <span className="live-loader absolute left-0 top-0 h-full bg-green-500"></span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        {firstInning && (
          <TeamScoreBox
            teamLogo={getTeamLogo(0)}
            teamName={
              firstInning.battingTeam.shortName ||
              firstInning.battingTeam.name ||
              "Team"
            }
            runs={firstInning.totalRuns}
            wickets={firstInning.totalWickets}
            overs={`${firstInning.currentOver}${
              firstInning.currentBall > 0 ? "." + firstInning.currentBall : ""
            }`}
          />
        )}

        {secondInning ? (
          <TeamScoreBox
            teamLogo={getTeamLogo(1)}
            teamName={
              secondInning.battingTeam.shortName ||
              secondInning.battingTeam.name ||
              "Team"
            }
            runs={secondInning.totalRuns}
            wickets={secondInning.totalWickets}
            overs={`${secondInning.currentOver}${
              secondInning.currentBall > 0 ? "." + secondInning.currentBall : ""
            }`}
            isSecond
          />
        ) : (
          // <div className="flex flex-col items-center gap-2 opacity-50">
          //   <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-lg">
          //     ?
          //   </div>
          //   <h2 className="font-bold text-center text-gray-400">Yet to bat</h2>
          //   <p className="font-bold text-gray-400 text-lg">-/-</p>
          //   <p className="text-gray-400 text-sm">(- overs)</p>
          // </div>
          <TeamScoreBox
            teamLogo={
              firstInning && teamA && teamB
                ? firstInning.battingTeam.name === teamA.name
                  ? teamB.logo
                  : teamA.logo
                : teamB?.logo
            }
            teamName={
              firstInning && teamA && teamB
                ? firstInning.battingTeam.name === teamA.name
                  ? teamB.shortName || teamB.name
                  : teamA.shortName || teamA.name
                : teamB?.shortName || "Team"
            }
            isSecond
          />
        )}
      </div>

      {matchStatus === "completed" && resultText && (
        <div className="text-center">
          <p className="font-semibold text-green-700 text-sm">{resultText}</p>
        </div>
      )}
    </div>
  );
}

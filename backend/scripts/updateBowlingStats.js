import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://himanshu27:MkFCLzg6n5sDSfIR@cluster0.op48u.mongodb.net/cricket-scoring-system?retryWrites=true&w=majority";

async function updateBowlingStats() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;

    // Fetch all balls
    const balls = await db.collection("balls").find({ isValid: true }).toArray();
    console.log(`Found ${balls.length} valid balls`);

    // Track bowling stats per player
    const playerBowlingStats = {};

    for (const ball of balls) {
      if (!ball.bowler) continue;

      const bowlerId = ball.bowler.toString();

      if (!playerBowlingStats[bowlerId]) {
        playerBowlingStats[bowlerId] = {
          totalRunsConceded: 0,
          totalBallsBowled: 0,
        };
      }

      // Calculate runs conceded by bowler
      // Wides and NoBalls: runs + 1 extra count against bowler
      // Normal balls and wickets: runs count against bowler
      // Byes and LegByes: runs DON'T count against bowler (they're extras)

      const ballType = ball.ballType;
      const runs = ball.runs || 0;

      if (ballType === "wide") {
        // Wide: 1 extra + any additional runs
        playerBowlingStats[bowlerId].totalRunsConceded += 1 + runs;
        // Wide doesn't count as a legal ball
      } else if (ballType === "noBall") {
        // No ball: 1 extra + runs scored
        playerBowlingStats[bowlerId].totalRunsConceded += 1 + runs;
        // No ball doesn't count as a legal ball
      } else if (ballType === "bye" || ballType === "legBye") {
        // Byes and leg byes: runs don't count against bowler
        // But it's a legal ball
        playerBowlingStats[bowlerId].totalBallsBowled += 1;
      } else {
        // Normal ball or wicket: runs count against bowler
        playerBowlingStats[bowlerId].totalRunsConceded += runs;
        playerBowlingStats[bowlerId].totalBallsBowled += 1;
      }
    }

    console.log(`\nCalculated bowling stats for ${Object.keys(playerBowlingStats).length} players:`);

    // Update each player with their aggregated bowling stats
    for (const [playerId, stats] of Object.entries(playerBowlingStats)) {
      const economy = stats.totalBallsBowled > 0
        ? ((stats.totalRunsConceded / stats.totalBallsBowled) * 6).toFixed(2)
        : "0.00";

      await db.collection("players").updateOne(
        { _id: new mongoose.Types.ObjectId(playerId) },
        {
          $set: {
            totalRunsConceded: stats.totalRunsConceded,
          },
        }
      );

      // Get player name for logging
      const player = await db.collection("players").findOne({ _id: new mongoose.Types.ObjectId(playerId) });
      const user = player?.userId ? await db.collection("users").findOne({ _id: player.userId }) : null;
      const playerName = user?.name || playerId;

      console.log(
        `${playerName}: runs conceded=${stats.totalRunsConceded}, balls=${stats.totalBallsBowled}, economy=${economy}`
      );
    }

    console.log("\nDone updating bowling stats!");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updateBowlingStats();

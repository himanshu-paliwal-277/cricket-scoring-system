import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://himanshu27:MkFCLzg6n5sDSfIR@cluster0.op48u.mongodb.net/cricket-scoring-system?retryWrites=true&w=majority";

async function updatePlayerStats() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const balls = await db.collection("balls").find({}).toArray();

    // Track catches and ones per player
    const playerStats = {};

    for (const ball of balls) {
      // Count ones (runs === 1 on normal balls)
      if (ball.runs === 1 && ball.ballType === "normal" && ball.batsman) {
        const batsmanId = ball.batsman.toString();
        if (!playerStats[batsmanId]) {
          playerStats[batsmanId] = { ones: 0, catches: 0 };
        }
        playerStats[batsmanId].ones += 1;
      }

      // Count catches (wicket type = caught, fielder gets the catch)
      if (ball.ballType === "wicket" && ball.wicketType === "caught" && ball.fielder) {
        const fielderId = ball.fielder.toString();
        if (!playerStats[fielderId]) {
          playerStats[fielderId] = { ones: 0, catches: 0 };
        }
        playerStats[fielderId].catches += 1;
      }
    }

    console.log("Total balls processed:", balls.length);

    console.log("Player stats calculated:", playerStats);

    // Update each player
    for (const [playerId, stats] of Object.entries(playerStats)) {
      const result = await db.collection("players").updateOne(
        { _id: new mongoose.Types.ObjectId(playerId) },
        { $set: { totalOnes: stats.ones, totalCatches: stats.catches } }
      );
      console.log(`Updated player ${playerId}: ones=${stats.ones}, catches=${stats.catches}`);
    }

    console.log("Done updating player stats!");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updatePlayerStats();

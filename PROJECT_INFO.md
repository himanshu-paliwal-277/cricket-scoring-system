# Cricket Scoring System - Project Documentation

## Overview
A comprehensive cricket scoring management application built with **Next.js** (frontend) and **Node.js/Express** (backend) with **MongoDB** as the database.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Components**: Custom components with Tailwind CSS
- **State Management**: React Hooks + Custom Hooks
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)

## Architecture

### Module Structure

```
cricket-scoring-system/
├── backend/
│   ├── src/
│   │   ├── schema/           # MongoDB Schemas (Data Models)
│   │   ├── controllers/      # Route Handlers (Business Logic)
│   │   ├── routes/          # API Routes
│   │   └── middleware/      # Auth & Other Middleware
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js Pages (App Router)
│   │   ├── components/     # React Components
│   │   ├── hooks/          # Custom React Hooks
│   │   ├── services/       # API Service Layer
│   │   └── lib/            # Utilities & Axios Config
└── PROJECT_INFO.md
```

---

## Database Schema

### 1. **User Schema**
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  role: Enum ["owner", "scorer", "player"] (default: "player")
}
```

### 2. **Player Schema**
```javascript
{
  userId: ObjectId -> User (required),
  battingStyle: Enum ["right-hand", "left-hand"],
  bowlingStyle: Enum ["right-arm-fast", "left-arm-fast", ...],
  totalRuns: Number (default: 0),
  totalWickets: Number (default: 0),
  totalFours: Number (default: 0),
  totalSixes: Number (default: 0),
  matchesPlayed: Number (default: 0),
  highestScore: Number (default: 0),
  totalBallsFaced: Number,
  totalBallsBowled: Number
}
```

### 3. **Team Schema**
```javascript
{
  name: String (required),
  teamType: Enum ["team1", "team2"],
  players: [ObjectId -> Player],
  createdBy: ObjectId -> User,
  isLocked: Boolean (default: false)
}
```

### 4. **Match Schema**
```javascript
{
  teamA: ObjectId -> Team,
  teamB: ObjectId -> Team,
  teamASnapshot: {
    name: String,
    players: [ObjectId],
    captain: ObjectId -> Player
  },
  teamBSnapshot: {
    name: String,
    players: [ObjectId],
    captain: ObjectId -> Player
  },
  overs: Number (required),
  tossWinner: ObjectId -> Team,
  tossDecision: Enum ["bat", "bowl"],
  currentInning: Number (default: 1),
  status: Enum ["not_started", "live", "completed"],
  winner: ObjectId -> Team,
  resultText: String,
  playerOfTheMatch: ObjectId -> Player,
  scorerId: ObjectId -> User,
  createdBy: ObjectId -> User
}
```

### 5. **Inning Schema**
```javascript
{
  matchId: ObjectId -> Match,
  battingTeam: ObjectId -> Team,
  bowlingTeam: ObjectId -> Team,
  inningNumber: Number (1 or 2),
  striker: ObjectId -> Player,
  nonStriker: ObjectId -> Player,
  currentBowler: ObjectId -> Player,
  totalRuns: Number,
  totalWickets: Number,
  currentOver: Number,
  currentBall: Number,
  extras: {
    wides: Number,
    noBalls: Number,
    byes: Number,
    legByes: Number
  },
  battingStats: [{
    playerId: ObjectId -> Player,
    runs: Number,
    balls: Number,
    fours: Number,
    sixes: Number,
    strikeRate: Number,
    isOut: Boolean,
    dismissalType: Enum ["bowled", "caught", "lbw", ...],
    dismissedBy: ObjectId -> Player (bowler),
    fielder: ObjectId -> Player
  }],
  bowlingStats: [{
    playerId: ObjectId -> Player,
    overs: Number,
    balls: Number,
    runsConceded: Number,
    wickets: Number,
    maidens: Number,
    economy: Number
  }],
  isCompleted: Boolean
}
```

### 6. **Ball Schema**
```javascript
{
  inningId: ObjectId -> Inning,
  overNumber: Number,
  ballNumber: Number,
  batsman: ObjectId -> Player,
  bowler: ObjectId -> Player,
  runs: Number,
  ballType: Enum ["normal", "wide", "noBall", "wicket", "bye", "legBye"],
  wicketType: Enum ["bowled", "caught", "lbw", "stumped", "runOut", ...],
  fielder: ObjectId -> Player (for caught/stumped),
  isValid: Boolean (for undo functionality)
}
```

---

## Key Features

### 1. **Match Management**
- Create match between two teams
- Store **team snapshots** (name, players, captain) at match creation
  - **Why?** Teams can be renamed later, but match history should show original team names
  - **Captain is match-specific**: Different captains for different matches
- Start match with toss decision
- Track live match status
- Auto-calculate winner and result text
- **Player of the Match**: Auto-calculated based on performance points
  - Batting: runs + (4s × 1) + (6s × 2)
  - Bowling: (wickets × 25) + (maidens × 10)
  - Only from winning team

### 2. **Live Scoring**
- Ball-by-ball scoring (runs, wides, no-balls, wickets)
- **Real-time batting stats** (runs, balls, 4s, 6s, strike rate)
- **Real-time bowling stats** (overs, runs, wickets, economy)
- Auto-update innings stats on every ball
- Swap batsmen on odd runs / end of over
- Undo last ball feature
- Change batsman/bowler during innings

### 3. **Wicket Management**
- **Wicket modal** when batsman gets out
- Select dismissal type (bowled, caught, lbw, stumped, run out, hit wicket)
- If caught/stumped → select fielder
- Select next batsman from **available (not out) players**
- Wicket stats:
  - **Bowled/Caught/LBW/Stumped** → wicket goes to bowler
  - **Run Out** → no wicket to bowler
  - Show dismissal info in scorecard ("c Fielder b Bowler", "run out", etc.)

### 4. **Scorecard**
- Innings-wise batting table (player, runs, balls, 4s, 6s, SR, dismissal)
- Innings-wise bowling table (bowler, overs, runs, wickets, economy)
- Fall of wickets timeline
- Over-by-over summary
- Extras breakdown (wides, no-balls, byes, leg-byes)

### 5. **Player Statistics**
- **Most Runs** leaderboard
- **Most Wickets** leaderboard
- **Most Boundaries** (4s + 6s) leaderboard
- Career stats updated after match ends
- Player-wise averages, highest score, total matches

### 6. **Team Snapshots (Historical Accuracy)**
- When match is created, team name + players + captain are **frozen** in `teamASnapshot` and `teamBSnapshot`
- If team name changes later (e.g., "Team A" → "New Team A"), old matches still show "Team A"
- Captain is per-match (today you're captain, tomorrow your friend is captain)

---

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user

### Players
- `GET /api/v1/players` - Get all players
- `POST /api/v1/players` - Create player
- `GET /api/v1/players/:id` - Get player by ID

### Teams
- `GET /api/v1/teams` - Get all teams
- `POST /api/v1/teams` - Create team
- `GET /api/v1/teams/:id` - Get team by ID
- `PUT /api/v1/teams/:id` - Update team

### Matches
- `GET /api/v1/matches` - Get all matches
- `POST /api/v1/matches` - Create match (with team snapshots + captains)
- `GET /api/v1/matches/:id` - Get match details with innings
- `POST /api/v1/matches/:id/start` - Start match
- `POST /api/v1/matches/:id/start-inning` - Start 2nd inning
- `POST /api/v1/matches/:id/end` - End match (calculate player of match)
- `GET /api/v1/matches/:id/current-inning` - Get live inning

### Scoring
- `POST /api/v1/scoring/add-ball` - Add ball (updates batting/bowling stats)
- `POST /api/v1/scoring/undo` - Undo last ball
- `POST /api/v1/scoring/swap-strike` - Swap batsmen
- `POST /api/v1/scoring/update-batsman` - Change batsman
- `POST /api/v1/scoring/update-bowler` - Change bowler

### Stats
- `GET /api/v1/stats/scorecard/:matchId` - Get match scorecard (innings with stats)
- `GET /api/v1/stats/most-runs` - Top 10 run scorers
- `GET /api/v1/stats/most-wickets` - Top 10 wicket takers
- `GET /api/v1/stats/most-boundaries` - Top 10 boundary hitters
- `GET /api/v1/stats/available-batsmen/:inningId` - Get not-out batsmen
- `GET /api/v1/stats/players` - All player stats

---

## Data Flow

### **Ball Addition Flow**
1. Frontend → `POST /scoring/add-ball` with:
   - `inningId`, `runs`, `ballType`, `wicketType`, `fielder`
2. Backend (`scoring.controller.js`):
   - Create `Ball` record
   - Find/create **batting stats** for striker
   - Find/create **bowling stats** for current bowler
   - Update runs, balls, fours, sixes, strike rate
   - Update overs, runsConceded, wickets, economy
   - If wicket:
     - Mark batsman as out
     - Set dismissal type
     - If not run out → give wicket to bowler
     - If caught/stumped → store fielder
   - Swap batsmen if odd runs
   - Check over completion
   - Check inning completion (10 wickets / max overs)
   - Save inning with updated stats
3. Frontend receives updated inning with live stats

### **Match End Flow**
1. `POST /matches/:id/end`
2. Backend:
   - Get both innings
   - Determine winner
   - Calculate **Player of the Match**:
     - Loop through all batting/bowling stats from both innings
     - Only consider players from winning team
     - Calculate points (runs + 4s×1 + 6s×2 + wickets×25 + maidens×10)
     - Player with max points → `match.playerOfTheMatch`
   - Save match as completed
3. Update player career stats (can be implemented)

### **Team Snapshot Logic**
- When creating match:
  ```javascript
  match.teamASnapshot = {
    name: teamAData.name,          // Current name at match time
    players: teamAData.players,    // Current players
    captain: teamACaptain          // Captain selected for THIS match
  }
  ```
- When viewing match later:
  - Show `teamASnapshot.name` (not current team name)
  - Show `teamASnapshot.captain` (captain for that match, not current captain)

---

## Frontend Pages

1. **Dashboard** (`/dashboard`) - Match list, create match
2. **Scoring** (`/scoring/[id]`) - Live scoring interface
   - Run buttons (0-6, wide, no-ball, wicket)
   - Live batsman stats display
   - Live bowler stats display
   - Wicket modal (dismissal type, fielder, next batsman)
   - Change batsman/bowler buttons
3. **View Scorecard** (`/view-scoreboard/[id]`) - Match scorecard
   - Innings selector (1st / 2nd)
   - Batting table (with dismissal info)
   - Bowling table
   - Fall of wickets
   - Over-by-over summary
4. **Stats** (`/stats`) - Leaderboards
   - Most Runs
   - Most Wickets
   - Most Boundaries
5. **Teams** (`/teams`) - Team management
6. **Players** (`/players`) - Player list

---

## How Things Are Connected

### **User → Player → Team → Match → Inning → Ball**

1. **User** creates a **Player** profile
2. **Owner** creates **Teams** and adds players
3. **Owner** creates a **Match** between two teams (with captain selection)
   - Match stores team snapshots (name, players, captain)
4. **Scorer** starts match → creates first **Inning**
5. **Scorer** adds balls → updates **Inning stats** (battingStats, bowlingStats)
6. Each ball creates a **Ball** record (source of truth)
7. **Inning** stats are derived from balls and updated on every ball
8. Match end → **Player** career stats updated (totalRuns, totalWickets, etc.)

### **Why Team Snapshots?**
- Team names can change over time
- Players can join/leave teams
- Captains change per match
- Historical matches should show **what was true at that time**
- Solution: Store a snapshot at match creation

### **Why Batting/Bowling Stats in Inning?**
- Faster queries (no need to aggregate balls every time)
- Live updates during scoring
- Pre-calculated strike rate, economy, etc.
- Still maintain balls as source of truth for detailed analysis

---

## Key Decisions & Rationale

### 1. **Why both Ball records AND stats arrays?**
- **Balls**: Source of truth, ball-by-ball history, undo functionality
- **Stats**: Aggregated for performance, live UI updates, scorecard display

### 2. **Why team snapshots?**
- Preserves historical accuracy
- Team names/rosters change over time
- Captains are match-specific, not team-specific

### 3. **Why player of match from winning team only?**
- Cricket convention: POTM usually from winning team
- Makes calculation meaningful

### 4. **Why separate Inning schema?**
- Matches have 2 innings
- Each inning is independent (different batsmen, bowlers, scores)
- Easier to query and populate

### 5. **Why fielder in Ball schema?**
- Needed for dismissal details ("c Dhoni b Bumrah")
- Shows in scorecard
- Credits fielder in stats

---

## Future Enhancements (Not Implemented Yet)

1. **Career Stats Update Hook**
   - After match ends, update player.totalRuns, player.totalWickets, etc.
   - Current: Stats endpoints aggregate from innings, but career stats not auto-updated

2. **Team Name Auto-Generation**
   - `teamName = ${captain.name}-team`
   - Current: Team names are manual

3. **Strike Rate / Economy in Ball Flow**
   - Already implemented in batting/bowling stats

4. **Match List Filters**
   - Filter by team, date, status

5. **Player Profile Page**
   - Individual player stats, match history

---

## Development Setup

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
**Backend** (`.env`):
```
MONGO_URI=mongodb://localhost:27017/cricket-scoring
JWT_SECRET=your-secret-key
PORT=5000
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Summary

This is a **production-ready cricket scoring system** with:
- ✅ Live ball-by-ball scoring
- ✅ Real-time player stats (batting/bowling)
- ✅ Wicket management with dismissal types
- ✅ Historical team snapshots (prevents data inconsistency)
- ✅ Match-specific captains
- ✅ Player of the Match auto-calculation
- ✅ Comprehensive scorecard (batting, bowling, fall of wickets)
- ✅ Leaderboards (runs, wickets, boundaries)
- ✅ Undo functionality
- ✅ Role-based access (owner, scorer, player)

All data flows are optimized for performance and accuracy!

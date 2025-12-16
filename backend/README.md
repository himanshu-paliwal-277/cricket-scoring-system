# Cricket Scoring System - Backend

A complete REST API for a cricket scoring and statistics management system built with Node.js, Express, and MongoDB.

## Features

- JWT Authentication with role-based access control
- Persistent player profiles (create once, reuse forever)
- Team creation with player selection
- Live match scoring with ball-by-ball tracking
- Undo functionality
- Automatic striker swap, over completion, inning management
- Player statistics and match history
- Role-based access: Owner, Scorer, Player

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB URI and JWT secret:
```
MONGO_URI=mongodb://localhost:27017/cricket-scoring
PORT=5000
JWT_SECRET=your_secret_key_here
```

4. Start the server:
```bash
npm start
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get player by ID
- `GET /api/players/:id/stats` - Get player statistics
- `POST /api/players` - Create player (Owner/Scorer only)
- `PUT /api/players/:id` - Update player (Owner only)

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create team (Owner only)
- `PUT /api/teams/:id` - Update team (Owner only, locked after match starts)
- `DELETE /api/teams/:id` - Delete team (Owner only)

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match by ID with innings
- `GET /api/matches/:id/current-inning` - Get current live inning
- `POST /api/matches` - Create match (Owner only)
- `POST /api/matches/:id/start` - Start match (Owner/Scorer)

### Scoring
- `POST /api/scoring/ball` - Add ball to inning (Scorer/Owner)
- `POST /api/scoring/undo/:inningId` - Undo last ball (Scorer/Owner)
- `PUT /api/scoring/batsmen` - Update striker/non-striker (Scorer/Owner)
- `PUT /api/scoring/bowler` - Update current bowler (Scorer/Owner)
- `POST /api/scoring/second-inning` - Start second inning (Scorer/Owner)

## Database Models

- **User**: Authentication and role management
- **Player**: Player profiles with career statistics
- **Team**: Team composition (players, locked status)
- **Match**: Match details, teams, overs, status
- **Inning**: Current inning state, runs, wickets, overs
- **Ball**: Ball-by-ball records for undo and analytics

## Scoring Logic

- Runs: +1, +2, +3, +4, +6
- Extras: Wide, No Ball (adds run, ball not counted)
- Wickets: Multiple types supported
- Auto striker swap on odd runs
- Over completion after 6 valid balls
- Inning completion on all out or overs completed
- Match winner determination

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing

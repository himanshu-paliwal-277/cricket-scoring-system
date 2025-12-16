import dotenv from "dotenv";

dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI;
export const PORT = process.env.PORT || 4000;
export const JWT_SECRET = process.env.JWT_SECRET;
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:3001", "https://cricket-scoring-system.netlify.app"];

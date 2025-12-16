import mongoose from "mongoose";

import { MONGODB_URI } from "./serverConfig.js";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`🟢 MongoDB successfully connected`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;

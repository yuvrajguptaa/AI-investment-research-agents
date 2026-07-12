import mongoose from "mongoose";

export let isConnectedToMongo = false;

export async function connectDB() {
  // Use MONGODB_URI from environment variables or default to local mongo
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/investment-research";
  
  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${uri}`);
    
    const options = {
      serverSelectionTimeoutMS: process.env.NODE_ENV === "production" ? 15000 : 3000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
    };
    
    await mongoose.connect(uri, options);
    
    isConnectedToMongo = true;
    console.log("[Database] MongoDB connection established successfully.");
  } catch (error: any) {
    console.error("[Database] MongoDB connection failed:", error.message || error);
    console.log("[Database] FALLING BACK to a local JSON file-based database (history_db.json) to keep app running.");
    isConnectedToMongo = false;
  }
}

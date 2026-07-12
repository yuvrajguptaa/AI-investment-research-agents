import dotenv from "dotenv";
import path from "path";

// Load environment variables from root directory (.env and .env.local) first, then fallback to local
const rootDir = path.resolve(__dirname, "../../");
dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config({ path: path.join(rootDir, ".env.local") });
dotenv.config();
dotenv.config({ path: ".env.local" });

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Connect to database (either Mongo or JSON fallback)
  await connectDB();
  
  // Listen on PORT
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 INVESTIQ RESEARCH TERMINAL BACKEND IS ONLINE  `);
    console.log(`📡 PORT: ${PORT}                                 `);
    console.log(`🌐 HEALTH: http://localhost:${PORT}/api/health     `);
    console.log(`=================================================`);
  });
}

startServer();

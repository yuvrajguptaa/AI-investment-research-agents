import fs from "fs";
import path from "path";
import { ResearchHistory, IResearchHistory } from "./ResearchHistory.js";
import { isConnectedToMongo } from "../config/db.js";

const LOCAL_DB_PATH = path.join(__dirname, "../../../history_db.json");

// Helper to read local JSON database
function readLocalDb(): any[] {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(LOCAL_DB_PATH, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("[Local DB] Error reading file:", error);
    return [];
  }
}

// Helper to write local JSON database
function writeLocalDb(data: any[]) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("[Local DB] Error writing file:", error);
  }
}

export class HistoryRepository {
  /**
   * Save a new research record
   */
  static async save(recordData: any): Promise<any> {
    if (isConnectedToMongo) {
      const record = new ResearchHistory(recordData);
      return await record.save();
    } else {
      const db = readLocalDb();
      const newRecord = {
        _id: Math.random().toString(36).substring(2, 11),
        timestamp: new Date(),
        isFavorite: false,
        ...recordData
      };
      db.push(newRecord);
      writeLocalDb(db);
      return newRecord;
    }
  }

  /**
   * Find a record by its unique ID
   */
  static async findById(id: string): Promise<any> {
    if (isConnectedToMongo) {
      return await ResearchHistory.findById(id);
    } else {
      const db = readLocalDb();
      return db.find((r) => r._id === id) || null;
    }
  }

  /**
   * Fetch all records, sorted by date (newest first)
   */
  static async findAll(): Promise<any[]> {
    if (isConnectedToMongo) {
      return await ResearchHistory.find().sort({ timestamp: -1 });
    } else {
      const db = readLocalDb();
      return [...db].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }

  /**
   * Delete a record by ID
   */
  static async deleteById(id: string): Promise<boolean> {
    if (isConnectedToMongo) {
      const res = await ResearchHistory.deleteOne({ _id: id });
      return res.deletedCount > 0;
    } else {
      const db = readLocalDb();
      const index = db.findIndex((r) => r._id === id);
      if (index > -1) {
        db.splice(index, 1);
        writeLocalDb(db);
        return true;
      }
      return false;
    }
  }

  /**
   * Toggle the favorite status of a record
   */
  static async toggleFavorite(id: string): Promise<any> {
    if (isConnectedToMongo) {
      const record = await ResearchHistory.findById(id);
      if (record) {
        record.isFavorite = !record.isFavorite;
        return await record.save();
      }
      return null;
    } else {
      const db = readLocalDb();
      const index = db.findIndex((r) => r._id === id);
      if (index > -1) {
        db[index].isFavorite = !db[index].isFavorite;
        writeLocalDb(db);
        return db[index];
      }
      return null;
    }
  }
}

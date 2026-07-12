import fs from "fs";
import path from "path";
import axios from "axios";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";

// Load environment variables
const rootDir = path.resolve(__dirname, "../../../");
dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config({ path: path.join(rootDir, ".env.local") });
dotenv.config();

const CHROMADB_URL = process.env.CHROMADB_URL || "http://localhost:8000";
const LOCAL_DB_PATH = path.join(rootDir, "chroma_db_fallback.json");

// Helper to instantiate embeddings generator
let embeddingsGenerator: GoogleGenerativeAIEmbeddings | null = null;
function getEmbeddingsGenerator() {
  if (!embeddingsGenerator) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey.startsWith("YOUR_")) {
      throw new Error("Missing GEMINI_API_KEY for embedding generation.");
    }
    embeddingsGenerator = new GoogleGenerativeAIEmbeddings({
      apiKey,
      modelName: "text-embedding-004",
    });
  }
  return embeddingsGenerator;
}

/**
 * Standardize/Normalize company names as requested in STEP 1
 */
export function normalizeCompanyName(name: string): string {
  let clean = name.trim().toLowerCase();
  
  // Strip common corporate suffixes
  clean = clean.replace(/\b(inc|corp|co|corporation|incorporated|motors|ltd|limited|plc|gmbh|sa)\b\.?/gi, "").trim();
  
  // Example normalizations
  if (clean.includes("google")) {
    return "Alphabet Inc.";
  }
  if (clean.includes("tesla")) {
    return "Tesla";
  }
  if (clean.includes("apple")) {
    return "Apple";
  }
  if (clean.includes("microsoft")) {
    return "Microsoft";
  }
  if (clean.includes("nvidia")) {
    return "NVIDIA";
  }
  if (clean === "tcs" || clean.includes("tata consultancy")) {
    return "TCS";
  }
  if (clean === "intel") {
    return "Intel";
  }
  if (clean === "amd" || clean.includes("advanced micro devices")) {
    return "AMD";
  }
  if (clean === "salesforce") {
    return "Salesforce";
  }
  if (clean === "openai") {
    return "OpenAI";
  }
  
  // Capitalize first letter of each word for clean naming
  return clean.replace(/\b\w/g, c => c.toUpperCase());
}

// Local Database Chunks Interface
interface LocalChunk {
  id: string;
  companyName: string;
  document: string;
  metadata: {
    company_name: string;
    industry: string;
    market_cap: string;
    generated_date: string;
  };
  embedding?: number[];
}

// Helper to read local JSON vector store fallback
function readLocalDb(): LocalChunk[] {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(LOCAL_DB_PATH, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("[Vector Cache Fallback] Error reading file:", error);
    return [];
  }
}

// Helper to write local JSON vector store fallback
function writeLocalDb(data: LocalChunk[]) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("[Vector Cache Fallback] Error writing file:", error);
  }
}

/**
 * Check if ChromaDB is online
 */
async function isChromaOnline(): Promise<boolean> {
  try {
    await axios.get(`${CHROMADB_URL}/api/v1`, { timeout: 1000 });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check cache in Vector database (ChromaDB or local JSON fallback)
 */
export async function checkVectorCache(rawCompanyName: string): Promise<{ cacheFound: boolean; documents: string[] }> {
  const companyName = normalizeCompanyName(rawCompanyName);
  console.log(`[Vector Cache] Checking cache for normalized company: "${companyName}"`);

  const online = await isChromaOnline();
  if (online) {
    try {
      // 1. Get or Create Chroma collection
      const collRes = await axios.post(`${CHROMADB_URL}/api/v1/collections`, {
        name: "companies",
        get_or_create: true
      });
      const collectionId = collRes.data.id;

      // 2. Generate embedding for query
      const embedder = getEmbeddingsGenerator();
      const queryEmbedding = await embedder.embedQuery(`investment research report for ${companyName}`);

      // 3. Query collection
      const queryRes = await axios.post(`${CHROMADB_URL}/api/v1/collections/${collectionId}/query`, {
        query_embeddings: [queryEmbedding],
        n_results: 5,
        where: { company_name: companyName } // filter specifically by company
      });

      const docs = queryRes.data.documents[0] || [];
      const distances = queryRes.data.distances[0] || [];
      
      // Convert distance to relevance score. In ChromaDB, relevance score can be computed
      // from cosine distance: score = 1 - distance (or similar mapping).
      // Check if any matching document satisfies relevance score >= 0.80
      const hasMatch = distances.some((dist: number) => (1 - dist) >= 0.80);

      if (docs.length > 0 && hasMatch) {
        console.log(`[Vector Cache] HIT - Found semantic match in ChromaDB for "${companyName}"`);
        return { cacheFound: true, documents: docs };
      }
    } catch (err: any) {
      console.warn("[Vector Cache] ChromaDB query failed, attempting local fallback:", err.message);
    }
  }

  // Local JSON Fallback Mode
  console.log("[Vector Cache] Using local JSON vector store fallback.");
  const localDb = readLocalDb();
  const matchedChunks = localDb.filter(c => c.companyName.toLowerCase() === companyName.toLowerCase());

  if (matchedChunks.length > 0) {
    console.log(`[Vector Cache] HIT - Found cached chunks in local JSON for "${companyName}"`);
    return {
      cacheFound: true,
      documents: matchedChunks.map(c => c.document)
    };
  }

  console.log(`[Vector Cache] MISS - No cache found for "${companyName}"`);
  return { cacheFound: false, documents: [] };
}

/**
 * Save text chunks to Vector Cache
 */
export async function saveVectorCache(
  rawCompanyName: string,
  chunks: string[],
  metadata: { industry: string; marketCap: string }
): Promise<void> {
  const companyName = normalizeCompanyName(rawCompanyName);
  console.log(`[Vector Cache] Saving ${chunks.length} chunks to cache for "${companyName}"`);

  const generatedDate = new Date().toISOString().split("T")[0];
  const chunkMetadata = {
    company_name: companyName,
    industry: metadata.industry || "Information unavailable.",
    market_cap: metadata.marketCap || "Information unavailable.",
    generated_date: generatedDate
  };

  const online = await isChromaOnline();
  if (online) {
    try {
      // 1. Get or Create Chroma collection
      const collRes = await axios.post(`${CHROMADB_URL}/api/v1/collections`, {
        name: "companies",
        get_or_create: true
      });
      const collectionId = collRes.data.id;

      // 2. Generate embeddings for all chunks
      const embedder = getEmbeddingsGenerator();
      const embeddings = await embedder.embedDocuments(chunks);

      const ids = chunks.map((_, i) => `${companyName.replace(/\s+/g, "_")}_chunk_${i}`);
      const metadatas = chunks.map(() => chunkMetadata);

      // 3. Add to Chroma collection
      await axios.post(`${CHROMADB_URL}/api/v1/collections/${collectionId}/add`, {
        embeddings,
        documents: chunks,
        metadatas,
        ids
      });

      console.log(`[Vector Cache] Saved to ChromaDB successfully.`);
      return;
    } catch (err: any) {
      console.warn("[Vector Cache] Failed to save to ChromaDB, saving to local JSON fallback:", err.message);
    }
  }

  // Local JSON Fallback Mode
  const localDb = readLocalDb();
  
  // Clean up any existing chunks for this company to prevent duplication
  const filteredDb = localDb.filter(c => c.companyName.toLowerCase() !== companyName.toLowerCase());

  // Generate embeddings for the local DB chunks as well (optional, but good for completeness)
  let embeddings: number[][] = [];
  try {
    const embedder = getEmbeddingsGenerator();
    embeddings = await embedder.embedDocuments(chunks);
  } catch (err) {
    console.warn("[Vector Cache Fallback] Embeddings generation failed, saving without vectors:", err);
  }

  const newChunks: LocalChunk[] = chunks.map((chunk, i) => ({
    id: `${companyName.replace(/\s+/g, "_")}_chunk_${i}`,
    companyName,
    document: chunk,
    metadata: chunkMetadata,
    embedding: embeddings[i] || []
  }));

  writeLocalDb([...filteredDb, ...newChunks]);
  console.log(`[Vector Cache] Saved ${newChunks.length} chunks to local JSON vector cache.`);
}

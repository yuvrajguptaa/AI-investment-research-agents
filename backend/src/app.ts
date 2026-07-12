import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { runResearchWorkflow } from "ai";
import { HistoryRepository } from "./models/historyRepository.js";
import { isConnectedToMongo } from "./config/db.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*", // Adjust as necessary for production security
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(compression());

// Logger Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rate limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/", limiter);

/**
 * GET /health
 * Simple health check for Render / load balancers.
 */
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

/**
 * GET /api/health
 * Returns database status, system health, and fallback mode info.
 */
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    database: isConnectedToMongo ? "connected" : "fallback (local file-based)",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

/**
 * POST /api/research
 * Validates request and triggers the LangGraph agentic research pipeline.
 */
app.post("/api/research", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { company } = req.body;
    
    // Validation
    if (!company || typeof company !== "string" || company.trim().length === 0) {
      return res.status(400).json({ error: "Company name is required and must be a string." });
    }

    console.log(`[API] Triggering research workflow for company: "${company}"`);
    
    // Run LangGraph agents
    const graphState = await runResearchWorkflow(company);
    
    if (!graphState.finalRecommendation) {
      throw new Error("Agents failed to generate a recommendation.");
    }

    const finalReport = graphState.finalRecommendation;

    // Save detailed results to database
    const savedRecord = await HistoryRepository.save({
      company: finalReport.company || company,
      ticker: graphState.ticker || finalReport.ticker || "",
      ceo: graphState.ceo || "",
      founders: graphState.founders || "",
      headquarters: graphState.headquarters || "",
      recommendation: finalReport.recommendation || "PASS",
      confidence: finalReport.confidence || 50,
      score: finalReport.score || 5.0,
      summary: finalReport.summary || "",
      strengths: finalReport.strengths || [],
      weaknesses: finalReport.weaknesses || [],
      risks: finalReport.risks || [],
      opportunities: finalReport.opportunities || [],
      competitors: finalReport.competitors || [],
      financialAnalysis: finalReport.financialAnalysis || {},
      marketAnalysis: finalReport.marketAnalysis || {},
      competitorAnalysis: graphState.competitorAnalysis || {},
      newsAnalysis: finalReport.newsAnalysis || {},
      riskAnalysis: finalReport.riskAnalysis || {},
      finalReasoning: finalReport.finalReasoning || "",
      financials: graphState.financials, // to render charts on frontend
      logs: graphState.logs
    });

    res.status(201).json(savedRecord);
  } catch (error: any) {
    console.error("[API] Research execution failed:", error);
    res.status(500).json({ 
      error: "Research execution failed", 
      details: error.message || error 
    });
  }
});

/**
 * GET /api/history
 * Returns list of past research logs.
 */
app.get("/api/history", async (req: Request, res: Response) => {
  try {
    const history = await HistoryRepository.findAll();
    res.status(200).json(history);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve history", details: error.message });
  }
});

/**
 * GET /api/research/:id
 * Fetches a single past research card.
 */
app.get("/api/research/:id", async (req: Request, res: Response) => {
  try {
    const record = await HistoryRepository.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: "Research report not found." });
    }
    res.status(200).json(record);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve report", details: error.message });
  }
});

/**
 * DELETE /api/history/:id
 * Deletes a past report.
 */
app.delete("/api/history/:id", async (req: Request, res: Response) => {
  try {
    const success = await HistoryRepository.deleteById(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Report not found or already deleted." });
    }
    res.status(200).json({ message: "Research record deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete record", details: error.message });
  }
});

/**
 * POST /api/history/:id/favorite
 * Toggles favorite state of a report. (Bonus Feature)
 */
app.post("/api/history/:id/favorite", async (req: Request, res: Response) => {
  try {
    const updated = await HistoryRepository.toggleFavorite(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: "Report not found." });
    }
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update record", details: error.message });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[Server Error]", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred"
  });
});

export default app;

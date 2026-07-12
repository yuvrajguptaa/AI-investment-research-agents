import { StateGraph, START, END } from "@langchain/langgraph";
import { ResearchStateAnnotation } from "./state.js";
import {
  investmentAnalysisAgent,
  invokeLLMWithRetry
} from "../agents/index.js";
import {
  normalizeCompanyName,
  checkVectorCache,
  saveVectorCache
} from "../tools/vectorCache.js";
import { generateCompanyPdf } from "../tools/pdfGenerator.js";
import { getFinancialMetrics, lookupTicker } from "../tools/finance.js";
import { searchWeb, getCompanyNews } from "../tools/search.js";
import path from "path";

const companyMetadata: Record<string, { ceo: string; founders: string; headquarters: string }> = {
  "Tesla": {
    ceo: "Elon Musk",
    founders: "Martin Eberhard, Marc Tarpenning, JB Straubel, Ian Wright, Elon Musk",
    headquarters: "Austin, Texas, USA"
  },
  "Apple": {
    ceo: "Tim Cook",
    founders: "Steve Jobs, Steve Wozniak, Ronald Wayne",
    headquarters: "Cupertino, California, USA"
  },
  "Microsoft": {
    ceo: "Satya Nadella",
    founders: "Bill Gates, Paul Allen",
    headquarters: "Redmond, Washington, USA"
  },
  "NVIDIA": {
    ceo: "Jensen Huang",
    founders: "Jensen Huang, Chris Malachowsky, Curtis Priem",
    headquarters: "Santa Clara, California, USA"
  },
  "Amazon": {
    ceo: "Andy Jassy",
    founders: "Jeff Bezos",
    headquarters: "Seattle, Washington, USA"
  },
  "Alphabet Inc.": {
    ceo: "Sundar Pichai",
    founders: "Larry Page, Sergey Brin",
    headquarters: "Mountain View, California, USA"
  },
  "Meta": {
    ceo: "Mark Zuckerberg",
    founders: "Mark Zuckerberg",
    headquarters: "Menlo Park, California, USA"
  },
  "Oracle": {
    ceo: "Safra Catz",
    founders: "Larry Ellison, Bob Miner, Ed Oates",
    headquarters: "Austin, Texas, USA"
  },
  "Adobe": {
    ceo: "Shantanu Narayen",
    founders: "John Warnock, Charles Geschke",
    headquarters: "San Jose, California, USA"
  },
  "Netflix": {
    ceo: "Ted Sarandos & Greg Peters",
    founders: "Reed Hastings, Marc Randolph",
    headquarters: "Los Gatos, California, USA"
  },
  "TCS": {
    ceo: "K. Krithivasan",
    founders: "Tata Sons",
    headquarters: "Mumbai, India"
  },
  "Intel": {
    ceo: "Lip-Bu Tan",
    founders: "Robert Noyce, Gordon Moore",
    headquarters: "Santa Clara, CA, USA"
  },
  "AMD": {
    ceo: "Lisa Su",
    founders: "Jerry Sanders, Edwin Turney, John Carey, Sven Simonsen, Jack Gifford, Frank Botte, Jim Giles, Larry Stenger",
    headquarters: "Santa Clara, CA, USA"
  },
  "Salesforce": {
    ceo: "Marc Benioff",
    founders: "Marc Benioff, Parker Harris, Dave Moellenhoff, Frank Dominguez",
    headquarters: "San Francisco, CA, USA"
  },
  "OpenAI": {
    ceo: "Sam Altman",
    founders: "Sam Altman, Elon Musk, Greg Brockman, Ilya Sutskever, Wojciech Zaremba, John Schulman",
    headquarters: "San Francisco, CA, USA"
  }
};

/**
 * Node 1: Check Cache (STEP 1, 2, 3)
 */
async function checkCacheNode(state: any): Promise<any> {
  const rawCompany = state.company;
  const companyName = normalizeCompanyName(rawCompany);
  console.log(`[Orchestrator STEP 1 & 2] Checking cache for "${companyName}"...`);

  try {
    const { cacheFound, documents } = await checkVectorCache(companyName);
    if (cacheFound && documents.length > 0) {
      console.log(`[Orchestrator STEP 3] Cache hit for "${companyName}". Skipping tools and APIs.`);
      
      let ticker = companyName;
      try {
        ticker = await lookupTicker(companyName);
      } catch (e) {
        console.warn(`[Orchestrator] Ticker lookup failed in cacheNode:`, e);
      }

      let financials: any = null;
      try {
        financials = await getFinancialMetrics(ticker);
      } catch (e) {
        console.warn(`[Orchestrator] Financial metrics retrieval failed in cacheNode:`, e);
      }

      const meta = companyMetadata[companyName] || { ceo: financials?.ceo || "N/A", founders: "N/A", headquarters: "N/A" };

      return {
        company: companyName,
        cacheFound: true,
        ticker,
        financials,
        ceo: meta.ceo,
        founders: meta.founders,
        headquarters: meta.headquarters,
        researchData: documents.join("\n\n"),
        logs: [
          `Normalized company name: ${companyName}`,
          `Cache HIT: Retrieved semantic documents from vector cache.`,
          `Fetched real-time financial metrics for ticker: ${ticker}`
        ]
      };
    }
  } catch (err: any) {
    console.error("[Orchestrator Check Cache Error]", err);
  }

  return {
    company: companyName, // update to normalized name
    cacheFound: false,
    logs: [`Normalized company name: ${companyName}`, `Cache MISS: No cached research found. Commencing real-time tools execution.`]
  };
}

/**
 * Node 2: Run Tools & Build KB (STEP 4, 5, 6, 7, 8)
 */
async function runToolsNode(state: any): Promise<any> {
  // If cache is found, skip this node entirely
  if (state.cacheFound) {
    return {};
  }

  const company = state.company;
  console.log(`[Orchestrator STEP 4] Creating knowledge base for "${company}"...`);

  // 1. Resolve stock ticker
  let ticker = company;
  try {
    ticker = await lookupTicker(company);
  } catch (e) {
    console.warn(`[Orchestrator] Ticker lookup failed:`, e);
  }

  // 2. Fetch financials and market data
  let financials: any = null;
  try {
    financials = await getFinancialMetrics(ticker);
  } catch (e) {
    console.warn(`[Orchestrator] Financial metrics retrieval failed:`, e);
  }

  // 3. Search profile details
  let profileSearch = "";
  try {
    profileSearch = await searchWeb(`${company} (${ticker}) company description sector industry CEO headquarters website employees`);
  } catch (e) {
    console.warn(`[Orchestrator] Profile search failed:`, e);
  }

  // 4. Fetch News (latest 20 news articles description)
  let newsSearch = "";
  try {
    const newsArticles = await getCompanyNews(company);
    newsSearch = newsArticles.map((n, i) => `${i+1}. Headline: ${n.title}\nSource: ${n.source}\nSummary: ${n.description}\nDate: ${n.publishedAt}\n---`).join("\n");
  } catch (e) {
    console.warn(`[Orchestrator] News fetching failed:`, e);
  }

  // 5. Scrape Company Website
  let websiteSearch = "";
  try {
    websiteSearch = await searchWeb(`${company} company website about us mission statement values products services`);
  } catch (e) {
    console.warn(`[Orchestrator] Website search failed:`, e);
  }

  // 6. Competitor Search (Top 5 competitors)
  let competitorSearch = "";
  try {
    competitorSearch = await searchWeb(`${company} top 5 competitors peers key industry rivals`);
  } catch (e) {
    console.warn(`[Orchestrator] Competitor search failed:`, e);
  }

  // Synthesize and merge all collected data into a structured knowledge base (STEP 5)
  console.log(`[Orchestrator STEP 5] Merging all collected info into structured knowledge base...`);
  const synthesisPrompt = `You are a Research Knowledge Base Builder. Merge the following collected corporate details, financials, website info, and news into a single structured report for ${company}.

Collected Information:
- Financial Metrics: ${JSON.stringify(financials || "None")}
- Profile Search: ${profileSearch}
- Recent News Feed: ${newsSearch}
- Website Search: ${websiteSearch}
- Competitor Search: ${competitorSearch}

You MUST compile all of this into a single, cohesive, long-form markdown document. The document must contain precisely these sections:
# Company Overview
[Write overview here]

# Business Model
[Write business model here]

# Products
[Write key products/services here]

# Industry
[Write industry outlook/TAM here]

# Financial Highlights
[Summarize revenue, earnings, cash flows, valuation margins]

# Leadership
[State CEO, headquarters, etc.]

# Competitive Advantages
[Explain competitive moat here]

# Revenue Sources
[State revenue segments]

# Growth Opportunities
[State potential growth paths]

# Recent News
[State recent news summaries]

# Risk Factors
[State SWOT and risk highlights]

# SWOT Analysis
[State strengths, weaknesses, opportunities, threats]

# Investment Thesis
[State thesis here]

Be thorough. NEVER invent financial numbers. If info is missing, write "Information unavailable."`;

  let knowledgeBaseText = "";
  try {
    knowledgeBaseText = await invokeLLMWithRetry(synthesisPrompt, "You are a senior investment writer. Merge context into structured markdown report.", 0.2);
  } catch (err: any) {
    throw new Error(`Orchestrator compilation failed: ${err.message}`);
  }

  // 7. Write PDF report to /company-pdfs/{company}.pdf (STEP 6)
  const rootDir = path.resolve(__dirname, "../../../");
  const pdfPath = path.join(rootDir, "company-pdfs", `${company.replace(/\s+/g, "_")}.pdf`);
  console.log(`[Orchestrator STEP 6] Writing PDF to: ${pdfPath}`);
  try {
    await generateCompanyPdf(company, knowledgeBaseText, pdfPath);
  } catch (err: any) {
    console.error(`[Orchestrator PDF Error] Failed to generate PDF:`, err.message);
  }

  // 8. Chunk the text (STEP 7)
  // Chunk size 1000 characters, overlap 150 characters
  console.log(`[Orchestrator STEP 7] Splitting text into chunks of 1000 characters (overlap 150)...`);
  const chunks: string[] = [];
  let index = 0;
  const chunkSize = 1000;
  const chunkOverlap = 150;
  
  while (index < knowledgeBaseText.length) {
    const end = Math.min(index + chunkSize, knowledgeBaseText.length);
    chunks.push(knowledgeBaseText.slice(index, end));
    if (end === knowledgeBaseText.length) break;
    index += (chunkSize - chunkOverlap);
  }

  // Save to Vector Cache (either ChromaDB or fallback)
  const industry = financials?.industry || "Information unavailable.";
  const marketCap = financials?.marketCap ? `$${(financials.marketCap / 1e9).toFixed(2)}B` : "Information unavailable.";
  
  try {
    await saveVectorCache(company, chunks, { industry, marketCap });
  } catch (err: any) {
    console.error(`[Orchestrator Vector Error] Failed to embed/save chunks:`, err.message);
  }

  // 9. Retrieve context (STEP 8)
  console.log(`[Orchestrator STEP 8] Retrieving newly embedded documents (Top K = 5)...`);
  let retrievedContext = knowledgeBaseText;
  try {
    const { documents } = await checkVectorCache(company);
    if (documents.length > 0) {
      retrievedContext = documents.slice(0, 5).join("\n\n");
    }
  } catch (err) {
    console.warn(`[Orchestrator] Retrieve failed, using default text:`, err);
  }

  const meta = companyMetadata[company] || { ceo: financials?.ceo || "N/A", founders: "N/A", headquarters: "N/A" };

  return {
    ticker,
    financials,
    companyOverview: financials?.companyDescription || "Corporate overview.",
    ceo: meta.ceo,
    founders: meta.founders,
    headquarters: meta.headquarters,
    researchData: retrievedContext, // For investment analysis agent
    logs: [
      `Fetched profile, financials, and news APIs.`,
      `Built merged corporate Knowledge Base.`,
      `Generated PDF report under /company-pdfs/`,
      `Split knowledge base text and generated text-embedding-004 embeddings.`,
      `Saved chunks to collection "companies" in vector store.`,
      `Retrieved Top 5 matching chunks from vector database.`
    ]
  };
}

/**
 * Node 3: Run Investment Analysis (STEP 9)
 */
async function runAnalysisNode(state: any): Promise<any> {
  const result = await investmentAnalysisAgent(state);
  return result;
}

export function createWorkflow() {
  const workflow = new StateGraph(ResearchStateAnnotation)
    .addNode("checkCacheNode", checkCacheNode)
    .addNode("toolsNode", runToolsNode)
    .addNode("analysisNode", runAnalysisNode);

  // Sequential execution flow
  workflow.addEdge(START, "checkCacheNode");
  workflow.addEdge("checkCacheNode", "toolsNode");
  workflow.addEdge("toolsNode", "analysisNode");
  workflow.addEdge("analysisNode", END);

  return workflow.compile();
}

/**
 * Runs the workflow for a given company name.
 */
export async function runResearchWorkflow(companyName: string) {
  const app = createWorkflow();
  console.log(`[LangGraph Workflow] Starting Orchestrator for: ${companyName}`);
  
  const initialState = {
    company: companyName,
    logs: [`Initiating AI Research Orchestrator...`]
  };

  try {
    const result = await app.invoke(initialState);
    return result;
  } catch (error: any) {
    console.error("[LangGraph Workflow] Execution crashed:", error);
    throw error;
  }
}

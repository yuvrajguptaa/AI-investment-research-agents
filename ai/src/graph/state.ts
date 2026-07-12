import { Annotation } from "@langchain/langgraph";

export interface CompanyFinancials {
  ticker: string;
  price: number;
  changePercent: number;
  marketCap: number;
  peRatio: number;
  eps: number;
  forwardPE: number;
  pegRatio: number;
  priceToBook: number;
  dividendYield: number;
  profitMargin: number;
  operatingMargin: number;
  grossMargin: number;
  returnOnEquity: number;
  returnOnAssets: number;
  totalRevenue: number;
  revenueGrowth: number;
  totalCash: number;
  totalDebt: number;
  debtToEquity: number;
  currentRatio: number;
  freeCashFlow: number;
  operatingCashFlow: number;
  revenueGrowthData: { year: string; revenue: number; netIncome: number }[];
  profitabilityData: { name: string; value: number }[];
  recommendationTrend?: any[];
}

export const ResearchStateAnnotation = Annotation.Root({
  company: Annotation<string>(),
  ticker: Annotation<string>(),
  ceo: Annotation<string>(),
  founders: Annotation<string>(),
  headquarters: Annotation<string>(),
  financials: Annotation<CompanyFinancials>(),
  cacheFound: Annotation<boolean>(),
  
  // Agent Outputs
  companyOverview: Annotation<string>(),
  researchData: Annotation<string>(), // Raw web research logs
  financialAnalysis: Annotation<any>(),
  marketAnalysis: Annotation<any>(),
  riskAnalysis: Annotation<any>(),
  competitorAnalysis: Annotation<any>(),
  newsAnalysis: Annotation<any>(),
  
  reflectionNotes: Annotation<string>(),
  criticisms: Annotation<string>(),
  committeeVotes: Annotation<any[]>(),
  finalRecommendation: Annotation<any>(),
  
  // Logs for UI timeline
  logs: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});

export type ResearchState = typeof ResearchStateAnnotation.State;

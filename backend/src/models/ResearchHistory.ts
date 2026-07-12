import { Schema, model, Document } from "mongoose";

export interface IResearchHistory extends Document {
  company: string;
  ticker?: string;
  ceo?: string;
  founders?: string;
  headquarters?: string;
  timestamp: Date;
  recommendation: "INVEST" | "PASS";
  confidence: number;
  score: number;
  summary?: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  opportunities: string[];
  competitors: any[];
  financialAnalysis: Record<string, any>;
  marketAnalysis: Record<string, any>;
  competitorAnalysis?: Record<string, any>;
  newsAnalysis: Record<string, any>;
  riskAnalysis?: Record<string, any>;
  finalReasoning: string;
  financials?: Record<string, any>;
  logs?: string[];
  isFavorite?: boolean;
}

const ResearchHistorySchema = new Schema<IResearchHistory>({
  company: { type: String, required: true },
  ticker: { type: String },
  ceo: { type: String },
  founders: { type: String },
  headquarters: { type: String },
  timestamp: { type: Date, default: Date.now },
  recommendation: { type: String, enum: ["INVEST", "PASS"], required: true },
  confidence: { type: Number, required: true },
  score: { type: Number, required: true },
  summary: { type: String },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  risks: [{ type: String }],
  opportunities: [{ type: String }],
  competitors: { type: Schema.Types.Mixed, default: [] },
  financialAnalysis: { type: Schema.Types.Mixed, required: true },
  marketAnalysis: { type: Schema.Types.Mixed, required: true },
  competitorAnalysis: { type: Schema.Types.Mixed },
  newsAnalysis: { type: Schema.Types.Mixed, required: true },
  riskAnalysis: { type: Schema.Types.Mixed },
  finalReasoning: { type: String, required: true },
  
  // Extra detailed items to render interactive charts and timelines from historical cards
  financials: { type: Schema.Types.Mixed },
  logs: [{ type: String }],
  isFavorite: { type: Boolean, default: false }
});

export const ResearchHistory = model<IResearchHistory>("ResearchHistory", ResearchHistorySchema);

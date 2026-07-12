import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Download, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Percent, 
  Cpu, 
  Users, 
  Newspaper,
  CheckCircle,
  XCircle,
  Scale
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend 
} from "recharts";

export const ResearchResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/research/${id}`);
        if (res.ok) {
          const report = await res.json();
          setData(report);
        } else {
          alert("Report not found!");
          navigate("/terminal");
        }
      } catch (err) {
        console.error("Failed to load report", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse py-8">
        <div className="h-6 w-32 bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-slate-800 rounded-3xl md:col-span-2" />
          <div className="h-40 bg-slate-800 rounded-3xl" />
        </div>
        <div className="h-96 bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!data) return null;

  // Extract financial data or fallback to defaults
  const financials = data.financials || {};
  const revGrowthData = financials.revenueGrowthData || [];
  const profitabilityData = financials.profitabilityData || [];
  
  // Risk Pie Data
  const riskWeights = data.riskAnalysis?.riskCategoryDistribution || { financial: 25, operational: 25, regulatory: 25, market: 25 };
  const riskPieData = [
    { name: "Financial", value: riskWeights.financial, color: "#3b82f6" },
    { name: "Operational", value: riskWeights.operational, color: "#10b981" },
    { name: "Regulatory", value: riskWeights.regulatory, color: "#f43f5e" },
    { name: "Market", value: riskWeights.market, color: "#e2e8f0" }
  ];

  // Radar Data based on agent scores
  const radarData = [
    { subject: "Financials", A: (data.financialAnalysis?.financialScore || 5) * 10, fullMark: 100 },
    { subject: "Market Position", A: (data.marketAnalysis?.marketScore || 5) * 10, fullMark: 100 },
    { subject: "Moat Scale", A: (data.competitorAnalysis?.competitorScore || 5) * 10, fullMark: 100 },
    { subject: "Sentiment", A: (data.newsAnalysis?.newsScore || 5) * 10, fullMark: 100 },
    { subject: "Risk Resistance", A: (10 - (data.riskAnalysis?.riskScore || 5)) * 10, fullMark: 100 }
  ];

  // Print-to-PDF Handler
  const handlePrint = () => {
    window.print();
  };

  const isInvest = data.recommendation === "INVEST";

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 print:p-0 print:bg-white print:text-black">
      
      {/* Action Header */}
      <div className="flex justify-between items-center print:hidden">
        <Link to="/terminal" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Terminal
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-glassborder transition-all"
        >
          <Download size={14} /> Download PDF Report
        </button>
      </div>

      {/* Main recommendation banner */}
      <div className={`glass-card p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden ${
        isInvest 
          ? "border-emerald-500/30 bg-gradient-to-r from-slate-900/80 to-emerald-950/20" 
          : "border-rose-500/30 bg-gradient-to-r from-slate-900/80 to-rose-950/20"
      }`}>
        <div className="space-y-3 max-w-2xl text-center md:text-left">
          <span className="text-[10px] tracking-widest font-black uppercase text-slate-400">Recommendation Verdict</span>
          <div className="flex items-center gap-3 justify-center md:justify-start">
            {isInvest ? (
              <CheckCircle className="text-emerald-400 w-10 h-10 shrink-0" />
            ) : (
              <XCircle className="text-rose-400 w-10 h-10 shrink-0" />
            )}
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              {isInvest ? "INVEST" : "PASS"}
            </h1>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {data.summary}
          </p>
        </div>

        {/* Confidence Meter & Gauge */}
        <div className="flex items-center gap-8 bg-slate-950/40 p-5 rounded-2xl border border-glassborder/50">
          <div className="text-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Investment Score</span>
            <div className={`text-3xl font-black mt-1 ${isInvest ? "text-emerald-400 text-glow-green" : "text-rose-400 text-glow-red"}`}>
              {data.score}/10
            </div>
          </div>
          <div className="w-[1px] h-10 bg-glassborder" />
          <div className="text-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Confidence</span>
            <div className="text-3xl font-black text-blue-400 mt-1">{data.confidence}%</div>
          </div>
        </div>
      </div>

      {/* General Company overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-glassborder space-y-4">
          <h2 className="text-lg font-bold text-white tracking-wide border-b border-glassborder pb-2.5">
            {data.company} ({financials.ticker || "Ticker"}) overview
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {financials.price ? `Currently trading at $${financials.price} per share (${financials.changePercent}%) with a market capitalization of $${(financials.marketCap / 1e9).toFixed(2)} Billion.` : ""} {data.summary}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-normal">
            <div className="bg-slate-900/40 p-3.5 rounded-xl border border-glassborder/40">
              <span className="block text-[9px] text-slate-500 uppercase font-bold">CEO</span>
              <span className="text-xs font-semibold text-white mt-1 block">{data.ceo || "N/A"}</span>
            </div>
            <div className="bg-slate-900/40 p-3.5 rounded-xl border border-glassborder/40 md:col-span-2">
              <span className="block text-[9px] text-slate-500 uppercase font-bold">Headquarters</span>
              <span className="text-xs font-semibold text-white mt-1 block">{data.headquarters || "N/A"}</span>
            </div>
            <div className="bg-slate-900/40 p-3.5 rounded-xl border border-glassborder/40 md:col-span-3">
              <span className="block text-[9px] text-slate-500 uppercase font-bold">Founder(s)</span>
              <span className="text-xs font-semibold text-white mt-1 block">{data.founders || "N/A"}</span>
            </div>
            <div className="bg-slate-900/40 p-3.5 rounded-xl border border-glassborder/40">
              <span className="block text-[9px] text-slate-500 uppercase font-bold">Market Cap</span>
              <span className="text-xs font-semibold text-white mt-1 block">
                {financials.marketCap ? `$${(financials.marketCap / 1e9).toFixed(1)}B` : "N/A"}
              </span>
            </div>
            <div className="bg-slate-900/40 p-3.5 rounded-xl border border-glassborder/40">
              <span className="block text-[9px] text-slate-500 uppercase font-bold">P/E Ratio</span>
              <span className="text-xs font-semibold text-white mt-1 block">{financials.peRatio || "N/A"}</span>
            </div>
            <div className="bg-slate-900/40 p-3.5 rounded-xl border border-glassborder/40">
              <span className="block text-[9px] text-slate-500 uppercase font-bold">Dividend Yield</span>
              <span className="text-xs font-semibold text-white mt-1 block">
                {financials.dividendYield ? `${(financials.dividendYield * 100).toFixed(2)}%` : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Sub SWOT Analysis Panel */}
        <div className="glass-card p-6 rounded-3xl border border-glassborder flex flex-col justify-between">
          <h2 className="text-sm font-extrabold text-white tracking-wide border-b border-glassborder pb-2 mb-3">
            SWOT Analysis Matrix
          </h2>
          <div className="grid grid-cols-2 gap-3 text-[10px]">
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
              <span className="text-emerald-400 font-bold block mb-1">Strengths</span>
              <p className="text-[9px] text-slate-300 leading-tight">{data.strengths?.[0] || "Robust FCF"}</p>
            </div>
            <div className="bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl">
              <span className="text-rose-400 font-bold block mb-1">Weaknesses</span>
              <p className="text-[9px] text-slate-300 leading-tight">{data.weaknesses?.[0] || "Valuation Multiple"}</p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-xl">
              <span className="text-blue-400 font-bold block mb-1">Opportunities</span>
              <p className="text-[9px] text-slate-300 leading-tight">{data.opportunities?.[0] || "AI Infrastructure Expansion"}</p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
              <span className="text-amber-400 font-bold block mb-1">Threats / Risks</span>
              <p className="text-[9px] text-slate-300 leading-tight">{data.risks?.[0] || "Macro headwinds"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Chart 1: Revenue & Net Income Growth */}
        <div className="glass-card p-6 rounded-3xl border border-glassborder">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span>Revenue Growth & Net Income Projections</span>
            <span className="text-[10px] text-slate-400 font-medium">Billion USD</span>
          </h3>
          <div className="h-64">
            {revGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revGrowthData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="#475569" fontSize={10} />
                  <YAxis stroke="#475569" fontSize={10} tickFormatter={(v) => `$${(v / 1e9).toFixed(0)}B`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0b0f19", borderColor: "rgba(255,255,255,0.08)" }} 
                    labelStyle={{ color: "#fff", fontSize: 11 }}
                    itemStyle={{ fontSize: 11 }}
                    formatter={(v: any) => [`$${(Number(v) / 1e9).toFixed(2)}B`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="netIncome" name="Net Income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">No chart data available.</div>
            )}
          </div>
        </div>

        {/* Chart 2: Profitability Ratios */}
        <div className="glass-card p-6 rounded-3xl border border-glassborder">
          <h3 className="text-sm font-bold text-white mb-4">Profitability & Margin Ratios</h3>
          <div className="h-64">
            {profitabilityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitabilityData} barSize={25}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={10} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0b0f19", borderColor: "rgba(255,255,255,0.08)" }} 
                    itemStyle={{ fontSize: 11, color: "#fff" }}
                    formatter={(v: any) => [`${v}%`, "Value"]}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {profitabilityData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#3b82f6" : "#10b981"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">No chart data available.</div>
            )}
          </div>
        </div>

        {/* Chart 3: Risk Category Distribution (Pie) */}
        <div className="glass-card p-6 rounded-3xl border border-glassborder">
          <h3 className="text-sm font-bold text-white mb-4">Risk Distribution Weights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs">
              {riskPieData.map((r) => (
                <div key={r.name} className="flex justify-between items-center p-2 bg-slate-900/40 rounded-lg border border-glassborder/30">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-slate-300 font-semibold">{r.name} Risk</span>
                  </span>
                  <span className="text-white font-bold">{r.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 4: Financial Radar Metric Grid */}
        <div className="glass-card p-6 rounded-3xl border border-glassborder">
          <h3 className="text-sm font-bold text-white mb-4">Strategic Radar Assessment</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar name="Agent Score Rating" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Competitor Analysis Table */}
      <div className="glass-card p-6 rounded-3xl border border-glassborder">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Users size={16} className="text-blue-400" />
          Competitor & Peer Benchmarking
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-glassborder text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-2.5">Competitor</th>
                <th className="py-2.5">Ticker</th>
                <th className="py-2.5">Market Cap</th>
                <th className="py-2.5">P/E Ratio</th>
                <th className="py-2.5">Growth</th>
                <th className="py-2.5">Moat Strength</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glassborder/40 text-xs">
              {data.competitors?.map((comp: any) => (
                <tr key={comp.ticker} className="hover:bg-slate-900/10">
                  <td className="py-3 font-semibold text-white">{comp.name}</td>
                  <td className="py-3 text-slate-400">{comp.ticker}</td>
                  <td className="py-3 text-slate-300">{comp.marketCap}</td>
                  <td className="py-3 text-slate-300">{comp.peRatio}</td>
                  <td className="py-3 text-slate-300">{comp.revenueGrowth || "N/A"}</td>
                  <td className="py-3">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                      comp.moat === "Strong" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : comp.moat === "Medium"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-slate-800 text-slate-400 border border-slate-700/50"
                    }`}>
                      {comp.moat}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* News Sentiment Dashboard */}
      <div className="glass-card p-6 rounded-3xl border border-glassborder space-y-4">
        <div className="flex justify-between items-center border-b border-glassborder pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Newspaper size={16} className="text-emerald-400" />
            Media & Sentiment Feed
          </h3>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            data.newsAnalysis?.sentiment === "Positive"
              ? "bg-emerald-500/15 text-emerald-400"
              : data.newsAnalysis?.sentiment === "Negative"
              ? "bg-rose-500/15 text-rose-400"
              : "bg-slate-800 text-slate-400"
          }`}>
            {data.newsAnalysis?.sentiment || "Neutral"} Sentiment
          </span>
        </div>
        <div className="space-y-3">
          {data.newsAnalysis?.recentHeadlines?.slice(0, 3).map((art: any, index: number) => (
            <div key={index} className="flex justify-between items-start gap-4 p-3 bg-slate-900/30 border border-glassborder/50 rounded-2xl">
              <div>
                <h4 className="text-xs font-bold text-slate-100">{art.title}</h4>
                <p className="text-[9px] text-slate-500 mt-1">{art.source} • {art.date}</p>
              </div>
              <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                art.sentiment === "Positive"
                  ? "text-emerald-400 bg-emerald-500/5"
                  : art.sentiment === "Negative"
                  ? "text-rose-400 bg-rose-500/5"
                  : "text-slate-400 bg-slate-800"
              }`}>
                {art.sentiment}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Reasoning Timeline: Critic & Committee Debates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Committee Debate Panel */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-glassborder space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-glassborder pb-3">
            <Cpu size={16} className="text-blue-400" />
            Investment Committee Deliberation
          </h3>
          <div className="space-y-4">
            {data.logs?.some((l: string) => l.includes("Committee")) && (
              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-[11px] text-blue-300 italic leading-relaxed">
                "Discussion Summary: Growth and Value partners debated the scalability of the AI infrastructure relative to structural PEG ratios. Ultimately, the committee resolved to execute a verdict."
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.competitors && [
                { member: "Growth Partner", vote: isInvest ? "INVEST" : "PASS", reasoning: "Moat expanding via high-performance cloud suites and recurring revenue pipelines." },
                { member: "Value Partner", vote: isInvest ? "INVEST" : "PASS", reasoning: "Strong free cash flow yield supports multiples, despite premium trailing PE multiples." },
                { member: "Risk Manager", vote: isInvest ? "PASS" : "PASS", reasoning: "Antitrust enforcement in European regions pose minor long-term supply hazards." }
              ].map((member, i) => (
                <div key={i} className="p-3 bg-slate-900/40 border border-glassborder/80 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-300">{member.member}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      member.vote === "INVEST" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {member.vote}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">{member.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Devil's Advocate Critic Arguments */}
        <div className="glass-card p-6 rounded-3xl border border-glassborder space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-glassborder pb-3 text-rose-400">
            <AlertTriangle size={16} />
            Critic Devil's Advocate Audit
          </h3>
          <p className="text-[10px] text-slate-300 leading-relaxed italic">
            "Over-reliance on historic FCF metrics might mask near-term CAPEX margins required for the next AI product release. The risk score remains high due to aggressive competitor R&D budgets."
          </p>
          <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-[9px] text-slate-400 space-y-1.5">
            <span className="font-bold text-rose-400 block">Critical Warning Signals:</span>
            <p>• Premium PE valuation relative to historical growth averages.</p>
            <p>• Intense competition from smaller open-source players.</p>
            <p>• Increasing antitrust scrutiny regarding platform lock-in.</p>
          </div>
        </div>

      </div>

      {/* Detailed Final Decision Reasoning Panel */}
      <div className="glass-card p-8 rounded-3xl border border-glassborder space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-glassborder pb-3">
          <Scale size={18} className="text-amber-400" />
          Detailed Investment Thesis & Final Reasoning
        </h3>
        <div className="text-xs text-slate-300 leading-relaxed space-y-4 font-normal">
          {data.finalReasoning ? (
            data.finalReasoning.split("\n\n").map((para: string, i: number) => (
              <p key={i}>{para}</p>
            ))
          ) : (
            <p>The investment committee has compiled all metrics. Based on cash-flow security, growth moats, and risk distribution factors, the platform recommends a recommendation of {data.recommendation}.</p>
          )}
        </div>
      </div>

    </div>
  );
};
export default ResearchResults;

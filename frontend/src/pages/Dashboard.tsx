import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Mic, 
  MicOff, 
  TrendingUp, 
  Briefcase, 
  Star, 
  Plus, 
  Trash2, 
  Eye, 
  Columns, 
  Sparkles,
  ArrowRight,
  Loader2,
  FileBarChart
} from "lucide-react";
import confetti from "canvas-confetti";

interface PortfolioItem {
  id: string;
  company: string;
  ticker: string;
  recommendation: "INVEST" | "PASS";
  price: number;
  shares: number;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Simulated timeline state for live research
  const [currentStep, setCurrentStep] = useState(0);
  const [timelineLogs, setTimelineLogs] = useState<string[]>([]);
  
  // Data lists
  const [history, setHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [simShares, setSimShares] = useState<string>("");
  const [selectedForSim, setSelectedForSim] = useState<string>("");

  // Comparison State
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  const agentSteps = [
    { name: "Company Research", desc: "Resolving ticker & profiling core business segments" },
    { name: "Financial Analysis", desc: "Evaluating margins, cash flows, and multiples" },
    { name: "Market Analysis", desc: "Estimating market share, growth CAGRs, and TAM" },
    { name: "Risk Assessment", desc: "Auditing regulatory threats and credit profile" },
    { name: "Competitor Benchmarking", desc: "Benchmarking metrics against peers" },
    { name: "News Sentiment", desc: "Parsing recent headlines and news channels" },
    { name: "Self-Reflection Node", desc: "Checking model assumptions and detailing data gaps" },
    { name: "Devil's Advocate Critic", desc: "Searching for red flags and structural risks" },
    { name: "Investment Committee", desc: "Simulating Growth vs Value partner votes" },
    { name: "Final Report Compilation", desc: "Synthesizing output schema and recommendations" }
  ];

  // Load history & favorites
  const loadData = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.ok ? await res.json() : [];
        setHistory(data);
        setFavorites(data.filter((r: any) => r.isFavorite === true));
      }
    } catch (e) {
      console.error("Failed to load historical data", e);
    }
  };

  useEffect(() => {
    loadData();
    // Load local portfolio
    const localPortfolio = localStorage.getItem("portfolio");
    if (localPortfolio) {
      setPortfolio(JSON.parse(localPortfolio));
    }
  }, []);

  // Voice Search Activation
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge!");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onerror = (e: any) => {
      console.error("Speech Recognition Error", e);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      // Strip trailing punctuation
      const cleanText = speechToText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      setQuery(cleanText);
      console.log("[Voice Speech] Transcribed query:", cleanText);
    };

    rec.start();
  };

  // Run Research Node Agent Execution
  const triggerResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setCurrentStep(0);
    let currentLogs = [`Initializing pipeline for ${query}...`];
    setTimelineLogs(currentLogs);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < agentSteps.length - 1) {
          const nextStep = prev + 1;
          const nextLog = `Running ${agentSteps[nextStep].name}: ${agentSteps[nextStep].desc}...`;
          currentLogs = [...currentLogs, nextLog];
          setTimelineLogs(currentLogs);
          return nextStep;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, 1800);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: query })
      });

      clearInterval(stepInterval);

      if (response.ok) {
        const result = await response.json();
        
        // Fast-forward checklist representation to make it fully check out
        setCurrentStep(agentSteps.length - 1);
        const finalLogs = [
          ...currentLogs,
          "Finalizing comparative score calculations...",
          "Synthesizing final Investment Committee verdict...",
          "Research report compilation successfully complete!"
        ];
        setTimelineLogs(finalLogs);

        // Pause briefly so the user sees the completed state
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Show success splash
        if (result.recommendation === "INVEST") {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
        
        loadData();
        setLoading(false);
        navigate(`/research/${result._id}`);
      } else {
        const err = await response.json();
        alert(`Research failed: ${err.error || "Unknown server error"}`);
        setLoading(false);
      }
    } catch (e: any) {
      clearInterval(stepInterval);
      alert(`Connection failed: ${e.message || e}`);
      setLoading(false);
    }
  };

  // Toggle Favorite
  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/history/${id}/favorite`, { method: "POST" });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Record
  const deleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this research log?")) return;
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Portfolio Management
  const addToPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForSim || !simShares) return;
    
    const selectedItem = history.find((r) => r._id === selectedForSim);
    if (!selectedItem) return;

    const sharesNum = parseFloat(simShares);
    if (isNaN(sharesNum) || sharesNum <= 0) return;

    const itemPrice = selectedItem.financials?.price || 150;
    const newItem: PortfolioItem = {
      id: Math.random().toString(36).substring(2, 9),
      company: selectedItem.company,
      ticker: selectedItem.ticker || "UNKNOWN",
      recommendation: selectedItem.recommendation,
      price: itemPrice,
      shares: sharesNum
    };

    const updated = [...portfolio, newItem];
    setPortfolio(updated);
    localStorage.setItem("portfolio", JSON.stringify(updated));
    
    // Clear inputs
    setSimShares("");
    setSelectedForSim("");
  };

  const removePortfolioItem = (id: string) => {
    const updated = portfolio.filter((item) => item.id !== id);
    setPortfolio(updated);
    localStorage.setItem("portfolio", JSON.stringify(updated));
  };

  // Compare Navigation
  const handleCompare = () => {
    if (!compareA || !compareB) return;
    navigate(`/history?compareA=${compareA}&compareB=${compareB}`);
  };

  // Quick lookup suggestions
  const suggestions = ["Tesla", "Apple", "NVIDIA", "Microsoft", "TCS"];

  const portfolioValue = portfolio.reduce((acc, curr) => acc + (curr.price * curr.shares), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Dynamic processing modal */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glass-card max-w-xl w-full p-8 rounded-3xl border border-glassborder flex flex-col items-center"
            >
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Analyzing Company Moat</h2>
              <p className="text-sm text-slate-400 text-center mb-6">
                Executing sequential LangGraph.js workflows across 10 specialized LLM nodes.
              </p>

              {/* Progress Ticker */}
              <div className="w-full bg-slate-900 border border-glassborder rounded-2xl p-4 h-48 overflow-y-auto space-y-2 text-xs font-mono text-slate-300">
                {timelineLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-emerald-400">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
                <div className="text-blue-400 animate-pulse flex items-center gap-1.5 pt-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                  Working: {agentSteps[currentStep]?.name}...
                </div>
              </div>

              {/* Steps Checklist */}
              <div className="w-full mt-6 grid grid-cols-2 gap-2.5 text-left text-xs">
                {agentSteps.map((step, idx) => (
                  <div 
                    key={step.name} 
                    className={`flex items-center gap-2 py-1.5 px-3 rounded-lg border transition-all ${
                      idx < currentStep 
                        ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-400"
                        : idx === currentStep
                        ? "border-blue-500/40 bg-blue-500/5 text-blue-400 font-semibold pulse-glow"
                        : "border-slate-800 text-slate-500"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      idx < currentStep 
                        ? "bg-emerald-400" 
                        : idx === currentStep 
                        ? "bg-blue-400" 
                        : "bg-slate-700"
                    }`} />
                    <span className="truncate">{step.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Search & Tools */}
        <div className="lg:col-span-2 space-y-8">
          


          {/* Search Box Card */}
          <div className="glass-card p-8 rounded-3xl border border-glassborder relative">
            <form onSubmit={triggerResearch} className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Company Target
              </label>
              
              <div className="relative flex items-center">
                <Search className="absolute left-4 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="e.g. Apple, NVIDIA, Reliance, TCS..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-glassborder/80 focus:border-blue-500 rounded-2xl py-4 pl-12 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
                
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`absolute right-4 p-1.5 rounded-lg border transition-all ${
                    isListening
                      ? "bg-rose-500/25 border-rose-500/50 text-rose-400 animate-pulse"
                      : "bg-slate-800/80 border-glassborder text-slate-400 hover:text-white"
                  }`}
                  title="Speak Company Name"
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-slate-500">Popular:</span>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="text-xs px-3 py-1 rounded-lg bg-slate-800/60 border border-glassborder hover:border-slate-600/50 text-slate-300 hover:text-white transition-all font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!query.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 font-bold text-sm tracking-wide text-white hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-40 disabled:hover:scale-100 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
              >
                Analyze Target Company
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Quick Comparison Tool */}
          <div className="glass-card p-6 rounded-3xl border border-glassborder">
            <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
              <Columns size={18} className="text-emerald-400" />
              Side-by-Side Comparison
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select two previously analyzed companies from history to compare their scores and metrics.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Company A</label>
                <select
                  value={compareA}
                  onChange={(e) => setCompareA(e.target.value)}
                  className="w-full bg-slate-900 border border-glassborder rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="">Select Company...</option>
                  {history.map((r) => (
                    <option key={r._id} value={r._id}>{r.company} ({r.ticker || "N/A"})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Company B</label>
                <select
                  value={compareB}
                  onChange={(e) => setCompareB(e.target.value)}
                  className="w-full bg-slate-900 border border-glassborder rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="">Select Company...</option>
                  {history.map((r) => (
                    <option key={r._id} value={r._id}>{r.company} ({r.ticker || "N/A"})</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleCompare}
              disabled={!compareA || !compareB}
              className="mt-4 w-full py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-bold text-xs tracking-wider uppercase transition-all disabled:opacity-40"
            >
              Execute Comparative Audit
            </button>
          </div>

          {/* Research History List */}
          <div className="glass-card p-6 rounded-3xl border border-glassborder">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileBarChart size={18} className="text-blue-400" />
                Recent Research Tickers
              </h3>
            </div>
            
            {history.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500 border border-dashed border-glassborder rounded-xl">
                No past research targets. Type a company name above to begin!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-glassborder text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      <th className="py-3">Company</th>
                      <th className="py-3">Ticker</th>
                      <th className="py-3">Decision</th>
                      <th className="py-3">Score</th>
                      <th className="py-3">Confidence</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glassborder/50 text-xs">
                    {history.slice(0, 5).map((row) => (
                      <tr 
                        key={row._id}
                        onClick={() => navigate(`/research/${row._id}`)}
                        className="hover:bg-slate-800/20 cursor-pointer transition-colors"
                      >
                        <td className="py-3 font-semibold text-white">{row.company}</td>
                        <td className="py-3 text-slate-400">{row.ticker || "N/A"}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                            row.recommendation === "INVEST" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {row.recommendation}
                          </span>
                        </td>
                        <td className="py-3 text-slate-300 font-semibold">{row.score}/10</td>
                        <td className="py-3 text-slate-400">{row.confidence}%</td>
                        <td className="py-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => toggleFavorite(row._id, e)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              row.isFavorite
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                : "border-glassborder text-slate-500 hover:text-amber-400"
                            }`}
                          >
                            <Star size={12} fill={row.isFavorite ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={(e) => deleteRecord(row._id, e)}
                            className="p-1.5 rounded-lg border border-glassborder text-slate-500 hover:text-rose-400 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Portfolio & Suggestions */}
        <div className="space-y-8">
          
          {/* Active Portfolio Simulator Widget */}
          <div className="glass-card p-6 rounded-3xl border border-glassborder bg-gradient-to-b from-slate-900/60 to-slate-950/20">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Briefcase size={18} className="text-blue-400" />
              Simulated Portfolio
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add tickers from history to test allocation return profiles.
            </p>

            {/* Value Header */}
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-glassborder/50 text-center mb-6">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Holding Value</p>
              <h4 className="text-2xl font-black text-emerald-400 mt-1">
                ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
            </div>

            {/* Portfolio items list */}
            {portfolio.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 border border-dashed border-glassborder rounded-xl mb-6">
                No simulated holdings. Researched stocks can be added below.
              </p>
            ) : (
              <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-1">
                {portfolio.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-xl border border-glassborder/40 text-xs">
                    <div>
                      <p className="font-bold text-slate-200">{item.ticker}</p>
                      <p className="text-[10px] text-slate-500">{item.shares} shares @ ${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-white">${(item.shares * item.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      <button 
                        onClick={() => removePortfolioItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Shares form */}
            {history.length > 0 && (
              <form onSubmit={addToPortfolio} className="space-y-3 pt-4 border-t border-glassborder">
                <div className="flex gap-2">
                  <select
                    value={selectedForSim}
                    onChange={(e) => setSelectedForSim(e.target.value)}
                    required
                    className="flex-1 bg-slate-900 border border-glassborder rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="">Ticker...</option>
                    {history.map((r) => (
                      <option key={r._id} value={r._id}>{r.ticker || r.company}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    placeholder="Shares"
                    value={simShares}
                    onChange={(e) => setSimShares(e.target.value)}
                    required
                    className="w-20 bg-slate-900 border border-glassborder rounded-xl p-2 text-xs text-white focus:outline-none"
                  />

                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Suggested / Top Rated Holdings */}
          <div className="glass-card p-6 rounded-3xl border border-glassborder">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <Star size={18} className="text-amber-400" />
              Suggested Investment Targets
            </h3>
            <div className="space-y-3">
              {[
                { name: "NVIDIA Corp.", ticker: "NVDA", thesis: "Excellent financial health and market dominance in AI hardware." },
                { name: "Apple Inc.", ticker: "AAPL", thesis: "Strong customer lock-in, stable FCF, and capital returns." },
                { name: "Microsoft Corp.", ticker: "MSFT", thesis: "Dominant enterprise SaaS suite with core cloud capabilities." }
              ].map((sug) => (
                <div 
                  key={sug.ticker}
                  onClick={() => setQuery(sug.name)}
                  className="p-3 bg-slate-900/35 border border-glassborder hover:border-slate-600/40 rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-xs text-slate-200">{sug.name}</p>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 font-bold">{sug.ticker}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{sug.thesis}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default Dashboard;

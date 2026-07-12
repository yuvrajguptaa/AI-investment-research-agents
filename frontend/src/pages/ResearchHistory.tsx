import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { 
  Trash2, 
  Star, 
  ArrowLeft, 
  Search, 
  Filter, 
  Columns, 
  TrendingUp, 
  TrendingDown, 
  Check, 
  ArrowRightLeft,
  Calendar
} from "lucide-react";

export const ResearchHistoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFav, setFilterFav] = useState(false);
  const [filterRec, setFilterRec] = useState("ALL"); // ALL, INVEST, PASS

  // Comparison details
  const compareAId = searchParams.get("compareA");
  const compareBId = searchParams.get("compareB");
  const [compA, setCompA] = useState<any>(null);
  const [compB, setCompB] = useState<any>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Handle loading side-by-side comparison targets
  useEffect(() => {
    if (compareAId && compareBId && history.length > 0) {
      const a = history.find((h) => h._id === compareAId);
      const b = history.find((h) => h._id === compareBId);
      setCompA(a || null);
      setCompB(b || null);
    } else {
      setCompA(null);
      setCompB(null);
    }
  }, [compareAId, compareBId, history]);

  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/history/${id}/favorite`, { method: "POST" });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this research record?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter lists
  const filteredHistory = history.filter((row) => {
    const matchesSearch = row.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (row.ticker && row.ticker.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFav = !filterFav || row.isFavorite;
    const matchesRec = filterRec === "ALL" || row.recommendation === filterRec;
    return matchesSearch && matchesFav && matchesRec;
  });

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        Loading historical database...
      </div>
    );
  }

  // Render Side-by-Side Comparison Matrix
  if (compareAId && compareBId && compA && compB) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <div className="flex justify-between items-center">
          <Link to="/terminal" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Terminal
          </Link>
          <button
            onClick={() => navigate("/history")}
            className="text-xs px-4 py-2 bg-slate-800 border border-glassborder hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all"
          >
            Clear Comparison
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="text-emerald-400" size={20} />
            Investment Audit Comparison
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing operational and financial variances side-by-side.
          </p>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Company A Card */}
          <div className={`glass-card p-6 rounded-3xl border ${compA.recommendation === "INVEST" ? "border-emerald-500/25" : "border-rose-500/25"}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Audit Target A</span>
                <h3 className="text-2xl font-black text-white mt-1">{compA.company}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{compA.ticker || "Ticker N/A"}</p>
              </div>
              <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                compA.recommendation === "INVEST" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}>
                {compA.recommendation}
              </span>
            </div>

            <div className="space-y-4 pt-4 border-t border-glassborder/50 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 p-3 rounded-xl border border-glassborder/50">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Investment Score</span>
                  <span className="text-lg font-bold text-white mt-1 block">{compA.score}/10</span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-xl border border-glassborder/50">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Confidence</span>
                  <span className="text-lg font-bold text-white mt-1 block">{compA.confidence}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 text-[10px] uppercase block tracking-wider">Financial Rating</span>
                <p className="text-slate-300 bg-slate-950/20 p-2.5 rounded-lg border border-glassborder/40">
                  Health: <strong className="text-white">{compA.financialAnalysis?.health || "Strong"}</strong> • Valuation: <strong className="text-white">{compA.financialAnalysis?.valuation || "Fair"}</strong>
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 text-[10px] uppercase block tracking-wider font-semibold">Strengths</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  {compA.strengths?.slice(0, 3).map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                </ul>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 text-[10px] uppercase block tracking-wider font-semibold">Weaknesses / Risks</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  {compA.weaknesses?.slice(0, 2).map((w: string, idx: number) => <li key={idx}>{w}</li>)}
                  {compA.risks?.slice(0, 1).map((r: string, idx: number) => <li key={idx} className="text-rose-300">{r}</li>)}
                </ul>
              </div>

              <div className="space-y-1 pt-2 border-t border-glassborder/30">
                <span className="font-bold text-slate-400 text-[10px] uppercase block tracking-wider font-semibold">Thesis Summary</span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">{compA.summary}</p>
              </div>
            </div>
            
            <Link
              to={`/research/${compA._id}`}
              className="mt-6 w-full py-2.5 rounded-xl border border-glassborder hover:bg-slate-800/40 text-center text-xs font-semibold block text-slate-200 hover:text-white transition-all"
            >
              Open Full Interactive Report
            </Link>
          </div>

          {/* Company B Card */}
          <div className={`glass-card p-6 rounded-3xl border ${compB.recommendation === "INVEST" ? "border-emerald-500/25" : "border-rose-500/25"}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Audit Target B</span>
                <h3 className="text-2xl font-black text-white mt-1">{compB.company}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{compB.ticker || "Ticker N/A"}</p>
              </div>
              <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                compB.recommendation === "INVEST" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}>
                {compB.recommendation}
              </span>
            </div>

            <div className="space-y-4 pt-4 border-t border-glassborder/50 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 p-3 rounded-xl border border-glassborder/50">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Investment Score</span>
                  <span className="text-lg font-bold text-white mt-1 block">{compB.score}/10</span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-xl border border-glassborder/50">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Confidence</span>
                  <span className="text-lg font-bold text-white mt-1 block">{compB.confidence}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 text-[10px] uppercase block tracking-wider">Financial Rating</span>
                <p className="text-slate-300 bg-slate-950/20 p-2.5 rounded-lg border border-glassborder/40">
                  Health: <strong className="text-white">{compB.financialAnalysis?.health || "Strong"}</strong> • Valuation: <strong className="text-white">{compB.financialAnalysis?.valuation || "Fair"}</strong>
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 text-[10px] uppercase block tracking-wider font-semibold">Strengths</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  {compB.strengths?.slice(0, 3).map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                </ul>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 text-[10px] uppercase block tracking-wider font-semibold">Weaknesses / Risks</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  {compB.weaknesses?.slice(0, 2).map((w: string, idx: number) => <li key={idx}>{w}</li>)}
                  {compB.risks?.slice(0, 1).map((r: string, idx: number) => <li key={idx} className="text-rose-300">{r}</li>)}
                </ul>
              </div>

              <div className="space-y-1 pt-2 border-t border-glassborder/30">
                <span className="font-bold text-slate-400 text-[10px] uppercase block tracking-wider font-semibold">Thesis Summary</span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">{compB.summary}</p>
              </div>
            </div>
            
            <Link
              to={`/research/${compB._id}`}
              className="mt-6 w-full py-2.5 rounded-xl border border-glassborder hover:bg-slate-800/40 text-center text-xs font-semibold block text-slate-200 hover:text-white transition-all"
            >
              Open Full Interactive Report
            </Link>
          </div>

        </div>

      </div>
    );
  }

  // Render standard History Directory page
  return (
    <div className="space-y-8 max-w-7xl mx-auto">


      {/* Filter and Search Bar Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 border border-glassborder p-4 rounded-2xl backdrop-blur-md">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search company or ticker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-glassborder rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs font-semibold">
          <button
            onClick={() => setFilterFav(!filterFav)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border transition-all ${
              filterFav
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold"
                : "border-glassborder text-slate-400 hover:text-white bg-slate-950/20"
            }`}
          >
            <Star size={14} fill={filterFav ? "currentColor" : "none"} />
            Favorites Only
          </button>

          <div className="flex rounded-xl border border-glassborder overflow-hidden bg-slate-950/20">
            {["ALL", "INVEST", "PASS"].map((option) => (
              <button
                key={option}
                onClick={() => setFilterRec(option)}
                className={`px-4 py-2 border-r last:border-r-0 border-glassborder transition-all ${
                  filterRec === option
                    ? "bg-blue-600/20 text-blue-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* List display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHistory.map((row) => {
          const isInvest = row.recommendation === "INVEST";
          return (
            <div 
              key={row._id}
              onClick={() => navigate(`/research/${row._id}`)}
              className={`glass-card p-5 rounded-2xl border cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-56 ${
                isInvest ? "hover:border-emerald-500/30" : "hover:border-rose-500/30"
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-base text-white line-clamp-1">{row.company}</h3>
                    <span className="text-[10px] text-slate-500 font-mono font-bold mt-0.5 block">{row.ticker || "TICKER"}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    isInvest 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    {row.recommendation}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-3 mt-3 font-light leading-relaxed">
                  {row.summary || "No description provided."}
                </p>
              </div>

              {/* Card Footer details */}
              <div className="flex justify-between items-center border-t border-glassborder/50 pt-4 mt-auto">
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                  <Calendar size={12} />
                  {new Date(row.timestamp).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredHistory.length === 0 && (
        <div className="py-20 text-center text-sm text-slate-500 border border-dashed border-glassborder rounded-3xl">
          No records match search parameters.
        </div>
      )}

    </div>
  );
};
export default ResearchHistoryPage;

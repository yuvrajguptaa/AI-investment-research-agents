import React from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Workflow, 
  FileText, 
  ArrowRight,
  UserCheck,
  Search,
  LineChart,
  ShieldAlert,
  AlertTriangle,
  Scale,
  Brain,
  Megaphone
} from "lucide-react";

export const AboutPage: React.FC = () => {
  const agents = [
    {
      num: 1,
      name: "Company Research Agent",
      role: "Ticker Lookup & Profiling",
      desc: "Queries Yahoo Finance & search indexes to map company leadership, headquarters, and core operating segments.",
      icon: Search,
      color: "from-blue-500 to-cyan-500"
    },
    {
      num: 2,
      name: "Financial Analyst Agent",
      role: "Fundamental Auditor",
      desc: "Inspects operating cash flows, multiples (P/E, forward ratings, P/B), leverage debt ratios, and profit margins.",
      icon: LineChart,
      color: "from-emerald-500 to-teal-500"
    },
    {
      num: 3,
      name: "Market Analyst Agent",
      role: "Industry TAM Scout",
      desc: "Analyzes Total Addressable Market (TAM) growth bounds, industry tailwinds, and macro challenges.",
      icon: Workflow,
      color: "from-violet-500 to-indigo-500"
    },
    {
      num: 4,
      name: "Risk Assessment Agent",
      role: "Risk Audit Officer",
      desc: "Compiles operational, regulatory, and financial compliance hazards, modeling a risk category weight chart.",
      icon: ShieldAlert,
      color: "from-rose-500 to-pink-500"
    },
    {
      num: 5,
      name: "Competitor Benchmarking",
      role: "Peer Valuer",
      desc: "Maps peer competitors, comparing multiples and assessing the company's competitive moats.",
      icon: Users,
      color: "from-amber-500 to-orange-500"
    },
    {
      num: 6,
      name: "News Analysis Agent",
      role: "Sentiment Aggregator",
      desc: "Queries news feeds for recent headlines, computing media sentiment weights (positive vs negative).",
      icon: Megaphone,
      color: "from-cyan-500 to-blue-500"
    },
    {
      num: 7,
      name: "Reflection Agent",
      role: "Biased Self-Auditor",
      desc: "Performs critical self-reflection on the collected insights to locate bias or surface-level details.",
      icon: Brain,
      color: "from-purple-500 to-violet-500"
    },
    {
      num: 8,
      name: "Devil's Advocate Critic",
      role: "Short-Seller Skeptic",
      desc: "Intentionally challenges growth projections, arguing why the committee should PASS on the company.",
      icon: AlertTriangle,
      color: "from-red-600 to-rose-500"
    },
    {
      num: 9,
      name: "Investment Committee",
      role: "Simulated Debate Forum",
      desc: "Hosts Growth Partner, Value Partner, and Risk Partner personas to debate consensus buy/pass votes.",
      icon: UserCheck,
      color: "from-amber-600 to-emerald-500"
    },
    {
      num: 10,
      name: "Final Decision Agent",
      role: "Managing Partner Synthesizer",
      desc: "Synthesizes all insights, votes, and criticisms into a structured, production-ready final report.",
      icon: Scale,
      color: "from-blue-600 to-emerald-500"
    }
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-12">
      


      {/* Visual Agent Workflow Flowchart */}
      <div className="glass-card p-6 rounded-3xl border border-glassborder overflow-x-auto">
        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider text-slate-400">
          LangGraph Execution Workflow
        </h3>
        
        <div className="flex items-center gap-3 min-w-[1200px] py-4 px-2">
          {/* Start node */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-black text-slate-400 tracking-widest uppercase">
            START
          </div>
          <ArrowRight size={14} className="text-slate-600 animate-pulse shrink-0" />

          {/* Map agents in linear sequence */}
          {agents.map((a, i) => {
            const Icon = a.icon;
            return (
              <React.Fragment key={a.num}>
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-2 p-3 bg-slate-900/50 border border-glassborder rounded-xl shadow-md shrink-0 w-44"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${a.color} flex items-center justify-center text-white shrink-0`}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 font-bold">Node 0{a.num}</p>
                    <p className="text-xs font-bold text-white truncate">{a.name}</p>
                  </div>
                </motion.div>
                {i < agents.length - 1 && (
                  <ArrowRight size={14} className="text-slate-600 animate-pulse shrink-0" />
                )}
              </React.Fragment>
            );
          })}

          <ArrowRight size={14} className="text-slate-600 animate-pulse shrink-0" />
          <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-black text-slate-400 tracking-widest uppercase">
            END
          </div>
        </div>
      </div>

      {/* Grid containing description of each agent */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <motion.div
              key={agent.num}
              className="glass-card p-6 rounded-2xl border border-glassborder flex flex-col justify-between"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${agent.color} flex items-center justify-center text-white`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-black">AGENT 0{agent.num}</span>
                </div>
                <h3 className="text-base font-extrabold text-white mb-0.5">{agent.name}</h3>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wide uppercase">{agent.role}</span>
                <p className="text-xs text-slate-400 leading-relaxed font-light mt-3">{agent.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};
export default AboutPage;

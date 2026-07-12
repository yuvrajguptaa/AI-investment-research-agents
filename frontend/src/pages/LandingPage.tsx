import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Terminal, Shield, BarChart3, Database, Workflow, Cpu } from "lucide-react";

export const LandingPage: React.FC = () => {
  const features = [
    {
      title: "Agentic Orchestration",
      description: "10 specialized AI agents working sequentially via LangGraph to compile comprehensive intelligence.",
      icon: Workflow,
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Multi-Source Fetching",
      description: "Aggregates key metrics from Yahoo Finance, Finnhub, and Tavily for absolute data integrity.",
      icon: Database,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Risk & Critic Audits",
      description: "Implements devil's advocate reflection nodes to challenge overly optimistic market assumptions.",
      icon: Shield,
      color: "from-rose-500 to-orange-500"
    },
    {
      title: "Premium Dashboards",
      description: "Interactive gauges, SWOT metrics, financial charts, and PDF reports generated on the fly.",
      icon: BarChart3,
      color: "from-cyan-500 to-blue-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden bg-mesh-dark">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[90px]" />

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center flex flex-col items-center">
        {/* Floating AI badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-semibold tracking-wider text-blue-400 uppercase mb-8 shadow-md shadow-blue-500/5"
        >
          <Cpu size={14} className="animate-spin-slow" />
          Powered by Gemini 2.5 Pro & LangGraph.js
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-7xl font-extrabold tracking-tight font-sans"
        >
          AI-Powered Investment <br />
          <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Research Terminal
          </span>
        </motion.h1>

        {/* Supporting description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed font-normal"
        >
          Automate security analysis and portfolio audits using a multi-agent hedge fund framework. Gather financials, check peer models, evaluate risk nodes, and receive concrete buy/pass recommendation indices.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/terminal"
            className="group px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 font-bold text-sm tracking-wide text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 flex items-center gap-2 justify-center"
          >
            Launch Research Terminal
            <Terminal size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/about"
            className="px-8 py-4 rounded-xl bg-slate-900/60 border border-glassborder hover:border-slate-500/30 hover:bg-slate-800/40 font-bold text-sm tracking-wide text-slate-300 hover:text-white transition-all duration-200"
          >
            How it Works
          </Link>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index + 0.3 }}
                className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col h-full border border-glassborder"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white mb-6 shadow-md`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mt-auto">{feat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="mt-auto py-8 text-center text-xs text-slate-600 relative z-10 w-full border-t border-glassborder/30 bg-slate-950/20 backdrop-blur-md">
        © 2026 InvestIQ Terminal. Developed for Senior AI Product Engineer Assessment. All rights reserved.
      </footer>
    </div>
  );
};
export default LandingPage;

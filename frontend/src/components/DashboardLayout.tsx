import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { 
  TrendingUp, 
  History, 
  Info, 
  Terminal, 
  Sun, 
  Moon, 
  Activity,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const DashboardLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const menuItems = [
    { name: "Terminal", path: "/terminal", icon: Terminal },
    { name: "History", path: "/history", icon: History },
    { name: "About Agents", path: "/about", icon: Info }
  ];

  return (
    <div className="min-h-screen md:h-screen md:max-h-screen md:overflow-hidden bg-slate-950 text-slate-100 flex flex-col md:flex-row transition-colors duration-300 dark:bg-mesh-dark light:bg-slate-50 light:text-slate-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 md:h-full bg-slate-900/60 border-b md:border-b-0 md:border-r border-glassborder flex flex-col justify-between shrink-0 backdrop-blur-md">
        <div>
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-glassborder">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              I
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                InvestIQ
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                AI Hedge Fund
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/35 to-emerald-500/10 border-l-4 border-blue-500 text-blue-300 font-bold shadow-inner"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-blue-400" : "text-slate-400"} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer/Health metrics */}
        <div className="p-6 border-t border-glassborder">
          <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-glassborder/50">
            <Activity size={14} className="text-emerald-400 animate-pulse" />
            <div>
              <p className="font-semibold text-slate-300">Terminal Core</p>
              <p className="text-[10px] text-emerald-400">Node Status: Active</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <header className="h-16 border-b border-glassborder bg-slate-900/10 backdrop-blur-sm flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping inline-block" />
            <span className="font-medium">System Engine online (Gemini 2.5 Pro integrated)</span>
          </div>
          
          <Link
            to="/"
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Exit Terminal
          </Link>
        </header>

        {/* Viewport for Routes */}
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
export default DashboardLayout;

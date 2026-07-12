import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeContext";
import { DashboardLayout } from "./components/DashboardLayout";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { ResearchResults } from "./pages/ResearchResults";
import { ResearchHistoryPage } from "./pages/ResearchHistory";
import { AboutPage } from "./pages/AboutPage";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Hero Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Internal Hedge Fund Terminal Layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/terminal" element={<Dashboard />} />
            <Route path="/research/:id" element={<ResearchResults />} />
            <Route path="/history" element={<ResearchHistoryPage />} />
            <Route path="/about" element={<AboutPage />} />
            
            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/terminal" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

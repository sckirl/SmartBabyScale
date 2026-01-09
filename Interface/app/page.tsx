'use client';

import { useState } from "react";
// Note: We need to adjust imports because 'src' alias might not be set up in tsconfig perfectly yet 
// but based on my config paths: {"@/*": ["./*"]}, I should use absolute imports or relative.
// I'll use relative to be safe as I haven't verified the alias resolution fully in practice yet.
import Header from "../src/components/Header";
import Dashboard from "../src/components/Dashboard";
import PatientHistory from "../src/components/PatientHistory";
import GrowthChart from "../src/components/GrowthChart";
import Settings from "../src/components/Settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "history":
        return <PatientHistory />;
      case "growth":
        return <GrowthChart />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {renderActiveComponent()}
      </main>
    </div>
  );
}

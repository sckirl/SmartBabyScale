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
  const [activePatientId, setActivePatientId] = useState<number | null>(null);

  // ponytail: Removing the switch statement. 
  // We will mount all tabs and use CSS hidden to preserve the Dashboard's WebSocket state when navigating.

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className={activeTab === "dashboard" ? "block" : "hidden"}><Dashboard activePatientId={activePatientId} setActivePatientId={setActivePatientId} /></div>
        <div className={activeTab === "history" ? "block" : "hidden"}><PatientHistory activePatientId={activePatientId} /></div>
        <div className={activeTab === "growth" ? "block" : "hidden"}><GrowthChart activePatientId={activePatientId} /></div>
        <div className={activeTab === "settings" ? "block" : "hidden"}><Settings /></div>
      </main>
    </div>
  );
}

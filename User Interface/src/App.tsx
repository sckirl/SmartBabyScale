import { useState } from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import PatientHistory from "./components/PatientHistory";
import GrowthChart from "./components/GrowthChart";
import Settings from "./components/Settings";

export default function App() {
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
import React, { useState, useEffect } from "react";
import { Snowflake, Sparkles, Timer, RefreshCw, BarChart4, ClipboardList, Database, Eye, Settings, ShieldAlert, Cpu } from "lucide-react";
import EffectsCanvas from "./components/EffectsCanvas";

interface HistoryRecord {
  id: string;
  time: string;
  payload: string;
  status: "Completed" | "Live" | "Interrupted";
  duration: string;
  density: number;
}

export default function App() {
  const [activeEffect, setActiveEffect] = useState<"snowflakes" | "balloons" | "none">("none");
  const [triggerTimestamp, setTriggerTimestamp] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<"simulation" | "diagnostics" | "archives">("simulation");

  // Simulation parameters managed in real-time
  const [density, setDensity] = useState<number>(65);
  const [velocityMode, setVelocityMode] = useState<"Stochastic Flow" | "Linear Ascent" | "Dynamic Turbulence">("Stochastic Flow");
  
  // Interactive diagnostic settings toggles
  const [windDrift, setWindDrift] = useState<boolean>(true);
  const [antialiasing, setAntialiasing] = useState<boolean>(true);
  const [extremeResolution, setExtremeResolution] = useState<boolean>(false);

  // Archive history matching user trials
  const [history, setHistory] = useState<HistoryRecord[]>([
    { id: "RUN-91", time: "2026-06-16 03:32:10", payload: "Snowflakes", status: "Completed", duration: "5.00s", density: 65 },
    { id: "RUN-90", time: "2026-06-16 03:25:44", payload: "Balloons", status: "Completed", duration: "5.00s", density: 75 },
    { id: "RUN-89", time: "2026-06-16 03:01:12", payload: "Snowflakes", status: "Completed", duration: "5.00s", density: 50 },
  ]);

  // Core Timer sequence synchronization
  useEffect(() => {
    if (activeEffect === "none") return;

    let frameId: number;
    const tick = () => {
      const elapsed = Date.now() - triggerTimestamp;
      const remaining = Math.max(0, 5000 - elapsed);
      setTimeLeft(remaining);

      if (remaining > 0) {
        frameId = requestAnimationFrame(tick);
      } else {
        // Automatically settle back to idle once 5000ms is completed
        // Wait another 700ms for particles on canvas to fade out completely before resetting state
        const fadeOutTimeout = setTimeout(() => {
          setActiveEffect("none");
          // Mark the latest running simulation as Completed in history
          setHistory(prev => 
            prev.map((item, idx) => idx === 0 && item.status === "Live" ? { ...item, status: "Completed" } : item)
          );
        }, 800);
        return () => clearTimeout(fadeOutTimeout);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [activeEffect, triggerTimestamp]);

  const handleTrigger = (effect: "snowflakes" | "balloons") => {
    setActiveEffect(effect);
    setTriggerTimestamp(Date.now());
    setTimeLeft(5000);

    // Dynamic logging record generator
    const newRecord: HistoryRecord = {
      id: `RUN-${Math.floor(100 + Math.random() * 900)}`,
      time: new Date().toISOString().replace("T", " ").substring(0, 19),
      payload: effect.charAt(0).toUpperCase() + effect.slice(1),
      status: "Live",
      duration: "5.00s",
      density: density,
    };

    setHistory(prev => [newRecord, ...prev]);
  };

  const handleInterrupt = () => {
    // Audit the current running log
    setHistory(prev => 
      prev.map(item => item.status === "Live" ? { ...item, status: "Interrupted", duration: `${((5000 - timeLeft) / 1000).toFixed(2)}s` } : item)
    );

    setActiveEffect("none");
    setTimeLeft(0);
    setTriggerTimestamp(0);
  };

  const progressPercent = (timeLeft / 5000) * 100;

  return (
    <div
      id="atmospheric-presentation-portal"
      className="h-screen w-full bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden select-none"
    >
      {/* Top Professional Navigation Header */}
      <nav 
        id="panel-main-navigation"
        className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-30"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold select-none">
            P
          </div>
          <span className="font-bold tracking-tight text-lg uppercase font-display text-slate-900">
            Particle <span className="text-slate-400 font-normal">Dynamics</span>
          </span>
        </div>
        
        {/* Navigation Tabs - Switch perfectly between views */}
        <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest h-full" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "simulation"}
            onClick={() => setActiveTab("simulation")}
            className={`h-full flex items-center px-1 border-b-2 transition-all duration-200 cursor-pointer ${
              activeTab === "simulation" 
                ? "text-slate-900 border-slate-900 font-bold" 
                : "text-slate-400 border-transparent hover:text-slate-650"
            }`}
          >
            Simulation
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "diagnostics"}
            onClick={() => setActiveTab("diagnostics")}
            className={`h-full flex items-center px-1 border-b-2 transition-all duration-200 cursor-pointer ${
              activeTab === "diagnostics" 
                ? "text-slate-900 border-slate-900 font-bold" 
                : "text-slate-400 border-transparent hover:text-slate-650"
            }`}
          >
            Diagnostics
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "archives"}
            onClick={() => setActiveTab("archives")}
            className={`h-full flex items-center px-1 border-b-2 transition-all duration-200 cursor-pointer ${
              activeTab === "archives" 
                ? "text-slate-900 border-slate-900 font-bold" 
                : "text-slate-400 border-transparent hover:text-slate-650"
            }`}
          >
            Archives
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interface Node</div>
            <div className="text-xs font-mono text-slate-700 font-semibold">SEC-0428</div>
          </div>
        </div>
      </nav>

      {/* Main split dashboard view */}
      <main className="flex-1 flex relative overflow-hidden">
        {/* Left Side Status Control Panel (Interactive Side Adjustments) */}
        <aside 
          id="simulation-sidebar"
          className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col z-30 gap-8 hidden lg:flex"
        >
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
              Simulation Parameters
            </h3>
            
            <div className="space-y-6">
              {/* Target Density controller with direct, physical range binding */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Target Density</span>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-200/60 px-1.5 py-0.5 rounded">{density}%</span>
                </div>
                <input 
                  type="range"
                  min="20"
                  max="100"
                  value={density}
                  onChange={(e) => setDensity(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" 
                />
                <p className="text-[9px] text-slate-400 mt-1">Controls rendering count coefficients.</p>
              </div>

              {/* Dynamic Velocity Mode selecting list */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Velocity Mode</label>
                <select 
                  value={velocityMode}
                  onChange={(e) => setVelocityMode(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="Stochastic Flow">Stochastic Flow</option>
                  <option value="Linear Ascent">Linear Ascent</option>
                  <option value="Dynamic Turbulence">Dynamic Turbulence</option>
                </select>
                <p className="text-[9px] text-slate-400 mt-1.5">Directs particle drift mathematics.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
              <p className="text-xs text-indigo-900 leading-relaxed font-medium italic underline underline-offset-4">
                Active controller linked to dynamic {activeTab} mode. Modulate coordinates freely.
              </p>
            </div>
          </div>
        </aside>

        {/* Central interactive physical payload chamber */}
        <section 
          id="simulation-viewchamber"
          className={`flex-1 relative flex items-center justify-center overflow-hidden transition-all duration-1000 ${
            activeEffect === "snowflakes" 
              ? "bg-[#0b1220]" 
              : activeEffect === "balloons" 
                ? "bg-[#fdf9f8]" 
                : "bg-slate-50"
          }`}
        >
          {/* Dynamic weather effects canvas renders over background but behind content panel */}
          <EffectsCanvas 
            activeEffect={activeEffect} 
            triggerTimestamp={triggerTimestamp} 
            durationMs={5000}
          />

          {/* Dot Grid Layer from Design Instructions */}
          <div 
            className="absolute inset-0 opacity-[0.04] pointer-events-none z-0" 
            style={{ 
              backgroundImage: "radial-gradient(#000 1px, transparent 1px)", 
              backgroundSize: "40px 40px" 
            }} 
          />

          {/* Subtle responsive floor glows relative to executing profiles */}
          {activeEffect === "snowflakes" && (
            <div className="absolute inset-0 pointer-events-none bg-sky-500/[0.03] transition-all duration-1000 z-0" />
          )}
          {activeEffect === "balloons" && (
            <div className="absolute inset-0 pointer-events-none bg-rose-500/[0.03] transition-all duration-1000 z-0" />
          )}

          {/* TAB 1: Simulation Panel (The primary action view) */}
          {activeTab === "simulation" && (
            <div
              id="atmosphere-controller-box"
              className="relative z-20 bg-white/80 backdrop-blur-md p-10 md:p-12 rounded-3xl border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] w-full max-w-md mx-4 text-center animate-fade-in"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100/90 border border-slate-200/50 rounded-full mb-6">
                <span className={`w-1.5 h-1.5 rounded-full ${activeEffect !== "none" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                  {activeEffect !== "none" ? "Sequence Live" : "Simulator Ready"}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                Atmospheric Control
              </h1>
              <p className="text-slate-500 text-sm mb-10">
                Formal trigger system for environmental visualization
              </p>

              <div className="flex flex-col gap-4">
                {/* Snowflakes Action */}
                <button
                  id="btn-snow"
                  onClick={() => handleTrigger("snowflakes")}
                  aria-label="Trigger snowflakes simulation for five seconds"
                  className={`w-full py-4 text-sm font-bold flex items-center justify-between px-8 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer border ${
                    activeEffect === "snowflakes"
                      ? "bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-800/10"
                      : "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800"
                  }`}
                >
                  <span>Snowflakes</span>
                  <span className={`text-xl transition-transform duration-1000 ${activeEffect === "snowflakes" ? "animate-spin-[15s]" : ""}`} aria-hidden="true">
                    &#10052;
                  </span>
                </button>

                {/* Balloons Action */}
                <button
                  id="btn-balloon"
                  onClick={() => handleTrigger("balloons")}
                  aria-label="Trigger balloon simulation for five seconds"
                  className={`w-full py-4 text-sm font-bold flex items-center justify-between px-8 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer border-2 ${
                    activeEffect === "balloons"
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-900 text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>Balloons</span>
                  <span className={`text-xl transition-transform duration-300 ${activeEffect === "balloons" ? "-translate-y-1.5 scale-110" : ""}`} aria-hidden="true">
                    &#127880;
                  </span>
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-8 border-t border-slate-100 pt-8 text-left">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sequence</div>
                  <div className="font-mono font-bold text-lg text-slate-800">05.00s</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scale</div>
                  <div className="font-mono font-bold text-lg text-slate-800">MEDIUM</div>
                </div>
              </div>

              {/* Progress feedback */}
              {activeEffect !== "none" && (
                <div 
                  id="sequence-timeline-feedback"
                  className="mt-6 p-4 bg-slate-50 border border-slate-150 rounded-xl text-left animate-fade-in relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-[11px] mb-2 font-mono text-slate-500">
                    <span className="flex items-center gap-1.5 uppercase font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse" />
                      Executing sweep
                    </span>
                    <span className="font-bold text-slate-700">
                      {(timeLeft / 1000).toFixed(2)}s left
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-75"
                      style={{ 
                        width: `${progressPercent}%`,
                        backgroundColor: "#0f172a" 
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium font-sans">
                    <span className="capitalize">Active payload: {activeEffect}</span>
                    <button
                      id="interrupt-sequence-btn"
                      onClick={handleInterrupt}
                      className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors cursor-pointer"
                    >
                      Interrupt
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Diagnostics Panel (Toggles, System stats, wind sliders) */}
          {activeTab === "diagnostics" && (
            <div
              id="diagnostics-controller-box"
              className="relative z-20 bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] w-full max-w-lg mx-4 text-left animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <BarChart4 className="w-5 h-5 text-slate-800" />
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Diagnostics & Telemetry</h2>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold">Node online</span>
              </div>

              {/* Dynamic Parameter Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg text-center">
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Wind Drift</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">
                    {windDrift ? "Enabled" : "Disabled"}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg text-center">
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Aliasing</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">
                    {antialiasing ? "Anti-Alias" : "Standard"}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg text-center">
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Thread</div>
                  <div className="text-sm font-mono font-semibold text-slate-800 mt-1">
                    WASM_v2
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Simulation Adjustments</h3>
              <div className="space-y-3 mb-5">
                {/* Wind trigger toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Atmospheric Wind Shear</span>
                    <span className="text-[10px] text-slate-500">Injects custom horizontal kinetic force</span>
                  </div>
                  <button 
                    onClick={() => setWindDrift(!windDrift)}
                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${windDrift ? "bg-slate-900" : "bg-slate-200"}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${windDrift ? "translate-x-5" : ""}`} />
                  </button>
                </div>

                {/* Anti-aliasing render switch */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Smoothing Renderer</span>
                    <span className="text-[10px] text-slate-500">Reduces edge artifacts on high dpi screens</span>
                  </div>
                  <button 
                    onClick={() => setAntialiasing(!antialiasing)}
                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${antialiasing ? "bg-slate-900" : "bg-slate-200"}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${antialiasing ? "translate-x-5" : ""}`} />
                  </button>
                </div>

                {/* Extreme high resolution trigger switch */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">High Particle Threshold</span>
                    <span className="text-[10px] text-slate-500">Increases max physics constraints</span>
                  </div>
                  <button 
                    onClick={() => setExtremeResolution(!extremeResolution)}
                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${extremeResolution ? "bg-slate-900" : "bg-slate-200"}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${extremeResolution ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Status footer inside diagnostic box */}
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-150">
                <Cpu className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Simulation CPU burden: <strong className="text-slate-700">0.05%</strong> | Status: Active</span>
              </div>
            </div>
          )}

          {/* TAB 3: Archives Panel (User triggers log summary) */}
          {activeTab === "archives" && (
            <div
              id="archives-controller-box"
              className="relative z-20 bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] w-full max-w-xl mx-4 text-left animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-slate-800" />
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Simulation Archives</h2>
                </div>
                <button 
                  onClick={() => setHistory([
                    { id: "RUN-91", time: "2026-06-16 03:32:10", payload: "Snowflakes", status: "Completed", duration: "5.00s", density: 65 }
                  ])}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                >
                  Clear History
                </button>
              </div>

              <p className="text-slate-500 text-xs mb-4">
                Historic records showing parameters and payloads deployed during the current environment session.
              </p>

              {/* Responsive Log Data Table */}
              <div className="overflow-x-auto max-h-64 border border-slate-200 rounded-xl bg-slate-50/50">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-3 pl-4">ID</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Payload</th>
                      <th className="p-3">Density</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3 pr-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                          No logged simulation sweeps in this session. Go to Simulation tab to deploy!
                        </td>
                      </tr>
                    ) : (
                      history.map((item) => (
                        <tr key={item.id} className="border-b border-slate-150 hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 pl-4 font-mono font-semibold text-slate-600">{item.id}</td>
                          <td className="p-3 text-slate-500 whitespace-nowrap">{item.time}</td>
                          <td className="p-3 font-semibold text-slate-800 flex items-center gap-1.5">
                            {item.payload === "Snowflakes" ? "❄️ Snowflakes" : "🎈 Balloons"}
                          </td>
                          <td className="p-3 text-slate-500 font-mono">{item.density}%</td>
                          <td className="p-3 text-slate-500 font-mono">{item.duration}</td>
                          <td className="p-3 pr-4 text-right">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.status === "Completed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : item.status === "Live"
                                  ? "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                                  : "bg-rose-50 text-rose-700 border border-rose-100"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer bar */}
      <footer 
        id="panel-corporate-footer"
        className="h-12 bg-white border-t border-slate-200 px-8 flex items-center justify-between z-30 select-none text-slate-500"
      >
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
          <span>Terminal: 0x8FA</span>
          <span>Node: Primary</span>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">
          © 2026 Particle Dynamics Systems Corp.
        </div>
      </footer>
    </div>
  );
}


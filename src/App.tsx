import React, { useState, useEffect, useRef } from "react";
import { 
  Snowflake, 
  Sparkles, 
  Timer, 
  RefreshCw, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Sliders, 
  Play, 
  StopCircle, 
  Activity, 
  Zap, 
  CloudRain, 
  Navigation, 
  Sparkle, 
  Flame, 
  Cpu, 
  Database,
  Info
} from "lucide-react";
import EffectsCanvas from "./components/EffectsCanvas";

// Type definitions for gamified telemetry logs
interface SimulatorLog {
  id: string;
  timestamp: string;
  mode: string;
  particles: number;
  fps: number;
  xpEarned: number;
}

interface Achievement {
  id: string;
  name: string;
  desc: string;
  unlocked: boolean;
  requirement: string;
}

export default function App() {
  // Game Modes
  // winter_storm | sky_festival | chaos | galaxy | fireworks | none
  const [activeEffect, setActiveEffect] = useState<"winter_storm" | "sky_festival" | "chaos" | "galaxy" | "fireworks" | "none">("none");
  const [triggerTimestamp, setTriggerTimestamp] = useState<number>(0);
  const [durationMs] = useState<number>(10000); // Extended to 10s for premium long continuous particle simulations
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Configuration sliders
  const [density, setDensity] = useState<number>(75);
  const [sizeModifier, setSizeModifier] = useState<number>(1.2);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Gamification states that persist in localStorage or current session
  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem("pc_score");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [combo, setCombo] = useState<number>(0);
  const [lastPopTime, setLastPopTime] = useState<number>(0);
  
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem("pc_xp");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [level, setLevel] = useState<number>(() => {
    const saved = localStorage.getItem("pc_level");
    return saved ? parseInt(saved, 10) : 1;
  });

  // Level Up Floating Toast Overlays
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [xpFloats, setXpFloats] = useState<{ id: string; amount: string; x: number; y: number }[]>([]);

  // Telemetry details updated directly from EffectsCanvas render frame rates
  const [liveFPS, setLiveFPS] = useState<number>(60);
  const [liveParticleCount, setLiveParticleCount] = useState<number>(0);
  const [liveWindVelocity, setLiveWindVelocity] = useState<number>(0);

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "ac_winter", name: "Glacial Surge", desc: "Trigger Winter Storm under high-yield settings.", unlocked: false, requirement: "Winter with Density > 80%" },
    { id: "ac_festival", name: "Festival Popper", desc: "Unlock score rewards by popping balloons.", unlocked: false, requirement: "Pop your first balloon" },
    { id: "ac_comboking", name: "Multiplier Overload", desc: "Reach active score combo multiplier above 5x.", unlocked: false, requirement: "5x pop combo" },
    { id: "ac_storm", name: "Barometric Crisis", desc: "Simulate extreme storm conditions in Chaos Blitz.", unlocked: false, requirement: "Active Chaos mode" },
    { id: "ac_gravity", name: "Cosmic Architect", desc: "Distort gravitational coordinates in Galaxy mode.", unlocked: false, requirement: "Galaxy mode launched" },
    { id: "ac_legend", name: "Grand Director", desc: "Unlock ultimate rank status and milestones.", unlocked: false, requirement: "Level 4 milestone" },
  ]);

  // Audio Ambient background drone (simulates spaceship ambient loop)
  const [isAmbientDroneOn, setIsAmbientDroneOn] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);

  // Interactive Live logs panel
  const [historyLogs, setHistoryLogs] = useState<SimulatorLog[]>(() => {
    return [
      { id: "CMD-2491", timestamp: "04:32:10", mode: "Galaxy", particles: 120, fps: 60, xpEarned: 25 },
      { id: "CMD-2490", timestamp: "04:15:44", mode: "Sky Festival", particles: 24, fps: 60, xpEarned: 40 },
    ];
  });

  // Calculate ranks based on level progression
  const RANKS = [
    "Rookie Operator",
    "Particle Engineer",
    "Atmosphere Architect",
    "Climate Commander",
    "Cosmic Director"
  ];
  
  const getRank = (lvl: number) => {
    if (lvl <= 1) return RANKS[0];
    if (lvl === 2) return RANKS[1];
    if (lvl === 3) return RANKS[2];
    if (lvl === 4) return RANKS[3];
    return RANKS[4];
  };

  const nextLevelXpNeeded = level * 120;
  const progressPercentXP = (xp / nextLevelXpNeeded) * 100;

  // Sync high-level persistence
  useEffect(() => {
    localStorage.setItem("pc_score", score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem("pc_xp", xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem("pc_level", level.toString());
  }, [level]);

  // Handle ambient space control synthesizer
  useEffect(() => {
    if (isAmbientDroneOn && !isMuted) {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        // Deep 65Hz atmospheric carrier hum + 66Hz binaural beat frequency
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(65, ctx.currentTime);

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(65.8, ctx.currentTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(120, ctx.currentTime);

        gain.gain.setValueAtTime(0.06, ctx.currentTime); // Soft background hum

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        droneOscRef.current = osc1; // Hold reference for termination
        droneGainRef.current = gain;
      } catch (e) {
        console.warn("Ambient drone play blocked:", e);
      }
    } else {
      // Disconnect smoothly
      if (droneOscRef.current) {
        try {
          droneOscRef.current.stop();
        } catch (e) {}
        droneOscRef.current = null;
      }
    }

    return () => {
      if (droneOscRef.current) {
        try {
          droneOscRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isAmbientDroneOn, isMuted]);

  // Adjust ambient gain dynamically on Mute toggle
  useEffect(() => {
    if (droneGainRef.current) {
      droneGainRef.current.gain.setValueAtTime(isMuted ? 0 : 0.06, 0);
    }
  }, [isMuted]);

  // Timer loop for simulation sequence decay
  useEffect(() => {
    if (activeEffect === "none") return;

    let animId: number;
    const tick = () => {
      const elapsed = Date.now() - triggerTimestamp;
      const remaining = Math.max(0, durationMs - elapsed);
      setTimeLeft(remaining);

      if (remaining > 0) {
        animId = requestAnimationFrame(tick);
      } else {
        // Automatically settle back to idle
        setActiveEffect("none");
        setTimeLeft(0);

        // Generate final sweep logging
        const newLog: SimulatorLog = {
          id: `CMD-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toLocaleTimeString().split(" ")[0],
          mode: formatModeName(activeEffect),
          particles: liveParticleCount,
          fps: liveFPS,
          xpEarned: activeEffect === "sky_festival" ? 50 : 25,
        };
        setHistoryLogs(prev => [newLog, ...prev]);

        // Award default completion XP
        addXp(activeEffect === "sky_festival" ? 35 : 20);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [activeEffect, triggerTimestamp, durationMs, liveParticleCount, liveFPS]);

  // Combo decay tracking
  useEffect(() => {
    if (combo > 0 && Date.now() - lastPopTime > 1800) {
      setCombo(0); // Combo breaks if inactive for 1.8s
    }
  }, [combo, lastPopTime]);

  // Award XP and check Level milestones
  const addXp = (amount: number) => {
    setXp(prevXp => {
      let currentXp = prevXp + amount;
      let currentLevel = level;
      let needed = currentLevel * 120;

      // Double level ups handled safely
      while (currentXp >= needed) {
        currentXp -= needed;
        currentLevel += 1;
        needed = currentLevel * 120;
        
        // Trigger Level milestones
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 4500);

        // Synthesize level upward chime chime
        const activeSynth = (window as any).audioSynth ?? null;
        if (activeSynth && !isMuted) {
          try {
            activeSynth.playLevelUp();
          } catch(e){}
        }
      }
      setLevel(currentLevel);
      return currentXp;
    });

    // Create visually floating XP text notification on screen coords
    const randomOffset = Math.random() * 80 - 40;
    const newFloatDef = {
      id: Math.random().toString(),
      amount: `+${amount} XP`,
      x: window.innerWidth / 2 + randomOffset,
      y: 120,
    };
    setXpFloats(prev => [...prev, newFloatDef]);
    setTimeout(() => {
      setXpFloats(prev => prev.filter(f => f.id !== newFloatDef.id));
    }, 1500);
  };

  const formatModeName = (m: string) => {
    if (m === "winter_storm") return "Winter Storm";
    if (m === "sky_festival") return "Sky Festival";
    if (m === "chaos") return "Chaos Blitz";
    if (m === "galaxy") return "Cosmic Galaxy";
    if (m === "fireworks") return "Fireworks";
    return "None";
  };

  // Trigger Simulations
  const handleLaunchMode = (mode: "winter_storm" | "sky_festival" | "chaos" | "galaxy" | "fireworks") => {
    setActiveEffect(mode);
    setTriggerTimestamp(Date.now());
    setTimeLeft(durationMs);

    // Track state achievements
    setIsAchievementUnlocked("ac_winter", mode === "winter_storm" && density > 80);
    setIsAchievementUnlocked("ac_storm", mode === "chaos");
    setIsAchievementUnlocked("ac_gravity", mode === "galaxy");

    addXp(15); // Instant deployment XP
  };

  const handleStopRun = () => {
    setActiveEffect("none");
    setTimeLeft(0);
    setTriggerTimestamp(0);
    setCombo(0);
  };

  // Award Points whenever interactive events are triggered from layout
  const handlePopBalloon = (pointsGained: number) => {
    const doubleFactor = Math.random() > 0.6 ? 2 : 1;
    const newCombo = combo + 1;
    setCombo(newCombo);
    setLastPopTime(Date.now());

    // Calculate final score based on continuous pop speed
    const scoreGain = pointsGained * newCombo * doubleFactor;
    setScore(prev => prev + scoreGain);

    // Direct proportional dynamic XP
    addXp(5);

    // Push popping achievements
    setIsAchievementUnlocked("ac_festival", true);
    setIsAchievementUnlocked("ac_comboking", newCombo >= 5);
  };

  // Direct achievement unlock helper
  const setIsAchievementUnlocked = (id: string, isSatisfied: boolean) => {
    if (!isSatisfied) return;
    setAchievements(prev => 
      prev.map(ac => {
        if (ac.id === id && !ac.unlocked) {
          // Play achievement sound
          const activeSynth = (window as any).audioSynth ?? null;
          if (activeSynth && !isMuted) {
            try {
              activeSynth.playAchievement();
            } catch(e){}
          }
          return { ...ac, unlocked: true };
        }
        return ac;
      })
    );
  };

  // Achievement unlock tracker towards legend milestone
  useEffect(() => {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    if (unlockedCount >= 4) {
      setIsAchievementUnlocked("ac_legend", true);
    }
  }, [achievements]);

  // Calibration functions
  const handleSyncMetrics = (fps: number, particleCount: number, wind: number) => {
    setLiveFPS(fps);
    setLiveParticleCount(particleCount);
    setLiveWindVelocity(wind);
  };

  const progressPercent = (timeLeft / durationMs) * 100;

  return (
    <div
      id="atmospheric-combat-launcher"
      className="relative min-h-screen w-full bg-[#020617] text-slate-100 font-sans flex flex-col overflow-hidden select-none"
    >
      {/* Laser HUD Grid Background overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 bg-[radial-gradient(#38bdf8_1.2px,transparent_1.2px)] [background-size:24px_24px]" />
      <div className="scanlines z-10" />

      {/* Floating XP Gain indicators */}
      <div className="absolute inset-x-0 pointer-events-none z-30 overflow-hidden">
        {xpFloats.map(f => (
          <div
            key={f.id}
            style={{ left: f.x, top: f.y }}
            className="absolute bg-sky-500/20 text-sky-400 font-game px-3 py-1.5 rounded border border-sky-500/30 text-xs font-black tracking-widest hologram-glow select-none animate-bubble-up"
          >
            {f.amount}
          </div>
        ))}
      </div>

      {/* Level Up Flash Interstitial Modal */}
      {showLevelUp && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
          <div className="border border-emerald-500/30 bg-slate-900/90 p-8 rounded-2xl max-w-sm text-center shadow-[0_0_50px_rgba(16,185,129,0.2)] md:p-12 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500" />
            <Trophy className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
            <h2 className="font-game font-black text-2xl text-emerald-400 tracking-wider mb-2">PROMOTE LEVEL UNLOCKED</h2>
            <p className="text-slate-400 text-sm mb-4">Command hierarchy node restructured successfully.</p>
            <div className="bg-slate-950/50 py-3 rounded-lg border border-slate-800 font-mono text-xs font-bold text-sky-400 tracking-widest">
              NEW RANK: {getRank(level).toUpperCase()}
            </div>
            <button
              onClick={() => setShowLevelUp(false)}
              className="mt-6 font-game bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 font-semibold px-6 py-2 rounded-lg text-xs tracking-wider border border-emerald-500/40 cursor-pointer transition-colors"
            >
              INITIALIZE TELEMETRY
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER COMMAND DECK */}
      <header className="h-20 bg-slate-950/90 border-b border-sky-950/60 px-6 flex items-center justify-between z-30 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-cyan-400/40 bg-cyan-950/30 rounded flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <span className="font-game font-black tracking-wide text-xs md:text-[14px] text-cyan-400 uppercase leading-none block">
              PARTICLE COMMANDER
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#06b6d4]/70 uppercase leading-none mt-1 block">
              Ultimate Atmosphere Simulator v4.26
            </span>
          </div>
        </div>

        {/* Level Progression Hud Tracker */}
        <div className="hidden md:flex items-center gap-4 bg-slate-900/40 border border-sky-950/50 px-4 py-2 rounded-xl w-72 lg:w-[350px]">
          <div className="text-center shrink-0">
            <div className="font-game text-[10px] font-bold text-[#8b5cf6] tracking-widest">RANK {level}</div>
            <div className="text-[9px] font-mono font-bold text-slate-400 uppercase mt-0.5 max-w-[100px] truncate">{getRank(level)}</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-400 mb-1">
              <span>EXP OVERLOAD PROGRESS</span>
              <span className="text-sky-400 font-bold">{xp}/{nextLevelXpNeeded} XP</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 border border-sky-950 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-sky-400 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentXP}%` }}
              />
            </div>
          </div>
        </div>

        {/* Global Volume, Space drone hum, and branding metrics */}
        <div className="flex items-center gap-3">
          {/* Ambient hum synthesizer */}
          <button
            onClick={() => setIsAmbientDroneOn(!isAmbientDroneOn)}
            className={`p-2 rounded border cursor-pointer text-xs flex items-center gap-1.5 font-mono ${
              isAmbientDroneOn 
                ? "bg-indigo-950/40 border-indigo-400/40 text-indigo-300"
                : "bg-slate-900/30 border-slate-800 text-slate-500"
            }`}
            title="Toggle synthesized background spacecraft engine hum"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[9px] font-bold tracking-wider">AMBIENT HUM</span>
          </button>

          {/* Mute Synth FX */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 rounded border cursor-pointer transition-colors ${
              isMuted 
                ? "bg-rose-950/40 border-rose-800 text-rose-400 hover:bg-rose-900/30" 
                : "bg-slate-900 / border-sky-950 text-cyan-400 hover:bg-slate-800"
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN ATMOSPHERIC CONSOLE GRIDS */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden z-20 shrink-0">
        
        {/* LEFT PANEL: LAUNCH CONROLLER MODE SELECTIONS */}
        <aside 
          id="panel-controls"
          className="w-full lg:w-80 bg-slate-950/70 border-b lg:border-b-0 lg:border-r border-sky-950/60 p-5 flex flex-col gap-6 overflow-y-auto shrink-0 z-20"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h2 className="font-game text-[11px] font-bold tracking-widest text-[#06b6d4] uppercase">
                LAUNCH CONTROLLER
              </h2>
            </div>
            
            <div className="space-y-2">
              {/* Winter Storm Mode */}
              <button
                onClick={() => handleLaunchMode("winter_storm")}
                className={`w-full p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                  activeEffect === "winter_storm"
                    ? "bg-[#10b981]/10 border-[#10b981]/50 text-emerald-300 font-semibold"
                    : "bg-slate-900/50 border-sky-950 hover:border-sky-800 text-sky-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Snowflake className={`w-4 h-4 ${activeEffect === "winter_storm" ? "animate-spin-[10s]" : "text-sky-400"}`} />
                  <div>
                    <div className="text-xs font-bold font-game tracking-wider">WINTER STORM</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Snowsheets + Aurora lights</div>
                  </div>
                </div>
                <Play className="w-3.5 h-3.5 text-slate-500 opacity-60" />
              </button>

              {/* Sky Festival Mode */}
              <button
                onClick={() => handleLaunchMode("sky_festival")}
                className={`w-full p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                  activeEffect === "sky_festival"
                    ? "bg-[#3b82f6]/10 border-[#3b82f6]/50 text-blue-300 font-semibold"
                    : "bg-slate-900/50 border-sky-950 hover:border-sky-800 text-sky-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkle className={`w-4 h-4 ${activeEffect === "sky_festival" ? "animate-bounce" : "text-blue-400"}`} />
                  <div>
                    <div className="text-xs font-bold font-game tracking-wider">SKY FESTIVAL</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Swaying balloons + Cloud drift</div>
                  </div>
                </div>
                <Play className="w-3.5 h-3.5 text-slate-500 opacity-60" />
              </button>

              {/* Chaos Blitz Mode */}
              <button
                onClick={() => handleLaunchMode("chaos")}
                className={`w-full p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                  activeEffect === "chaos"
                    ? "bg-[#e11d48]/10 border-[#e11d48]/50 text-rose-300 font-semibold"
                    : "bg-slate-900/50 border-sky-950 hover:border-sky-800 text-sky-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CloudRain className={`w-4 h-4 ${activeEffect === "chaos" ? "animate-pulse" : "text-rose-400"}`} />
                  <div>
                    <div className="text-xs font-bold font-game tracking-wider">CHAOS BLITZ</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Fast rain + Lightning flashes</div>
                  </div>
                </div>
                <Play className="w-3.5 h-3.5 text-slate-500 opacity-60" />
              </button>

              {/* Cosmic Galaxy Mode */}
              <button
                onClick={() => handleLaunchMode("galaxy")}
                className={`w-full p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                  activeEffect === "galaxy"
                    ? "bg-[#a855f7]/10 border-[#a855f7]/50 text-purple-300 font-semibold"
                    : "bg-slate-900/50 border-sky-950 hover:border-sky-800 text-sky-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Navigation className={`w-4 h-4 ${activeEffect === "galaxy" ? "animate-spin-[15s]" : "text-purple-400"}`} />
                  <div>
                    <div className="text-xs font-bold font-game tracking-wider">COSMIC GALAXY</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Orbit stars + Gravitational pull</div>
                  </div>
                </div>
                <Play className="w-3.5 h-3.5 text-slate-500 opacity-60" />
              </button>

              {/* Celebration Fireworks Mode */}
              <button
                onClick={() => handleLaunchMode("fireworks")}
                className={`w-full p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                  activeEffect === "fireworks"
                    ? "bg-[#eab308]/10 border-[#eab308]/50 text-amber-300 font-semibold"
                    : "bg-slate-900/50 border-sky-950 hover:border-sky-800 text-sky-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Flame className={`w-4 h-4 ${activeEffect === "fireworks" ? "animate-pulse" : "text-amber-400"}`} />
                  <div>
                    <div className="text-xs font-bold font-game tracking-wider">FIREWORKS MODE</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Rocket projectiles + combo multiplier</div>
                  </div>
                </div>
                <Play className="w-3.5 h-3.5 text-slate-500 opacity-60" />
              </button>
            </div>
          </div>

          {/* SIMULATION FINE-TUNING SLIDERS */}
          <div className="border-t border-sky-950/60 pt-5">
            <h3 className="font-game text-[11px] font-bold tracking-widest text-[#06b6d4] uppercase mb-4">
              PHYSICS CONFIG
            </h3>

            <div className="space-y-4">
              {/* Density Multiplier Slider */}
              <div className="p-3.5 bg-slate-900/40 border border-sky-950/50 rounded-lg">
                <div className="flex items-center justify-between mb-2 text-[10px] font-mono">
                  <span className="text-slate-400">PARTICLE DENSITY</span>
                  <span className="text-cyan-400 font-bold">{density}%</span>
                </div>
                <input 
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={density}
                  onChange={(e) => setDensity(Number(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#06b6d4]" 
                />
                <div className="text-[8px] text-slate-500 mt-1.5">Regulates rendering count coefficients.</div>
              </div>

              {/* Particle Size Modifier */}
              <div className="p-3.5 bg-slate-900/40 border border-sky-950/50 rounded-lg">
                <div className="flex items-center justify-between mb-2 text-[10px] font-mono">
                  <span className="text-slate-400">PARTICLE SIZE CAL</span>
                  <span className="text-cyan-400 font-bold">{sizeModifier.toFixed(1)}x</span>
                </div>
                <input 
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={sizeModifier}
                  onChange={(e) => setSizeModifier(Number(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#06b6d4]" 
                />
                <div className="text-[8px] text-slate-500 mt-1.5">Direct dimension scaling coefficient.</div>
              </div>
            </div>
          </div>

          {/* STANDBY SHUTDOWN ACTIONS */}
          <div className="mt-auto border-t border-sky-950/60 pt-4 flex flex-col gap-2">
            <button
              onClick={handleStopRun}
              disabled={activeEffect === "none"}
              className={`w-full py-2.5 rounded-lg font-game text-xs tracking-wider border flex items-center justify-center gap-2 transition-all ${
                activeEffect !== "none"
                  ? "bg-rose-500/10 hover:bg-rose-500/25 border-rose-500/30 text-rose-300 cursor-pointer"
                  : "bg-slate-900/30 border-slate-900/60 text-slate-600 cursor-not-allowed"
              }`}
            >
              <StopCircle className="w-4 h-4" />
              STANDBY TERMINATION
            </button>
          </div>
        </aside>

        {/* CENTER COLUMN: FULL SIMULATOR CHAMBER INTERACTIVE PORTAL */}
        <section 
          id="center-atmosphere-hull"
          className="flex-1 relative flex flex-col-reverse md:flex-col overflow-hidden bg-slate-950/80 p-4"
        >
          {/* Neon bounding borders for simulator HUD screen */}
          <div className="absolute inset-0 border border-sky-950/30 z-20 pointer-events-none" />
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500/40 z-20 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/40 z-20 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/40 z-20 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500/40 z-20 pointer-events-none" />

          {/* Interactive Atmospheric Canvas Container */}
          <div className="flex-1 relative border border-cyan-950/30 bg-[#02050c] rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
            
            {/* Interactive Effects Canvas component */}
            <EffectsCanvas 
              activeEffect={activeEffect}
              triggerTimestamp={triggerTimestamp}
              durationMs={durationMs}
              density={density}
              sizeModifier={sizeModifier}
              isMuted={isMuted}
              onPopBalloon={handlePopBalloon}
              onUpdateMetrics={handleSyncMetrics}
            />

            {/* Scoreboard overlay for Sky Festival Mode */}
            {activeEffect === "sky_festival" && (
              <div className="absolute top-4 left-4 z-20 bg-slate-950/80 border border-sky-500/30 px-4 py-2.5 rounded-lg backdrop-blur-md text-left font-mono">
                <div className="text-[9px] text-[#06b6d4] font-game tracking-widest uppercase">FESTIVAL REBELS SCORE</div>
                <div className="text-xl font-bold font-game tracking-wider text-cyan-400 mt-1">{score.toLocaleString()}</div>
                {combo > 1 && (
                  <div className="text-[10px] text-amber-400 font-game mt-1 flex items-center gap-1 font-bold animate-bounce">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    COMBO MULTIPLIER: {combo}x
                  </div>
                )}
              </div>
            )}

            {/* Scoreboard overlay for Fireworks Mode */}
            {activeEffect === "fireworks" && (
              <div className="absolute top-4 left-4 z-20 bg-slate-950/80 border border-amber-500/30 px-4 py-2.5 rounded-lg backdrop-blur-md text-left font-mono">
                <div className="text-[9px] text-amber-400 font-game tracking-widest uppercase">FIREWORKS IMPACT COUNT</div>
                <div className="text-xl font-bold font-game tracking-wider text-amber-300 mt-1">{score.toLocaleString()}</div>
                <div className="text-[8.5px] text-slate-400 mt-1 block">CLICK CANVAS SPACE TO DEPLOY PROJECTILES</div>
              </div>
            )}

            {/* Standby Status Overlays */}
            {activeEffect === "none" && (
              <div className="relative z-20 text-center select-none p-6 bg-slate-950/80 border border-sky-950/50 rounded-xl backdrop-blur-sm max-w-sm">
                <div className="w-12 h-12 rounded-full bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="font-game text-sm font-bold tracking-widest text-[#06b6d4]">CHAMBER STANDBY ACTIVE</h2>
                <p className="text-[10px] text-slate-400 mt-2 font-mono leading-relaxed leading-6">
                  Select clean parameter sweeps inside left deployment deck to execute high performance microparticle climate simulations.
                </p>
                <div className="mt-4 flex items-center justify-center gap-1.5 text-[8.5px] font-mono text-emerald-400 bg-emerald-500/10 py-1 px-3 border border-emerald-500/20 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  HOLOGRAPHIC CHANNELS IDLE & CONFIGURED
                </div>
              </div>
            )}

            {/* Live active sweep timeline progress */}
            {activeEffect !== "none" && (
              <div className="absolute bottom-4 inset-x-4 z-20 bg-slate-950/95 border border-sky-950/80 p-3.5 rounded-xl text-left max-w-md mx-auto backdrop-blur-md font-mono">
                <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                  <span className="flex items-center gap-1.5 text-[#06b6d4] font-bold tracking-widest lowercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    sweep in progress...
                  </span>
                  <span className="font-bold text-slate-300">
                    {(timeLeft / 1000).toFixed(2)}s REMAINING
                  </span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden border border-sky-950 mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-cyan-400 to-indigo-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[8px] text-slate-400">
                  <span className="uppercase">MODE: {formatModeName(activeEffect)}</span>
                  <button
                    onClick={handleStopRun}
                    className="px-2 py-0.5 rounded text-[8.5px] font-game font-bold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 cursor-pointer transition-colors"
                  >
                    INTERRUPT RUN
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* QUICK HORIZONTAL DEPLOYMENT STATS BAR */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 mt-3 md:mt-0 font-mono text-[10px]">
            <div className="bg-slate-950/40 border border-sky-950/40 p-2.5 rounded-lg flex flex-col justify-center">
              <span className="text-slate-500 block uppercase">CHAMBER TEMP</span>
              <span className="text-xs font-bold text-slate-300 mt-1">271.45 K (-1.7°C)</span>
            </div>
            <div className="bg-slate-950/40 border border-sky-950/40 p-2.5 rounded-lg flex flex-col justify-center">
              <span className="text-slate-500 block uppercase">ATMOS ACCURACY</span>
              <span className="text-xs font-bold text-cyan-400 mt-1">99.87% FIXED</span>
            </div>
            <div className="bg-slate-950/40 border border-sky-950/40 p-2.5 rounded-lg flex flex-col justify-center">
              <span className="text-slate-500 block uppercase">SCORE ACCUMULATOR</span>
              <span className="text-xs font-bold text-amber-400 mt-1">{score.toLocaleString()} PTS</span>
            </div>
            <div className="bg-slate-950/40 border border-sky-950/40 p-2.5 rounded-lg flex flex-col justify-center">
              <span className="text-slate-500 block uppercase">XP NODE PROGRESSION</span>
              <span className="text-xs font-bold text-[#a855f7] mt-1">{progressPercentXP.toFixed(0)}% UNLOCKED</span>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: ACHIEVEMENTS PROGRESS & DIAGNOSTIC LOGS */}
        <aside 
          id="panel-telemetry"
          className="w-full lg:w-80 bg-slate-950/70 border-t lg:border-t-0 lg:border-l border-sky-950/60 p-5 flex flex-col gap-6 overflow-y-auto shrink-0 z-20"
        >
          {/* ACHIVEMENTS TRACKER */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-[#eab308]" />
              <h2 className="font-game text-[11px] font-bold tracking-widest text-[#06b6d4] uppercase">
                ACHIEVEMENT MATRIX
              </h2>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {achievements.map((item) => (
                <div 
                  key={item.id}
                  className={`p-2 rounded-lg border flex items-start gap-2.5 ${
                    item.unlocked 
                      ? "bg-emerald-950/10 border-emerald-500/25 text-[#10b981]"
                      : "bg-slate-900/40 border-slate-900 text-slate-500"
                  }`}
                >
                  <div className={`mt-0.5 rounded-full w-3.5 h-3.5 border flex items-center justify-center shrink-0 ${
                    item.unlocked 
                      ? "bg-emerald-500/10 border-emerald-400"
                      : "bg-slate-950 border-slate-700"
                  }`}>
                    {item.unlocked && <ShieldCheck className="w-2.5 h-2.5 text-emerald-300" />}
                  </div>
                  <div>
                    <h4 className={`text-[10px] font-bold font-game tracking-wider leading-none uppercase ${
                      item.unlocked ? "text-emerald-300" : "text-slate-400"
                    }`}>
                      {item.name}
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1 leading-normal leading-4">{item.desc}</p>
                    <div className="text-[7.5px] text-slate-500 mt-0.5 font-mono uppercase tracking-widest font-semibold flex items-center gap-1">
                      <Info className="w-2.5 h-2.5 shrink-0" />
                      REQ: {item.requirement}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REAL TIME PERFORMANCE HUD DIAGNOSTIC CONSOLE */}
          <div className="border-t border-sky-950/60 pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h2 className="font-game text-[11px] font-bold tracking-widest text-[#06b6d4] uppercase">
                TELEMETRY HUD CONSOLE
              </h2>
            </div>

            <div className="p-3 bg-slate-950/90 border border-sky-950/40 rounded-lg space-y-2.5 font-mono text-[9px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">FPS RESOLUTION</span>
                <span className={`font-bold ${liveFPS >= 55 ? "text-emerald-400 animate-pulse" : "text-amber-400"}`}>
                  {liveFPS} / 60 FPS
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ACTIVE PARTICLES</span>
                <span className="text-sky-300 font-bold">{liveParticleCount} / 250</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">LATERAL WIND DRIFT</span>
                <span className="text-[#a855f7] font-bold">
                  {liveWindVelocity > 0 ? `+${liveWindVelocity}` : liveWindVelocity} VEL
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">DRAM CO-ALLOCATION</span>
                <span className="text-slate-300 font-bold">
                  {(41.2 + Math.sin(Date.now() * 0.0001) * 0.4).toFixed(2)} MB
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-sky-950/40 pt-2.5">
                <span className="text-slate-400">RENDER INTERLACING</span>
                <span className="text-emerald-400 font-bold">EXCELLENT</span>
              </div>
            </div>
          </div>

          {/* HISTORIC SESSION logs */}
          <div className="border-t border-sky-950/60 pt-4 flex-1 flex flex-col min-h-[150px] overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-[#a855f7]" />
              <h2 className="font-game text-[11px] font-bold tracking-widest text-[#06b6d4] uppercase">
                COMMAND MEM LOGS
              </h2>
            </div>

            <div className="flex-1 bg-slate-950/90 border border-sky-950/45 rounded-lg overflow-y-auto max-h-[160px] p-2 text-[8px] font-mono space-y-1">
              {historyLogs.map(log => (
                <div key={log.id} className="border-b border-sky-950/20 pb-1 flex items-center justify-between leading-normal leading-4">
                  <span className="text-slate-500">[{log.timestamp}]</span>
                  <span className="text-slate-300 font-bold">UNLEASHED {log.mode.toUpperCase()}</span>
                  <span className="text-emerald-400">+{log.xpEarned} XP</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* FOOTER BAR TELEMETRY DATA */}
      <footer className="h-10 bg-slate-950/95 border-t border-sky-950/60 px-6 flex items-center justify-between font-mono text-[9px] text-[#06b6d4]/60 z-30 shrink-0">
        <div className="flex items-center gap-6">
          <span>PORT INGRESS FEED: 3000</span>
          <span className="hidden leading-none sm:inline border-l border-sky-950/70 pl-6">COGNITIVE EMULATOR LINK ACTIVE</span>
        </div>
        <div className="uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          SYSTEM DIRECTIVE ONLINE
        </div>
      </footer>
    </div>
  );
}

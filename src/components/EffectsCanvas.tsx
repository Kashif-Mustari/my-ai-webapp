import React, { useEffect, useRef, useState } from "react";

interface EffectsCanvasProps {
  activeEffect: "winter_storm" | "sky_festival" | "chaos" | "galaxy" | "fireworks" | "none";
  triggerTimestamp: number;
  durationMs?: number;
  density: number; // 20 - 100
  sizeModifier: number; // 0.5 - 2.0
  isMuted: boolean;
  onPopBalloon: (points: number) => void;
  onUpdateMetrics: (fps: number, count: number, wind: number) => void;
}

// Custom built-in elegant Web Audio synthesizer for premium high-fidelity audio responses
class WebAudioSynth {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = "sine";
      const startFreq = 400 + Math.random() * 300;
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("Synth Pop Blocked:", e);
    }
  }

  playLightning() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Deep low frequency rumble + crisp crackle
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(20, this.ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.75);
    } catch (e) {
      console.warn("Synth Thunder Blocked:", e);
    }
  }

  playLaunch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Ascending whistle pitch sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(100, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.32);
    } catch (e) {
      console.warn("Synth Launch Blocked:", e);
    }
  }

  playExplosion() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(280 + Math.random() * 150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.48);
    } catch (e) {
      console.warn("Synth Blast Blocked:", e);
    }
  }
}

// Unified global engine audio synth reference
const audioSynth = new WebAudioSynth();

// Highly-specialized Particle interfaces of the simulated climate framework
interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  angle: number;
  spin: number;
  opacity: number;
  points: number;
}

interface Balloon {
  x: number;
  y: number;
  width: number;
  height: number;
  hue: number;
  sat: number;
  light: number;
  speedY: number;
  speedX: number;
  swayAmp: number;
  swayFreq: number;
  swayOffset: number;
  opacity: number;
  stringLength: number;
  isPopping: boolean;
  popProgress: number;
}

interface RainLine {
  x: number;
  y: number;
  length: number;
  speedY: number;
  speedX: number;
  opacity: number;
  width: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  angle: number;
  speed: number;
  distance: number;
  opacity: number;
  hue: number;
  trail: { x: number; y: number }[];
}

interface Rocket {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  hue: number;
  opacity: number;
  tail: { x: number; y: number }[];
  isDead: boolean;
}

interface FireworkSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  opacity: number;
  decay: number;
}

interface ScoreFloat {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
}

export default function EffectsCanvas({
  activeEffect,
  triggerTimestamp,
  durationMs = 5000,
  density,
  sizeModifier,
  isMuted,
  onPopBalloon,
  onUpdateMetrics,
}: EffectsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Sync mute state to audio synth
  useEffect(() => {
    audioSynth.isMuted = isMuted;
  }, [isMuted]);

  // Monitor reduced-motion media query
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Frame parameters and particle tracking lists bound to physics reference loop
  const stateRef = useRef({
    activeEffect,
    triggerTimestamp,
    dimensions,
    density,
    sizeModifier,
    prefersReducedMotion,
    
    // Core Particle collections
    snowflakes: [] as Snowflake[],
    balloons: [] as Balloon[],
    rainLines: [] as RainLine[],
    stars: [] as Star[],
    rockets: [] as Rocket[],
    fireworkSparks: [] as FireworkSpark[],
    floats: [] as ScoreFloat[],

    // Controls
    isSpawning: false,
    globalOpacity: 0.0,
    windForce: 0.0,
    targetWindForce: 0.0,
    lightningFlashDuration: 0,
    pointerX: 0,
    pointerY: 0,
    isPointerWithin: false,

    // Performance telemetry
    lastFrameTime: Date.now(),
    frameCount: 0,
    fpsTimer: Date.now(),
    currentFPS: 60,
  });

  // Keep stateRef in sync with dynamic config changes
  useEffect(() => {
    const elapsed = Date.now() - triggerTimestamp;
    const isWithinDuration = elapsed < durationMs;

    stateRef.current.activeEffect = activeEffect;
    stateRef.current.triggerTimestamp = triggerTimestamp;
    stateRef.current.density = density;
    stateRef.current.sizeModifier = sizeModifier;
    stateRef.current.prefersReducedMotion = prefersReducedMotion;
    stateRef.current.isSpawning = activeEffect !== "none" && isWithinDuration;

    if (activeEffect !== "none") {
      stateRef.current.globalOpacity = 1.0;
      const { width, height } = stateRef.current.dimensions;

      // Seed immediate particles depending on mode for immediate responsive explosion/action!
      if (activeEffect === "winter_storm") {
        stateRef.current.snowflakes = Array.from({ length: Math.floor((width * height) / 12000 * (density / 100)) }, () =>
          createSnowflake(width, height, true)
        );
      } else if (activeEffect === "sky_festival") {
        stateRef.current.balloons = Array.from({ length: Math.floor(width / 60 * (density / 100)) }, () =>
          createBalloon(width, height, true)
        );
      } else if (activeEffect === "chaos") {
        stateRef.current.rainLines = Array.from({ length: Math.floor((width * height) / 8000 * (density / 100)) }, () =>
          createRainLine(width, height, true)
        );
      } else if (activeEffect === "galaxy") {
        stateRef.current.stars = Array.from({ length: Math.floor(120 * (density / 100)) }, () =>
          createStar(width, height, true)
        );
      }
    }
  }, [activeEffect, triggerTimestamp, density, sizeModifier, prefersReducedMotion, durationMs]);

  // Track Dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      const roundedWidth = Math.floor(width);
      const roundedHeight = Math.floor(height);

      setDimensions({ width: roundedWidth, height: roundedHeight });
      stateRef.current.dimensions = { width: roundedWidth, height: roundedHeight };

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = roundedWidth;
        canvas.height = roundedHeight;
      }
    });

    observer.observe(containerRef.current);
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });
    stateRef.current.dimensions = { width: rect.width, height: rect.height };
    if (canvasRef.current) {
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
    }

    return () => observer.disconnect();
  }, []);

  // Creation Utilities
  const createSnowflake = (width: number, height: number, randomizeY = false): Snowflake => {
    const isReduced = stateRef.current.prefersReducedMotion;
    const baseRadius = (5 + Math.random() * 6) * stateRef.current.sizeModifier;
    return {
      x: Math.random() * width,
      y: randomizeY ? Math.random() * height : -20,
      radius: baseRadius,
      speedY: (1.2 + Math.random() * 1.5) * (isReduced ? 0.35 : 1.0),
      speedX: (-0.6 + Math.random() * 1.2) * (isReduced ? 0.1 : 1.0),
      angle: isReduced ? 0 : Math.random() * Math.PI * 2,
      spin: isReduced ? 0 : -0.01 + Math.random() * 0.02,
      opacity: 0.45 + Math.random() * 0.55,
      points: Math.random() > 0.35 ? 6 : 8,
    };
  };

  const createBalloon = (width: number, height: number, randomizeY = false): Balloon => {
    const isReduced = stateRef.current.prefersReducedMotion;
    const balloonColors = [
      { h: 345, s: 78, l: 45 }, // Cyberpunk Crimson
      { h: 200, s: 85, l: 48 }, // Electric Azul
      { h: 165, s: 70, l: 42 }, // Neon Emerald
      { h: 42, s: 85, l: 48 },  // Tokyo Gold
      { h: 280, s: 75, l: 48 }, // Synthwave Purple
    ];
    const baseColor = balloonColors[Math.floor(Math.random() * balloonColors.length)];
    const baseSize = (22 + Math.random() * 10) * stateRef.current.sizeModifier;
    return {
      x: Math.random() * width,
      y: randomizeY ? height - Math.random() * (height * 0.75) : height + 50,
      width: baseSize,
      height: baseSize * 1.25,
      hue: baseColor.h,
      sat: baseColor.s,
      light: baseColor.l,
      speedY: (-1.1 - Math.random() * 1.3) * (isReduced ? 0.35 : 1.0),
      speedX: 0,
      swayAmp: isReduced ? 0 : 8 + Math.random() * 12,
      swayFreq: isReduced ? 0 : 0.004 + Math.random() * 0.006,
      swayOffset: Math.random() * Math.PI * 2,
      opacity: 0.85 + Math.random() * 0.15,
      stringLength: 25 + Math.random() * 15,
      isPopping: false,
      popProgress: 0,
    };
  };

  const createRainLine = (width: number, height: number, randomizeY = false): RainLine => {
    return {
      x: Math.random() * width,
      y: randomizeY ? Math.random() * height : -30,
      length: 15 + Math.random() * 20,
      speedY: 10 + Math.random() * 6,
      speedX: 0,
      opacity: 0.15 + Math.random() * 0.35,
      width: 1.0 + Math.random() * 1.0,
    };
  };

  const createStar = (width: number, height: number, initialize = false): Star => {
    const centerPoint = { x: width / 2, y: height / 2 };
    const dist = initialize ? Math.random() * Math.min(width, height) * 0.6 : Math.random() * 100 + 350;
    return {
      x: 0,
      y: 0,
      radius: 1 + Math.random() * 2.5,
      angle: Math.random() * Math.PI * 2,
      speed: 0.005 + Math.random() * 0.015,
      distance: dist,
      opacity: 0.4 + Math.random() * 0.6,
      hue: Math.random() > 0.5 ? 190 + Math.random() * 40 : 280 + Math.random() * 60, // Electric blue to vapor magenta
      trail: [],
    };
  };

  const spawnRocket = (x: number, y: number, targetX: number, targetY: number) => {
    audioSynth.playLaunch();
    stateRef.current.rockets.push({
      x,
      y,
      targetX,
      targetY,
      speed: 12 + Math.random() * 5,
      hue: Math.floor(Math.random() * 360),
      opacity: 1.0,
      tail: [],
      isDead: false,
    });
  };

  const spawnExplosionSparks = (x: number, y: number, hue: number) => {
    audioSynth.playExplosion();
    const sparksCount = 20 + Math.floor(Math.random() * 25);
    for (let i = 0; i < sparksCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      stateRef.current.fireworkSparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // Slight upward bias
        radius: 1.5 + Math.random() * 2.5,
        hue,
        opacity: 1.0,
        decay: 0.012 + Math.random() * 0.015,
      });
    }

    // Spawn dynamic scoreboard floating numerical indicators!
    stateRef.current.floats.push({
      id: Math.random().toString(),
      x,
      y: y - 20,
      text: `+50 COMBO`,
      color: `hsla(${hue}, 90%, 65%, 1)`,
      opacity: 1.0,
    });

    onPopBalloon(50);
  };

  // High quality canvas visual generators
  const drawSnowflakeShape = (
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    angle: number,
    opacity: number,
    points: number
  ) => {
    c.save();
    c.translate(x, y);
    c.rotate(angle);

    c.shadowColor = `rgba(6, 182, 212, ${opacity * 0.4})`;
    c.shadowBlur = 6;
    c.strokeStyle = `rgba(224, 242, 254, ${opacity})`;
    c.lineWidth = radius * 0.14;
    c.lineCap = "round";

    c.beginPath();
    for (let i = 0; i < points; i++) {
      const branchAngle = (i * Math.PI * 2) / points;
      const rx = Math.cos(branchAngle) * radius;
      const ry = Math.sin(branchAngle) * radius;

      c.moveTo(0, 0);
      c.lineTo(rx, ry);

      const subLength = radius * 0.35;
      const subAngle = Math.PI / 4;
      const tx = Math.cos(branchAngle) * radius * 0.55;
      const ty = Math.sin(branchAngle) * radius * 0.55;

      c.moveTo(tx, ty);
      c.lineTo(
        tx + Math.cos(branchAngle + subAngle) * subLength,
        ty + Math.sin(branchAngle + subAngle) * subLength
      );

      c.moveTo(tx, ty);
      c.lineTo(
        tx + Math.cos(branchAngle - subAngle) * subLength,
        ty + Math.sin(branchAngle - subAngle) * subLength
      );
    }
    c.stroke();

    c.beginPath();
    c.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
    c.fillStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
    c.fill();
    c.restore();
  };

  const drawBalloonShape = (
    c: CanvasRenderingContext2D,
    b: Balloon,
    time: number
  ) => {
    c.save();
    c.translate(b.x, b.y);

    const computedOpacity = b.opacity * stateRef.current.globalOpacity;

    // Draw balloon string
    c.beginPath();
    c.moveTo(0, b.height / 2);
    const swayOffset = Math.sin(time * 0.004 + b.swayOffset) * 6;
    c.bezierCurveTo(
      swayOffset / 2, b.height / 2 + b.stringLength * 0.3,
      -swayOffset / 2, b.height / 2 + b.stringLength * 0.6,
      swayOffset, b.height / 2 + b.stringLength
    );
    c.strokeStyle = `rgba(148, 163, 184, ${computedOpacity * 0.5})`;
    c.lineWidth = 1.0;
    c.stroke();

    // Balloon body oval curves
    c.beginPath();
    c.moveTo(0, -b.height / 2);
    c.bezierCurveTo(-b.width * 0.65, -b.height / 2, -b.width * 0.65, b.height / 2, 0, b.height / 2);
    c.bezierCurveTo(b.width * 0.65, b.height / 2, b.width * 0.65, -b.height / 2, 0, -b.height / 2);

    const radialGrad = c.createRadialGradient(
      -b.width * 0.15, -b.height * 0.15, b.width * 0.05, 
      0, 0, b.width * 0.6
    );

    const baseColor = `hsla(${b.hue}, ${b.sat}%, ${b.light}%, ${computedOpacity})`;
    const highlightColor = `hsla(${b.hue}, ${b.sat}%, ${b.light + 20}%, ${computedOpacity})`;
    const shadowColor = `hsla(${b.hue}, ${b.sat}%, ${b.light - 15}%, ${computedOpacity})`;

    radialGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    radialGrad.addColorStop(0.15, highlightColor);
    radialGrad.addColorStop(0.7, baseColor);
    radialGrad.addColorStop(1, shadowColor);

    c.fillStyle = radialGrad;
    c.fill();

    // Bottom tie triangle knot
    c.beginPath();
    c.moveTo(0, b.height / 2);
    c.lineTo(-b.width * 0.1, b.height / 2 + 3);
    c.lineTo(b.width * 0.1, b.height / 2 + 3);
    c.closePath();
    c.fillStyle = `hsla(${b.hue}, ${b.sat}%, ${b.light - 12}%, ${computedOpacity})`;
    c.fill();

    c.restore();
  };

  // Event coordination inside target region
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    stateRef.current.pointerX = x;
    stateRef.current.pointerY = y;
    stateRef.current.isPointerWithin = true;

    // Direct dynamic user interactive wind calculation based on pointer position relative to center!
    const width = stateRef.current.dimensions.width;
    const centerNorm = (x / width) - 0.5; // -0.5 to 0.5
    stateRef.current.targetWindForce = centerNorm * 8.0;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const state = stateRef.current;

    if (state.activeEffect === "sky_festival") {
      // Loop backwards so we click uppermost balloons first
      let clickedAny = false;
      for (let i = state.balloons.length - 1; i >= 0; i--) {
        const b = state.balloons[i];
        if (b.isPopping) continue;

        // Symmetric spherical hitbounds
        const distance = Math.hypot(cx - b.x, cy - b.y);
        const threshold = (b.width + b.height) / 2.3;

        if (distance < threshold) {
          b.isPopping = true;
          b.popProgress = 0;
          clickedAny = true;

          // Play synth POP sound!
          audioSynth.playPop();

          // Spawn beautiful exploding debris circle!
          for (let s = 0; s < 12; s++) {
            const angle = Math.random() * Math.PI * 2;
            const sp = 2 + Math.random() * 4;
            state.fireworkSparks.push({
              x: b.x,
              y: b.y,
              vx: Math.cos(angle) * sp,
              vy: Math.sin(angle) * sp - 1,
              radius: 1.5 + Math.random() * 2,
              hue: b.hue,
              opacity: 1.0,
              decay: 0.02 + Math.random() * 0.02,
            });
          }

          // Generate a fancy float notification display
          state.floats.push({
            id: Math.random().toString(),
            x: b.x,
            y: b.y - 10,
            text: `+15 PTS`,
            color: `hsla(${b.hue}, 90%, 60%, 1)`,
            opacity: 1.0,
          });

          onPopBalloon(15);
          break; // Pop one balloon per click event
        }
      }
    } else if (state.activeEffect === "fireworks") {
      // Launch rocket towards click coordinate
      const width = state.dimensions.width;
      const height = state.dimensions.height;
      spawnRocket(cx + (Math.random() * 80 - 40), height + 10, cx, cy);
    }
  };

  const handlePointerLeave = () => {
    stateRef.current.isPointerWithin = false;
    stateRef.current.targetWindForce = 0.0; // Recoil back to tranquility
  };

  // Central Core Render loop! Coordinates modes, backplates, physics mechanics and telemetry stats
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateAndRender = () => {
      const now = Date.now();
      const state = stateRef.current;
      const { width, height } = state.dimensions;

      // FPS tracking formula
      state.frameCount++;
      if (now > state.fpsTimer + 1000) {
        state.currentFPS = Math.round((state.frameCount * 1000) / (now - state.fpsTimer));
        state.frameCount = 0;
        state.fpsTimer = now;
      }

      // Sync active effects decay and transitions
      const elapsed = now - state.triggerTimestamp;
      if (state.activeEffect !== "none" && elapsed >= durationMs) {
        state.isSpawning = false;
        state.globalOpacity -= 0.015; // Slow professional fade out after 5s limit
        if (state.globalOpacity <= 0) {
          state.globalOpacity = 0;
          state.activeEffect = "none";
          // Wipe particles out to prevent resource leaks
          state.snowflakes = [];
          state.balloons = [];
          state.rainLines = [];
          state.stars = [];
          state.rockets = [];
        }
      }

      // Horizontal wind force damping
      state.windForce += (state.targetWindForce - state.windForce) * 0.06;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // --- STAGE BACKDROP RENDER LAYER ---
      if (state.globalOpacity > 0) {
        if (state.activeEffect === "winter_storm") {
          // Dark Northern Nights aurora backdrop!
          const p = state.globalOpacity;
          const auraGrad = ctx.createRadialGradient(
            width * 0.5 + Math.sin(now * 0.0006) * (width * 0.25), 
            -height * 0.2, 
            width * 0.1, 
            width * 0.5, 
            0, 
            width * 0.9
          );
          auraGrad.addColorStop(0, `rgba(16, 185, 129, ${0.16 * p})`); // emerald green neon glow
          auraGrad.addColorStop(0.4, `rgba(139, 92, 246, ${0.10 * p})`); // purple nebula neon glow
          auraGrad.addColorStop(1, `rgba(11, 18, 32, 0)`);
          
          ctx.fillStyle = auraGrad;
          ctx.fillRect(0, 0, width, height);
        } 
        else if (state.activeEffect === "sky_festival") {
          // Warm vibrant sunset atmospheric horizon backplate
          const p = state.globalOpacity;
          const sunsetGrad = ctx.createLinearGradient(0, 0, 0, height);
          sunsetGrad.addColorStop(0, `rgba(49, 16, 63, ${0.45 * p})`); // Deep twilight
          sunsetGrad.addColorStop(0.4, `rgba(244, 63, 94, ${0.20 * p})`); // Crimson cloud
          sunsetGrad.addColorStop(1, `rgba(249, 115, 22, ${0.25 * p})`); // Amber glow
          
          ctx.fillStyle = sunsetGrad;
          ctx.fillRect(0, 0, width, height);

          // Render stylized drifting cloud shapes
          ctx.fillStyle = `rgba(255, 255, 255, ${0.04 * p})`;
          const cloudTime = now * 0.00005;
          ctx.beginPath();
          // Cluster 1
          const c1X = (cloudTime * 50) % (width + 300) - 150;
          ctx.arc(c1X, height * 0.35, 90, 0, Math.PI * 2);
          ctx.arc(c1X + 80, height * 0.32, 110, 0, Math.PI * 2);
          ctx.arc(c1X + 160, height * 0.35, 80, 0, Math.PI * 2);
          // Cluster 2
          const c2X = ((cloudTime * 30 + 300) % (width + 400)) - 150;
          ctx.arc(c2X, height * 0.65, 120, 0, Math.PI * 2);
          ctx.arc(c2X + 100, height * 0.62, 140, 0, Math.PI * 2);
          ctx.fill();
        } 
        else if (state.activeEffect === "chaos") {
          // Stormy lightning overlay check
          const p = state.globalOpacity;
          const lightningChance = Math.random() < 0.004 && !state.prefersReducedMotion;
          if (lightningChance && state.lightningFlashDuration === 0) {
            state.lightningFlashDuration = 5 + Math.floor(Math.random() * 8); // frames count
            audioSynth.playLightning();
          }

          if (state.lightningFlashDuration > 0) {
            state.lightningFlashDuration--;
            // Full-screen structural purple/white lightning discharge!
            ctx.fillStyle = `rgba(224, 231, 255, ${0.35 * Math.random() * p})`;
            ctx.fillRect(0, 0, width, height);
          } else {
            // Moody dark storm backdrop
            ctx.fillStyle = `rgba(15, 23, 42, ${0.28 * p})`;
            ctx.fillRect(0, 0, width, height);
          }
        }
        else if (state.activeEffect === "galaxy") {
          // Swirling starlit neon central nebula core
          const p = state.globalOpacity;
          const radialNebula = ctx.createRadialGradient(
            width / 2, 
            height / 2, 
            10, 
            width / 2, 
            height / 2, 
            Math.min(width, height) * 0.5
          );
          radialNebula.addColorStop(0, `rgba(236, 72, 153, ${0.15 * p})`); // neon pink
          radialNebula.addColorStop(0.5, `rgba(6, 182, 212, ${0.10 * p})`); // blue cyan
          radialNebula.addColorStop(1, "rgba(8, 11, 22, 0)");
          
          ctx.fillStyle = radialNebula;
          ctx.fillRect(0, 0, width, height);
        }
      }

      // --- PARTICLE SIMULATE & RENDER BLOCKS ---
      let renderableCount = 0;

      // 1. WINTER STORM MODE RENDER ENGINE
      if (state.activeEffect === "winter_storm" && state.globalOpacity > 0) {
        const targetCount = Math.floor((width * height) / 10000 * (state.density / 100));
        if (state.isSpawning && state.snowflakes.length < targetCount) {
          if (Math.random() < (state.prefersReducedMotion ? 0.06 : 0.25)) {
            state.snowflakes.push(createSnowflake(width, height));
          }
        }

        state.snowflakes = state.snowflakes.filter((sf) => {
          // Wind affect snowflake speeds
          const userWind = state.windForce * 0.45;
          sf.y += sf.speedY;
          sf.angle += sf.spin;
          sf.x += sf.speedX + userWind + Math.sin(sf.y * 0.012) * 0.4;

          const currentOpacity = sf.opacity * state.globalOpacity;
          drawSnowflakeShape(ctx, sf.x, sf.y, sf.radius, sf.angle, currentOpacity, sf.points);

          renderableCount++;
          return sf.y < height + 20 && sf.x > -20 && sf.x < width + 20;
        });
      }

      // 2. SKY FESTIVAL MODE RENDER ENGINE
      else if (state.activeEffect === "sky_festival" && state.globalOpacity > 0) {
        const targetCount = Math.floor(width / 50 * (state.density / 100));
        if (state.isSpawning && state.balloons.length < targetCount) {
          if (Math.random() < (state.prefersReducedMotion ? 0.03 : 0.12)) {
            state.balloons.push(createBalloon(width, height));
          }
        }

        state.balloons = state.balloons.filter((bl) => {
          if (bl.isPopping) {
            // Popping sequence
            bl.popProgress += 0.15;
            if (bl.popProgress >= 1.0) return false; // delete cleanly
            
            // Render popping circle expander
            ctx.save();
            ctx.beginPath();
            ctx.scale(1, 0.9);
            ctx.arc(bl.x, bl.y / 0.9, bl.width * (1.1 + bl.popProgress * 0.9), 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${bl.hue}, 95%, 60%, ${1.0 - bl.popProgress})`;
            ctx.lineWidth = 3.5;
            ctx.stroke();
            ctx.restore();
            return true;
          }

          const userOffset = state.windForce * 0.25;
          bl.y += bl.speedY;
          bl.x += userOffset + Math.sin(now * bl.swayFreq + bl.swayOffset) * 0.5;

          drawBalloonShape(ctx, bl, now);
          renderableCount++;

          return bl.y > -bl.height - bl.stringLength - 30;
        });
      }

      // 3. CHAOS MODE STORM ENGINE
      else if (state.activeEffect === "chaos" && state.globalOpacity > 0) {
        const targetCount = Math.floor((width * height) / 5000 * (state.density / 100));
        if (state.isSpawning && state.rainLines.length < targetCount) {
          state.rainLines.push(createRainLine(width, height));
          state.rainLines.push(createRainLine(width, height));
        }

        // Heavy wind force moves rainwater steep sideways
        state.rainLines = state.rainLines.filter((rl) => {
          const lateralWind = state.windForce * 1.5;
          rl.y += rl.speedY;
          rl.x += rl.speedX + lateralWind - 2.5; // continuous storm drift

          ctx.save();
          ctx.beginPath();
          ctx.strokeStyle = `rgba(186, 230, 253, ${rl.opacity * state.globalOpacity})`;
          ctx.lineWidth = rl.width;
          ctx.moveTo(rl.x, rl.y);
          ctx.lineTo(rl.x + (lateralWind - 2.5), rl.y + rl.length);
          ctx.stroke();
          ctx.restore();

          renderableCount++;
          return rl.y < height + 30 && rl.x > -40 && rl.x < width + 40;
        });
      }

      // 4. GALAXY COSMIC ENGINE
      else if (state.activeEffect === "galaxy" && state.globalOpacity > 0) {
        const targetStars = Math.floor(130 * (state.density / 100));
        if (state.isSpawning && state.stars.length < targetStars) {
          state.stars.push(createStar(width, height));
        }

        const centerPoint = { x: width / 2, y: height / 2 };

        state.stars = state.stars.filter((star) => {
          // Circular orbits around center
          star.angle += star.speed * (state.prefersReducedMotion ? 0.25 : 1.0);
          
          let targetDistance = star.distance;
          let calculatedX = centerPoint.x + Math.cos(star.angle) * targetDistance;
          let calculatedY = centerPoint.y + Math.sin(star.angle) * targetDistance;

          // Mouse Gravitational Pull vectors triggers warp trail
          if (state.isPointerWithin && !state.prefersReducedMotion) {
            const pullDx = state.pointerX - calculatedX;
            const pullDy = state.pointerY - calculatedY;
            const pullDist = Math.hypot(pullDx, pullDy);
            if (pullDist < 250) {
              const strength = (250 - pullDist) / 250 * 0.45; // peak gravity
              calculatedX += pullDx * strength;
              calculatedY += pullDy * strength;
            }
          }

          star.x = calculatedX;
          star.y = calculatedY;

          // Track tail trails
          if (!state.prefersReducedMotion) {
            star.trail.push({ x: star.x, y: star.y });
            if (star.trail.length > 5) star.trail.shift();
          }

          const currentOpacity = star.opacity * state.globalOpacity;

          // Render trails
          if (star.trail.length > 1 && !state.prefersReducedMotion) {
            ctx.beginPath();
            ctx.moveTo(star.trail[0].x, star.trail[0].y);
            for (let t = 1; t < star.trail.length; t++) {
              ctx.lineTo(star.trail[t].x, star.trail[t].y);
            }
            ctx.strokeStyle = `hsla(${star.hue}, 95%, 70%, ${currentOpacity * 0.45})`;
            ctx.lineWidth = star.radius * 0.75;
            ctx.stroke();
          }

          // Main star node
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${star.hue}, 98%, 85%, ${currentOpacity})`;
          ctx.fill();

          renderableCount++;
          return star.x > -50 && star.x < width + 50 && star.y > -50 && star.y < height + 50;
        });
      }

      // 5. FIREWORKS MODE CORE ENGINE
      // Allows launching glowing target projectiles
      state.rockets = state.rockets.filter((rk) => {
        rk.x += (rk.targetX - rk.x) * 0.08;
        rk.y -= rk.speed;

        // Draw tail trail
        rk.tail.push({ x: rk.x, y: rk.y });
        if (rk.tail.length > 12) rk.tail.shift();

        ctx.beginPath();
        if (rk.tail.length > 1) {
          ctx.moveTo(rk.tail[0].x, rk.tail[0].y);
          for (let ti = 1; ti < rk.tail.length; ti++) {
            ctx.lineTo(rk.tail[ti].x, rk.tail[ti].y);
          }
          ctx.strokeStyle = `hsla(${rk.hue}, 90%, 65%, ${rk.opacity * state.globalOpacity})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        // Trigger burst on target proximity
        if (rk.y <= rk.targetY + 15 || rk.y < 30) {
          spawnExplosionSparks(rk.x, rk.y, rk.hue);
          return false;
        }

        renderableCount++;
        return true;
      });

      // 6. SHARED SPARK DEBRIS REUSABLE BUFFER RENDERER
      state.fireworkSparks = state.fireworkSparks.filter((sk) => {
        sk.x += sk.vx;
        sk.y += sk.vy;
        sk.vy += 0.08; // subtle realistic gravity drag
        sk.opacity -= sk.decay;

        ctx.beginPath();
        ctx.arc(sk.x, sk.y, sk.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${sk.hue}, 95%, 75%, ${sk.opacity * state.globalOpacity})`;
        ctx.fill();

        renderableCount++;
        return sk.opacity > 0;
      });

      // 7. MULTIPLIER INTERACTIVE SCORE SHARDS
      state.floats = state.floats.filter((ft) => {
        ft.y -= 1.1; // slow rising ascent
        ft.opacity -= 0.02;

        ctx.font = 'bold 11px "Orbitron", "SF Pro", sans-serif';
        ctx.fillStyle = ft.color.replace(", 1)", `, ${ft.opacity * state.globalOpacity})`);
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);

        return ft.opacity > 0;
      });

      ctx.restore();

      // Trigger performance instrumentation updates inside parent container
      onUpdateMetrics(
        state.currentFPS, 
        renderableCount, 
        Math.round(state.windForce * 12)
      );

      animationId = requestAnimationFrame(updateAndRender);
    };

    updateAndRender();

    return () => cancelAnimationFrame(animationId);
  }, [durationMs, onPopBalloon, onUpdateMetrics]);

  return (
    <div
      ref={containerRef}
      id="effects-canvas-container"
      className="absolute inset-0 z-10 w-full h-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        id="effects-interactive-paint"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerLeave}
        className="block w-full h-full cursor-crosshair pointer-events-auto"
      />
    </div>
  );
}

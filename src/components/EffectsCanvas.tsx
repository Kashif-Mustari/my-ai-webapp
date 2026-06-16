import React, { useEffect, useRef, useState } from "react";

interface EffectsCanvasProps {
  activeEffect: "snowflakes" | "balloons" | "none";
  triggerTimestamp: number;
  durationMs?: number;
}

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
}

export default function EffectsCanvas({
  activeEffect,
  triggerTimestamp,
  durationMs = 5000,
}: EffectsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Monitor media query for reduced-motion in client environment
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Keep refs for active animation values so the render loop can access the latest state
  const stateRef = useRef({
    activeEffect,
    triggerTimestamp,
    dimensions,
    snowflakes: [] as Snowflake[],
    balloons: [] as Balloon[],
    isSpawning: false,
    globalOpacity: 0, // for canvas fade in/out
    prefersReducedMotion: false,
  });

  // Track prefersReducedMotion changes in state ref
  useEffect(() => {
    stateRef.current.prefersReducedMotion = prefersReducedMotion;
  }, [prefersReducedMotion]);

  // Track dimensions and watch container size
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      const roundedWidth = Math.floor(width);
      const roundedHeight = Math.floor(height);
      
      setDimensions({ width: roundedWidth, height: roundedHeight });
      stateRef.current.dimensions = { width: roundedWidth, height: roundedHeight };
      
      // Update canvas directly to avoid latency
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = roundedWidth;
        canvas.height = roundedHeight;
      }
    });

    observer.observe(containerRef.current);
    
    // Initial size
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });
    stateRef.current.dimensions = { width: rect.width, height: rect.height };
    if (canvasRef.current) {
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
    }

    return () => observer.disconnect();
  }, []);

  // Update active effect state ref when props change
  useEffect(() => {
    const elapsed = Date.now() - triggerTimestamp;
    const isWithinDuration = elapsed < durationMs;

    stateRef.current.activeEffect = activeEffect;
    stateRef.current.triggerTimestamp = triggerTimestamp;
    stateRef.current.isSpawning = activeEffect !== "none" && isWithinDuration;

    if (activeEffect !== "none") {
      stateRef.current.globalOpacity = 1;

      // Seed particles immediately for instant visual feedback on click
      const { width, height } = stateRef.current.dimensions;
      if (activeEffect === "snowflakes") {
        stateRef.current.balloons = [];
        // Pre-populate some snowflakes across the screen
        const initialSnowflakes: Snowflake[] = [];
        const count = Math.floor((width * height) / 18000); // density-based
        for (let i = 0; i < count; i++) {
          initialSnowflakes.push(createSnowflake(width, height, true));
        }
        stateRef.current.snowflakes = initialSnowflakes;
      } else if (activeEffect === "balloons") {
        stateRef.current.snowflakes = [];
        // Pre-populate some balloons from the lower half of screen up
        const initialBalloons: Balloon[] = [];
        const count = Math.floor(width / 70); // density-based
        for (let i = 0; i < count; i++) {
          initialBalloons.push(createBalloon(width, height, true));
        }
        stateRef.current.balloons = initialBalloons;
      }
    }
  }, [activeEffect, triggerTimestamp, durationMs]);

  // Create a single snowflake object
  const createSnowflake = (width: number, height: number, randomizeY = false): Snowflake => {
    const isReduced = stateRef.current.prefersReducedMotion;
    // Medium sizes: 13px - 22px
    const radius = 6 + Math.random() * 6; 
    return {
      x: Math.random() * width,
      y: randomizeY ? Math.random() * height : -20,
      radius,
      speedY: (1.2 + Math.random() * 1.8) * (isReduced ? 0.35 : 1.0),
      speedX: (-0.5 + Math.random() * 1.0) * (isReduced ? 0.1 : 1.0),
      angle: isReduced ? 0 : Math.random() * Math.PI * 2,
      spin: isReduced ? 0 : -0.01 + Math.random() * 0.02,
      opacity: 0.4 + Math.random() * 0.6,
      points: Math.random() > 0.3 ? 6 : 8,
    };
  };

  // Create a single balloon object
  const createBalloon = (width: number, height: number, randomizeY = false): Balloon => {
    const isReduced = stateRef.current.prefersReducedMotion;
    // Elegant, formal colors: Sapphire Slate Blue, Autumn Amber, Rose Crimson, Emerald Teal, Platinum Violet
    const formalPalettes = [
      { h: 215, s: 65, l: 45 }, // Sapphire Slate
      { h: 36, s: 70, l: 48 },  // Autumn Amber
      { h: 345, s: 68, l: 45 }, // Rose Crimson
      { h: 162, s: 50, l: 38 }, // Emerald Teal
      { h: 265, s: 35, l: 46 }, // Platinum Violet
    ];
    const item = formalPalettes[Math.floor(Math.random() * formalPalettes.length)];
    
    // Medium sizes: width 24px - 34px, height 30px - 44px
    const w = 24 + Math.random() * 10;
    const h = w * (1.2 + Math.random() * 0.15);

    return {
      x: Math.random() * width,
      y: randomizeY ? height - Math.random() * (height * 0.75) : height + 50,
      width: w,
      height: h,
      hue: item.h,
      sat: item.s,
      light: item.l,
      speedY: (-1.0 - Math.random() * 1.5) * (isReduced ? 0.35 : 1.0),
      speedX: 0,
      swayAmp: isReduced ? 0 : 10 + Math.random() * 15,
      swayFreq: isReduced ? 0 : 0.005 + Math.random() * 0.008,
      swayOffset: Math.random() * Math.PI * 2,
      opacity: 0.85 + Math.random() * 0.15,
      stringLength: 30 + Math.random() * 15,
    };
  };

  // Render loop
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Drawing helper for gorgeous geometric snowflake
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
      
      // Beautiful crisp shadow to make snowflakes pop in any climate contrast state
      c.shadowColor = `rgba(10, 15, 30, ${opacity * 0.5})`;
      c.shadowBlur = 5;
      c.shadowOffsetX = 1;
      c.shadowOffsetY = 2;

      c.strokeStyle = `rgba(224, 242, 254, ${opacity})`; // Soft sky-blue glow
      c.lineWidth = radius * 0.16; // Elegant high-definition visual stroke width
      c.lineCap = "round";

      c.beginPath();
      for (let i = 0; i < points; i++) {
        const branchAngle = (i * Math.PI * 2) / points;
        const rx = Math.cos(branchAngle) * radius;
        const ry = Math.sin(branchAngle) * radius;

        // Main branch line
        c.moveTo(0, 0);
        c.lineTo(rx, ry);

        // Side branches (V-shape sub-branches)
        const subLength = radius * 0.35;
        const subAngle = Math.PI / 4;

        // Position nodes along branch
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
      
      // Draw smooth icy solid center
      c.beginPath();
      c.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
      c.fillStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
      c.fill();
      c.restore();
    };

    // Drawing helper for glossy 3D balloon
    const drawBalloonShape = (
      c: CanvasRenderingContext2D,
      b: Balloon,
      time: number
    ) => {
      c.save();
      c.translate(b.x, b.y);

      const computedOpacity = b.opacity * stateRef.current.globalOpacity;

      // Draw wavy basket string from bottom of balloon
      c.beginPath();
      c.moveTo(0, b.height / 2);
      const swayOffset = Math.sin(time * 0.005 + b.swayOffset) * 6;
      c.bezierCurveTo(
        swayOffset / 2, b.height / 2 + b.stringLength * 0.3,
        -swayOffset / 2, b.height / 2 + b.stringLength * 0.6,
        swayOffset, b.height / 2 + b.stringLength
      );
      c.strokeStyle = `rgba(148, 163, 184, ${computedOpacity * 0.55})`; // Slate string
      c.lineWidth = 1.2;
      c.stroke();

      // Balloon body (symmetric egg curve)
      c.beginPath();
      c.moveTo(0, -b.height / 2); // Core Top Center
      
      // Symmetrical bezier curves for premium look
      c.bezierCurveTo(-b.width * 0.65, -b.height / 2, -b.width * 0.65, b.height / 2, 0, b.height / 2);
      c.bezierCurveTo(b.width * 0.65, b.height / 2, b.width * 0.65, -b.height / 2, 0, -b.height / 2);
      
      // 3D glossy highlight layout
      const radialGrad = c.createRadialGradient(
        -b.width * 0.15, -b.height * 0.15, b.width * 0.08, 
        0, 0, b.width * 0.6
      );
      
      // Create rich color values
      const baseColor = `hsla(${b.hue}, ${b.sat}%, ${b.light}%, ${computedOpacity})`;
      const highlightColor = `hsla(${b.hue}, ${b.sat}%, ${b.light + 22}%, ${computedOpacity})`;
      const shadowColor = `hsla(${b.hue}, ${b.sat}%, ${b.light - 18}%, ${computedOpacity})`;
      
      radialGrad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
      radialGrad.addColorStop(0.12, highlightColor);
      radialGrad.addColorStop(0.7, baseColor);
      radialGrad.addColorStop(1, shadowColor);
      
      c.fillStyle = radialGrad;
      c.fill();

      // Small tie triangle at the bottom of the balloon sphere
      c.beginPath();
      c.moveTo(0, b.height / 2);
      c.lineTo(-b.width * 0.09, b.height / 2 + 3);
      c.lineTo(b.width * 0.09, b.height / 2 + 3);
      c.closePath();
      c.fillStyle = `hsla(${b.hue}, ${b.sat}%, ${b.light - 10}%, ${computedOpacity})`;
      c.fill();

      // Subtle reflection highlight on the opposite side
      c.restore();
    };

    const updateAndRender = () => {
      const now = Date.now();
      const state = stateRef.current;
      const { width, height } = state.dimensions;

      // Handle timer limits
      const elapsed = now - state.triggerTimestamp;
      if (state.activeEffect !== "none" && elapsed >= durationMs) {
        state.isSpawning = false;
        // Slowly fade the canvas out once the 5 seconds is up
        state.globalOpacity -= 0.02;
        if (state.globalOpacity <= 0) {
          state.globalOpacity = 0;
          state.activeEffect = "none";
          state.snowflakes = [];
          state.balloons = [];
        }
      }

      ctx.clearRect(0, 0, width, height);

      if (state.activeEffect === "snowflakes" && state.globalOpacity > 0) {
        // Handle spawning snowflake particles
        const maxSnowflakes = Math.floor((width * height) / (state.prefersReducedMotion ? 25000 : 10000));
        if (state.isSpawning && state.snowflakes.length < maxSnowflakes) {
          // Soft throttle
          if (Math.random() < (state.prefersReducedMotion ? 0.08 : 0.2)) {
            state.snowflakes.push(createSnowflake(width, height));
          }
        }

        // Render, fall and sway
        state.snowflakes = state.snowflakes.filter((sf) => {
          sf.y += sf.speedY;
          sf.angle += sf.spin;
          // Apply horizontal sinusoidal drift
          sf.x += sf.speedX + Math.sin(sf.y * 0.015) * 0.5;

          const currentOpacity = sf.opacity * state.globalOpacity;
          drawSnowflakeShape(ctx, sf.x, sf.y, sf.radius, sf.angle, currentOpacity, sf.points);

          // Return true if still inside screen
          return sf.y < height + 20 && sf.x > -20 && sf.x < width + 20;
        });
      } else if (state.activeEffect === "balloons" && state.globalOpacity > 0) {
        // Handle spawning balloon particles
        const maxBalloons = Math.floor(width / (state.prefersReducedMotion ? 110 : 45));
        if (state.isSpawning && state.balloons.length < maxBalloons) {
          if (Math.random() < (state.prefersReducedMotion ? 0.05 : 0.15)) {
            state.balloons.push(createBalloon(width, height));
          }
        }

        // Render, float upwards and sway back and forth
        state.balloons = state.balloons.filter((bl) => {
          bl.y += bl.speedY;
          
          // Sway mathematically using horizontal sine wave
          bl.x += Math.sin(now * bl.swayFreq + bl.swayOffset) * 0.55;

          drawBalloonShape(ctx, bl, now);

          // Return true if still within viewer borders (leave string headroom)
          return bl.y > -bl.height - bl.stringLength - 30;
        });
      }

      animationId = requestAnimationFrame(updateAndRender);
    };

    updateAndRender();

    return () => cancelAnimationFrame(animationId);
  }, [durationMs]);

  return (
    <div
      ref={containerRef}
      id="effects-canvas-container"
      className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        id="effects-interactive-paint"
        className="block w-full h-full"
      />
    </div>
  );
}

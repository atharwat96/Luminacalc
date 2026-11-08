import React, { useEffect, useRef } from 'react';
import { ThemeConfig } from '../utils/theme';

export interface ParticleEvent {
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  type: 'digit' | 'operator' | 'equals' | 'clear' | 'ambient';
  intensity?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  glow: number;
}

interface LaserArc {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
  color: string;
  width: number;
  alpha: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

interface ParticleCanvasProps {
  theme: ThemeConfig;
  lightIntensity: 'max' | 'normal' | 'subtle' | 'off';
  onRegisterEmitter?: (emit: (event: ParticleEvent) => void) => void;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  theme,
  lightIntensity,
  onRegisterEmitter,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lasersRef = useRef<LaserArc[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const emitEvent = (event: ParticleEvent) => {
      if (lightIntensity === 'off') return;

      const rect = canvas.getBoundingClientRect();
      const relX = event.x - rect.left;
      const relY = event.y - rect.top;
      const palette = theme.particleColors;

      const intensityMult =
        lightIntensity === 'max' ? 1.6 : lightIntensity === 'subtle' ? 0.5 : 1.0;

      // 1. Sparkle Particles
      const count =
        event.type === 'equals'
          ? Math.round(45 * intensityMult)
          : event.type === 'clear'
          ? Math.round(30 * intensityMult)
          : Math.round(18 * intensityMult);

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed =
          event.type === 'equals'
            ? (Math.random() * 8 + 3) * intensityMult
            : (Math.random() * 5 + 1.5) * intensityMult;
        const color = palette[Math.floor(Math.random() * palette.length)];

        particlesRef.current.push({
          x: relX,
          y: relY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (event.type === 'equals' ? 1.5 : 0.5),
          size: Math.random() * 3 + 1.5,
          color,
          alpha: 1.0,
          maxLife: Math.random() * 25 + 25,
          life: 0,
          glow: Math.random() * 10 + 6,
        });
      }

      // 2. Laser Arc to display if target is given
      if (event.targetX !== undefined && event.targetY !== undefined) {
        const targetRelX = event.targetX - rect.left;
        const targetRelY = event.targetY - rect.top;

        lasersRef.current.push({
          startX: relX,
          startY: relY,
          endX: targetRelX,
          endY: targetRelY,
          progress: 0,
          color: theme.primaryGlow,
          width: event.type === 'equals' ? 4 : 2.5,
          alpha: 1.0,
        });
      }

      // 3. Shockwave rings on Equals or Clear
      if (event.type === 'equals' || event.type === 'clear') {
        shockwavesRef.current.push({
          x: relX,
          y: relY,
          radius: 10,
          maxRadius: event.type === 'equals' ? 180 : 120,
          color: event.type === 'equals' ? theme.accentEquals : theme.accentClear,
          alpha: 0.9,
        });
      }
    };

    if (onRegisterEmitter) {
      onRegisterEmitter(emitEvent);
    }

    // Animation Loop
    let lastTime = performance.now();
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.66, 2);
      lastTime = time;

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Render & update shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += 5 * dt;
        sw.alpha -= 0.025 * dt;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwavesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha * 0.7;
        ctx.lineWidth = 3;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();
      }

      // Render & update laser arcs
      for (let i = lasersRef.current.length - 1; i >= 0; i--) {
        const laser = lasersRef.current[i];
        laser.progress += 0.08 * dt;
        laser.alpha -= 0.035 * dt;

        if (laser.alpha <= 0 || laser.progress >= 1) {
          lasersRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(laser.startX, laser.startY);

        // Add a slight lightning jag midpoint
        const midX = (laser.startX + laser.endX) / 2 + (Math.random() - 0.5) * 20;
        const midY = (laser.startY + laser.endY) / 2 + (Math.random() - 0.5) * 20;

        ctx.quadraticCurveTo(midX, midY, laser.endX, laser.endY);
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = laser.width;
        ctx.globalAlpha = Math.max(0, laser.alpha);
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 12;
        ctx.stroke();

        // White hot inner core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1, laser.width * 0.4);
        ctx.stroke();
        ctx.restore();
      }

      // Render & update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.08 * dt; // Gravity
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife || p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size * (1 - p.life / p.maxLife)), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.glow;
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [theme, lightIntensity, onRegisterEmitter]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30 w-full h-full"
      style={{ overflow: 'hidden' }}
    />
  );
};

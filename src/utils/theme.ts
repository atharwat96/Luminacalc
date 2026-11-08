/**
 * Theme & Light Presets for LuminaCalc
 */

export type ThemeId = 'cyber' | 'chroma' | 'matrix' | 'sunset' | 'quantum';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  badge: string;
  primaryGlow: string;       // Primary glowing color hex
  secondaryGlow: string;     // Secondary accent color hex
  accentEquals: string;      // Color for '=' button & compute highlight
  accentClear: string;       // Color for 'AC' / 'C'
  accentOperator: string;    // Color for +, -, *, /
  chassisBg: string;         // Calculator body bg
  displayBg: string;         // Screen display container bg
  keyBg: string;             // Number keys bg
  keyOperatorBg: string;     // Operator keys bg
  textColor: string;         // Primary text
  particleColors: string[];  // Colors used for sparks & laser bursts
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon',
    badge: 'CYBER',
    primaryGlow: '#00f3ff',      // Neon cyan
    secondaryGlow: '#ff0077',    // Hot magenta
    accentEquals: '#00f3ff',
    accentClear: '#ff0055',
    accentOperator: '#ff0077',
    chassisBg: 'from-slate-950 via-zinc-950 to-slate-900',
    displayBg: 'bg-black/80',
    keyBg: 'bg-zinc-900/80 hover:bg-zinc-800/90 active:bg-zinc-700',
    keyOperatorBg: 'bg-fuchsia-950/40 hover:bg-fuchsia-900/60 active:bg-fuchsia-800',
    textColor: 'text-cyan-400',
    particleColors: ['#00f3ff', '#ff0077', '#7b2cbf', '#ffffff', '#00b4d8'],
  },
  chroma: {
    id: 'chroma',
    name: 'RGB Chroma',
    badge: 'CHROMA',
    primaryGlow: '#00ff66',      // Razer/Chroma bright green
    secondaryGlow: '#ffaa00',    // Bright orange
    accentEquals: '#00ff66',
    accentClear: '#ff3366',
    accentOperator: '#3a86ff',
    chassisBg: 'from-zinc-950 via-neutral-950 to-black',
    displayBg: 'bg-black/90',
    keyBg: 'bg-neutral-900/80 hover:bg-neutral-800/90 active:bg-neutral-700',
    keyOperatorBg: 'bg-sky-950/40 hover:bg-sky-900/60 active:bg-sky-800',
    textColor: 'text-emerald-400',
    particleColors: ['#00ff66', '#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'],
  },
  matrix: {
    id: 'matrix',
    name: 'Emerald Matrix',
    badge: 'MATRIX',
    primaryGlow: '#10b981',      // Phosphor green
    secondaryGlow: '#34d399',    // Mint
    accentEquals: '#10b981',
    accentClear: '#ef4444',
    accentOperator: '#059669',
    chassisBg: 'from-stone-950 via-neutral-950 to-emerald-950/30',
    displayBg: 'bg-emerald-950/20',
    keyBg: 'bg-stone-900/80 hover:bg-stone-800/90 active:bg-stone-700',
    keyOperatorBg: 'bg-emerald-950/30 hover:bg-emerald-900/50 active:bg-emerald-800',
    textColor: 'text-emerald-300',
    particleColors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#047857'],
  },
  sunset: {
    id: 'sunset',
    name: 'Synth Sunset',
    badge: 'SUNSET',
    primaryGlow: '#ff5e7e',      // Hot Sunset Pink
    secondaryGlow: '#ffaa00',    // Golden Amber
    accentEquals: '#ff9900',
    accentClear: '#ff2a5f',
    accentOperator: '#c77dff',
    chassisBg: 'from-violet-950/80 via-slate-950 to-purple-950/60',
    displayBg: 'bg-purple-950/30',
    keyBg: 'bg-purple-950/30 hover:bg-purple-900/50 active:bg-purple-800',
    keyOperatorBg: 'bg-pink-950/30 hover:bg-pink-900/50 active:bg-pink-800',
    textColor: 'text-amber-300',
    particleColors: ['#ff5e7e', '#ffaa00', '#c77dff', '#ff007f', '#ffd166'],
  },
  quantum: {
    id: 'quantum',
    name: 'Quantum Ice',
    badge: 'OLED ICE',
    primaryGlow: '#38bdf8',      // Arctic Sky Blue
    secondaryGlow: '#818cf8',    // Indigo Light
    accentEquals: '#38bdf8',
    accentClear: '#f43f5e',
    accentOperator: '#818cf8',
    chassisBg: 'from-slate-950 via-neutral-950 to-slate-900',
    displayBg: 'bg-slate-950/80',
    keyBg: 'bg-slate-900/70 hover:bg-slate-800/80 active:bg-slate-700',
    keyOperatorBg: 'bg-indigo-950/40 hover:bg-indigo-900/50 active:bg-indigo-800',
    textColor: 'text-sky-300',
    particleColors: ['#38bdf8', '#818cf8', '#e0e7ff', '#67e8f9', '#ffffff'],
  },
};

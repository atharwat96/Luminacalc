import React, { useState, useEffect, useRef } from 'react';
import { ThemeConfig } from '../utils/theme';
import { Copy, Check, History, Delete } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface DisplayProps {
  expression: string;
  display: string;
  error: string | null;
  memory: number;
  theme: ThemeConfig;
  isProcessing: boolean;
  onBackspace: () => void;
  onToggleHistory: () => void;
  displayRef: React.RefObject<HTMLDivElement | null>;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  display,
  error,
  memory,
  theme,
  isProcessing,
  onBackspace,
  onToggleHistory,
  displayRef,
}) => {
  const [copied, setCopied] = useState(false);
  const [scrambleText, setScrambleText] = useState(display);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(16).fill(0));
  const vuAnimRef = useRef<number | null>(null);

  // Audio VU bar reactive animation
  useEffect(() => {
    let active = true;
    const updateVU = () => {
      if (!active) return;
      if (soundEngine.analyser) {
        const bufferLength = soundEngine.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        soundEngine.analyser.getByteFrequencyData(dataArray);

        // Map to 16 bars
        const bars: number[] = [];
        const step = Math.floor(bufferLength / 16);
        for (let i = 0; i < 16; i++) {
          const val = dataArray[i * step] || 0;
          bars.push(val / 255);
        }
        setAudioLevels(bars);
      } else if (isProcessing) {
        // Fallback procedural pulse when processing
        setAudioLevels(
          Array.from({ length: 16 }, () => Math.random() * 0.8 + 0.2)
        );
      } else {
        // Decay to zero
        setAudioLevels(prev => prev.map(v => Math.max(0, v * 0.85)));
      }

      vuAnimRef.current = requestAnimationFrame(updateVU);
    };

    vuAnimRef.current = requestAnimationFrame(updateVU);
    return () => {
      active = false;
      if (vuAnimRef.current) cancelAnimationFrame(vuAnimRef.current);
    };
  }, [isProcessing]);

  // Digit scramble roll effect during processing
  useEffect(() => {
    if (isProcessing) {
      let frame = 0;
      const chars = '0123456789+-*/=';
      const interval = setInterval(() => {
        frame++;
        if (frame > 6) {
          clearInterval(interval);
          setScrambleText(display);
        } else {
          const scrambled = display
            .split('')
            .map(c => (/[0-9]/.test(c) ? chars[Math.floor(Math.random() * chars.length)] : c))
            .join('');
          setScrambleText(scrambled);
        }
      }, 30);
      return () => clearInterval(interval);
    } else {
      setScrambleText(display);
    }
  }, [isProcessing, display]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Font size responsive scaling
  const getFontSize = (text: string) => {
    const len = text.length;
    if (len <= 7) return 'text-4xl sm:text-5xl';
    if (len <= 11) return 'text-3xl sm:text-4xl';
    if (len <= 15) return 'text-2xl sm:text-3xl';
    return 'text-xl sm:text-2xl';
  };

  return (
    <div
      ref={displayRef}
      className={`relative w-full rounded-2xl p-4 sm:p-5 overflow-hidden border backdrop-blur-md transition-all duration-300 shadow-2xl ${theme.displayBg}`}
      style={{
        borderColor: `${theme.primaryGlow}50`,
        boxShadow: isProcessing
          ? `0 0 35px ${theme.primaryGlow}60, inset 0 0 25px ${theme.primaryGlow}30`
          : `0 0 20px ${theme.primaryGlow}25, inset 0 0 15px ${theme.primaryGlow}15`,
      }}
    >
      {/* Laser scanline sweep during processing */}
      {isProcessing && (
        <div
          className="absolute inset-x-0 h-1 z-20 pointer-events-none animate-pulse"
          style={{
            background: `linear-gradient(90deg, transparent, #ffffff, ${theme.primaryGlow}, transparent)`,
            top: '50%',
            transform: 'translateY(-50%)',
            boxShadow: `0 0 15px 3px ${theme.primaryGlow}`,
          }}
        />
      )}

      {/* Top Header: Equalizer VU Bars & Status Flags */}
      <div className="flex items-center justify-between mb-3 text-xs tracking-wider select-none">
        {/* VU Light Equalizer */}
        <div className="flex items-end gap-1 h-3 px-1 py-0.5 rounded bg-black/60 border border-white/5">
          {audioLevels.map((lvl, idx) => {
            const heightPct = Math.max(15, lvl * 100);
            return (
              <div
                key={idx}
                className="w-1 rounded-xs transition-all duration-75"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor:
                    lvl > 0.8
                      ? theme.accentClear
                      : lvl > 0.5
                      ? theme.secondaryGlow
                      : theme.primaryGlow,
                  boxShadow: lvl > 0.3 ? `0 0 4px ${theme.primaryGlow}` : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Status flags & Action buttons */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {memory !== 0 && (
            <span
              className="px-1.5 py-0.5 rounded font-bold border animate-pulse"
              style={{
                borderColor: `${theme.primaryGlow}80`,
                color: theme.primaryGlow,
                backgroundColor: `${theme.primaryGlow}15`,
              }}
              title={`Memory stored: ${memory}`}
            >
              M: {memory}
            </span>
          )}

          <span className="text-zinc-500 font-semibold uppercase">{theme.badge}</span>

          <button
            type="button"
            onClick={onToggleHistory}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="History Tape"
            aria-label="Open calculation history"
          >
            <History className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
            title="Copy Result"
            aria-label="Copy result"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Secondary Expression Line */}
      <div className="min-h-[22px] flex items-center justify-end px-1 overflow-x-auto scrollbar-none">
        <span
          className="font-mono text-sm tracking-wide text-zinc-400/90 whitespace-nowrap"
          style={{ textShadow: `0 0 6px ${theme.primaryGlow}30` }}
        >
          {expression || '\u00A0'}
        </span>
      </div>

      {/* Main Digital Display Line */}
      <div className="flex items-baseline justify-between mt-1 gap-2">
        <button
          type="button"
          onClick={onBackspace}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 active:scale-95 transition-all self-end mb-1"
          title="Backspace"
          aria-label="Backspace"
        >
          <Delete className="w-4 h-4" />
        </button>

        <div className="flex-1 text-right overflow-x-auto scrollbar-none py-1">
          <span
            className={`font-mono font-bold tracking-tight select-all transition-all duration-150 inline-block ${getFontSize(
              display
            )} ${error ? 'text-rose-400' : theme.textColor}`}
            style={{
              textShadow: error
                ? '0 0 16px rgba(244,63,94,0.7), 0 0 30px rgba(244,63,94,0.4)'
                : isProcessing
                ? `0 0 20px ${theme.primaryGlow}, 0 0 35px #ffffff`
                : `0 0 12px ${theme.primaryGlow}80, 0 0 25px ${theme.primaryGlow}40`,
            }}
          >
            {scrambleText}
          </span>
        </div>
      </div>
    </div>
  );
};

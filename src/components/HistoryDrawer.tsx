import React from 'react';
import { CalculationHistoryItem } from '../utils/calculator';
import { ThemeConfig } from '../utils/theme';
import { Trash2, X, RotateCcw, Clock } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryItem[];
  onSelectResult: (result: string) => void;
  onClearHistory: () => void;
  theme: ThemeConfig;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectResult,
  onClearHistory,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Calculation History Tape"
      className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md rounded-3xl p-5 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200 border"
      style={{ borderColor: `${theme.primaryGlow}40` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: theme.primaryGlow }} />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-200">
            Calculation Tape
          </h2>
        </div>
        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
              title="Clear All History"
              aria-label="Clear All History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close History"
            aria-label="Close calculation history"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 scrollbar-thin">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 text-sm py-12">
            <Clock className="w-8 h-8 mb-2 opacity-30" />
            <p>No previous calculations yet.</p>
            <p className="text-xs text-zinc-600 mt-1">
              Your calculations will appear here.
            </p>
          </div>
        ) : (
          history.map(item => (
            <div
              key={item.id}
              onClick={() => {
                onSelectResult(item.result);
                onClose();
              }}
              className="group p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-white/15 transition-all cursor-pointer flex flex-col items-end"
            >
              <div className="w-full flex items-center justify-between text-xs text-zinc-500 font-mono mb-1">
                <span className="flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                  <RotateCcw className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Tap to reuse
                </span>
                <span>
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              <div className="text-xs text-zinc-400 font-mono tracking-wide">
                {item.expression}
              </div>
              <div
                className="text-lg font-bold font-mono tracking-tight group-hover:scale-105 origin-right transition-transform"
                style={{ color: theme.primaryGlow }}
              >
                {item.result}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-white/10 text-center text-[11px] text-zinc-500 font-mono">
        Showing last {history.length} calculations
      </div>
    </div>
  );
};

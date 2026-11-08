import React, { useRef } from 'react';
import { ThemeConfig } from '../utils/theme';

interface KeypadProps {
  theme: ThemeConfig;
  isScientific: boolean;
  onToggleScientific: () => void;
  onDigit: (digit: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onDecimal: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onOperator: (op: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onEquals: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClear: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onToggleSign: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onPercent: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onUnaryMath: (op: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onMemory: (action: 'MC' | 'MR' | 'M+' | 'M-', e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  theme,
  isScientific,
  onToggleScientific,
  onDigit,
  onDecimal,
  onOperator,
  onEquals,
  onClear,
  onToggleSign,
  onPercent,
  onUnaryMath,
  onMemory,
}) => {
  const keypadContainerRef = useRef<HTMLDivElement | null>(null);

  // Common button classes
  const baseKeyClass =
    'relative group font-mono font-bold select-none cursor-pointer rounded-xl flex items-center justify-center transition-all duration-100 active:scale-[0.96] active:translate-y-0.5 border shadow-md overflow-hidden';

  return (
    <div ref={keypadContainerRef} className="w-full space-y-2.5">
      {/* Memory & Mode Bar */}
      <div className="grid grid-cols-5 gap-1.5 px-0.5 text-xs font-mono font-medium">
        {(['MC', 'MR', 'M-', 'M+'] as const).map(memKey => (
          <button
            key={memKey}
            type="button"
            onClick={e => onMemory(memKey, e)}
            className="h-8 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 active:bg-zinc-700 text-zinc-400 hover:text-white border border-white/5 transition-all text-center flex items-center justify-center"
            aria-label={`Memory ${memKey}`}
          >
            {memKey}
          </button>
        ))}

        <button
          type="button"
          onClick={onToggleScientific}
          className={`h-8 rounded-lg border font-semibold transition-all flex items-center justify-center ${
            isScientific
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
              : 'bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-white border-white/5'
          }`}
          aria-label="Toggle Scientific Functions"
          title="Toggle Scientific keypad"
        >
          {isScientific ? '2nd ON' : '2nd'}
        </button>
      </div>

      {/* Expandable Scientific Math Keys (When 2nd is enabled) */}
      {isScientific && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm animate-in fade-in duration-200">
          {[
            { label: '√', op: '√' },
            { label: 'x²', op: 'x²' },
            { label: '1/x', op: '1/x' },
            { label: 'sin', op: 'sin' },
            { label: 'cos', op: 'cos' },
            { label: 'tan', op: 'tan' },
            { label: 'log', op: 'log' },
            { label: 'ln', op: 'ln' },
            { label: 'π', op: 'π' },
            { label: 'e', op: 'e' },
            { label: 'x^y', op: '^', isBinary: true },
          ].map(item => (
            <button
              key={item.label}
              type="button"
              onClick={e =>
                item.isBinary ? onOperator(item.op, e) : onUnaryMath(item.op, e)
              }
              className="h-9 text-xs font-mono font-semibold rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-cyan-200 hover:text-white border border-cyan-500/20 hover:border-cyan-400/40 transition-all flex items-center justify-center active:scale-95"
              aria-label={`Function ${item.label}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Standard Ordinary Calculator Keypad Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {/* Row 1: AC, +/-, %, ÷ */}
        <button
          type="button"
          onClick={onClear}
          className={`${baseKeyClass} h-13 sm:h-14 text-base sm:text-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 border-rose-500/30 hover:border-rose-400/60 shadow-[0_0_12px_rgba(244,63,94,0.15)]`}
          aria-label="All Clear"
        >
          <span className="relative z-10">AC</span>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${theme.accentClear}30 0%, transparent 70%)`,
            }}
          />
        </button>

        <button
          type="button"
          onClick={onToggleSign}
          className={`${baseKeyClass} h-13 sm:h-14 text-base sm:text-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border-white/10`}
          aria-label="Toggle Sign (+/-)"
        >
          <span className="relative z-10">+/-</span>
        </button>

        <button
          type="button"
          onClick={onPercent}
          className={`${baseKeyClass} h-13 sm:h-14 text-base sm:text-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border-white/10`}
          aria-label="Percentage"
        >
          <span className="relative z-10">%</span>
        </button>

        <button
          type="button"
          onClick={e => onOperator('÷', e)}
          className={`${baseKeyClass} h-13 sm:h-14 text-xl sm:text-2xl ${theme.keyOperatorBg} text-white border-fuchsia-500/30 hover:border-fuchsia-400/60 shadow-[0_0_12px_rgba(217,70,239,0.15)]`}
          style={{ borderColor: `${theme.accentOperator}40` }}
          aria-label="Divide"
        >
          <span className="relative z-10" style={{ color: theme.secondaryGlow }}>
            ÷
          </span>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${theme.accentOperator}25 0%, transparent 70%)`,
            }}
          />
        </button>

        {/* Row 2: 7, 8, 9, × */}
        {['7', '8', '9'].map(d => (
          <button
            key={d}
            type="button"
            onClick={e => onDigit(d, e)}
            className={`${baseKeyClass} h-13 sm:h-14 text-xl sm:text-2xl ${theme.keyBg} text-zinc-100 border-white/10 hover:border-white/20`}
            aria-label={`Digit ${d}`}
          >
            <span className="relative z-10">{d}</span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${theme.primaryGlow}20 0%, transparent 70%)`,
              }}
            />
          </button>
        ))}

        <button
          type="button"
          onClick={e => onOperator('×', e)}
          className={`${baseKeyClass} h-13 sm:h-14 text-xl sm:text-2xl ${theme.keyOperatorBg} text-white border-fuchsia-500/30 hover:border-fuchsia-400/60 shadow-[0_0_12px_rgba(217,70,239,0.15)]`}
          style={{ borderColor: `${theme.accentOperator}40` }}
          aria-label="Multiply"
        >
          <span className="relative z-10" style={{ color: theme.secondaryGlow }}>
            ×
          </span>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${theme.accentOperator}25 0%, transparent 70%)`,
            }}
          />
        </button>

        {/* Row 3: 4, 5, 6, - */}
        {['4', '5', '6'].map(d => (
          <button
            key={d}
            type="button"
            onClick={e => onDigit(d, e)}
            className={`${baseKeyClass} h-13 sm:h-14 text-xl sm:text-2xl ${theme.keyBg} text-zinc-100 border-white/10 hover:border-white/20`}
            aria-label={`Digit ${d}`}
          >
            <span className="relative z-10">{d}</span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${theme.primaryGlow}20 0%, transparent 70%)`,
              }}
            />
          </button>
        ))}

        <button
          type="button"
          onClick={e => onOperator('-', e)}
          className={`${baseKeyClass} h-13 sm:h-14 text-2xl ${theme.keyOperatorBg} text-white border-fuchsia-500/30 hover:border-fuchsia-400/60 shadow-[0_0_12px_rgba(217,70,239,0.15)]`}
          style={{ borderColor: `${theme.accentOperator}40` }}
          aria-label="Subtract"
        >
          <span className="relative z-10" style={{ color: theme.secondaryGlow }}>
            −
          </span>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${theme.accentOperator}25 0%, transparent 70%)`,
            }}
          />
        </button>

        {/* Row 4: 1, 2, 3, + */}
        {['1', '2', '3'].map(d => (
          <button
            key={d}
            type="button"
            onClick={e => onDigit(d, e)}
            className={`${baseKeyClass} h-13 sm:h-14 text-xl sm:text-2xl ${theme.keyBg} text-zinc-100 border-white/10 hover:border-white/20`}
            aria-label={`Digit ${d}`}
          >
            <span className="relative z-10">{d}</span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${theme.primaryGlow}20 0%, transparent 70%)`,
              }}
            />
          </button>
        ))}

        <button
          type="button"
          onClick={e => onOperator('+', e)}
          className={`${baseKeyClass} h-13 sm:h-14 text-2xl ${theme.keyOperatorBg} text-white border-fuchsia-500/30 hover:border-fuchsia-400/60 shadow-[0_0_12px_rgba(217,70,239,0.15)]`}
          style={{ borderColor: `${theme.accentOperator}40` }}
          aria-label="Add"
        >
          <span className="relative z-10" style={{ color: theme.secondaryGlow }}>
            +
          </span>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${theme.accentOperator}25 0%, transparent 70%)`,
            }}
          />
        </button>

        {/* Row 5: 0, 00, ., = */}
        <button
          type="button"
          onClick={e => onDigit('0', e)}
          className={`${baseKeyClass} h-13 sm:h-14 text-xl sm:text-2xl ${theme.keyBg} text-zinc-100 border-white/10 hover:border-white/20`}
          aria-label="Digit 0"
        >
          <span className="relative z-10">0</span>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${theme.primaryGlow}20 0%, transparent 70%)`,
            }}
          />
        </button>

        <button
          type="button"
          onClick={e => onDigit('00', e)}
          className={`${baseKeyClass} h-13 sm:h-14 text-base sm:text-lg ${theme.keyBg} text-zinc-100 border-white/10 hover:border-white/20`}
          aria-label="Double Zero 00"
        >
          <span className="relative z-10">00</span>
        </button>

        <button
          type="button"
          onClick={onDecimal}
          className={`${baseKeyClass} h-13 sm:h-14 text-2xl ${theme.keyBg} text-zinc-100 border-white/10 hover:border-white/20`}
          aria-label="Decimal point"
        >
          <span className="relative z-10">.</span>
        </button>

        {/* Equals (=) - The Hero Compute Button! */}
        <button
          type="button"
          onClick={onEquals}
          className={`${baseKeyClass} h-13 sm:h-14 text-2xl font-black text-black transition-transform duration-75`}
          style={{
            backgroundColor: theme.accentEquals,
            boxShadow: `0 0 20px ${theme.accentEquals}80, 0 0 35px ${theme.accentEquals}40`,
            borderColor: '#ffffff80',
          }}
          aria-label="Calculate Equals"
        >
          <span className="relative z-10 text-black drop-shadow-sm font-extrabold">=</span>
          <div
            className="absolute inset-0 animate-pulse pointer-events-none opacity-40"
            style={{
              background: `radial-gradient(circle, #ffffff 10%, transparent 70%)`,
            }}
          />
        </button>
      </div>
    </div>
  );
};

/**
 * LuminaCalc - Fancy Lights & Sound Calculator with Haptic Feedback
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  INITIAL_STATE,
  CalculatorState,
  inputDigit,
  inputDecimal,
  backspace,
  clearAll,
  handleOperator,
  handleEquals,
  handlePercentage,
  toggleSign,
  handleUnaryMath,
  memoryAdd,
  memorySubtract,
  memoryRecall,
  memoryClear,
} from './utils/calculator';
import { THEMES, ThemeId, ThemeConfig } from './utils/theme';
import { soundEngine, SoundEngineOptions } from './utils/soundEngine';
import { haptics } from './utils/haptics';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { ParticleCanvas, ParticleEvent } from './components/ParticleCanvas';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { Volume2, VolumeX, Sliders, History, Sparkles, Zap } from 'lucide-react';

export default function App() {
  const [calcState, setCalcState] = useState<CalculatorState>(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('luminacalc_history');
      if (savedHistory) {
        try {
          return { ...INITIAL_STATE, history: JSON.parse(savedHistory) };
        } catch {
          // ignore
        }
      }
    }
    return INITIAL_STATE;
  });

  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('luminacalc_theme') as ThemeId;
      if (saved && THEMES[saved]) return saved;
    }
    return 'cyber';
  });

  const [lightIntensity, setLightIntensity] = useState<'max' | 'normal' | 'subtle' | 'off'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('luminacalc_light_intensity');
      if (saved && ['max', 'normal', 'subtle', 'off'].includes(saved)) {
        return saved as 'max' | 'normal' | 'subtle' | 'off';
      }
    }
    return 'normal';
  });

  const [soundOptions, setSoundOptions] = useState<SoundEngineOptions>(() => soundEngine.getOptions());
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => haptics.isEnabled());
  const [isScientific, setIsScientific] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [shakeTransform, setShakeTransform] = useState<string>('translate3d(0, 0, 0)');

  const theme: ThemeConfig = THEMES[themeId] || THEMES.cyber;
  const displayRef = useRef<HTMLDivElement | null>(null);
  const particleEmitterRef = useRef<((event: ParticleEvent) => void) | null>(null);

  // Sync history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luminacalc_history', JSON.stringify(calcState.history));
    }
  }, [calcState.history]);

  // Sync theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luminacalc_theme', themeId);
    }
  }, [themeId]);

  // Sync light intensity
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luminacalc_light_intensity', lightIntensity);
    }
  }, [lightIntensity]);

  // Visual haptic recoil handler
  useEffect(() => {
    const unsubscribe = haptics.onVisualHaptic((intensity: number) => {
      const randX = (Math.random() - 0.5) * intensity * 2;
      const randY = (Math.random() - 0.5) * intensity * 2;
      setShakeTransform(`translate3d(${randX}px, ${randY}px, 0) scale(${1 - intensity * 0.003})`);
      setTimeout(() => {
        setShakeTransform('translate3d(0, 0, 0) scale(1)');
      }, 75);
    });
    return unsubscribe;
  }, []);

  // Update sound engine settings
  const updateSound = (options: Partial<SoundEngineOptions>) => {
    soundEngine.setOptions(options);
    setSoundOptions(soundEngine.getOptions());
  };

  const updateHaptics = (enabled: boolean) => {
    haptics.setEnabled(enabled);
    setHapticsEnabled(enabled);
  };

  // Helper to trigger particle burst & laser arc
  const triggerVisualEffects = useCallback((
    clientX: number,
    clientY: number,
    type: 'digit' | 'operator' | 'equals' | 'clear' | 'ambient'
  ) => {
    if (!particleEmitterRef.current) return;

    let targetX: number | undefined;
    let targetY: number | undefined;

    if (displayRef.current) {
      const rect = displayRef.current.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    particleEmitterRef.current({
      x: clientX,
      y: clientY,
      targetX,
      targetY,
      type,
    });
  }, []);

  // Button Action Handlers
  const handleDigitInput = useCallback((digit: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    soundEngine.play('digit', digit);
    haptics.trigger('digit');
    if (e) triggerVisualEffects(e.clientX, e.clientY, 'digit');
    setCalcState(prev => inputDigit(prev, digit));
  }, [triggerVisualEffects]);

  const handleDecimalInput = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    soundEngine.play('digit', '0');
    haptics.trigger('digit');
    if (e) triggerVisualEffects(e.clientX, e.clientY, 'digit');
    setCalcState(prev => inputDecimal(prev));
  }, [triggerVisualEffects]);

  const handleOperatorInput = useCallback((op: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    soundEngine.play('operator', op);
    haptics.trigger('operator');
    if (e) triggerVisualEffects(e.clientX, e.clientY, 'operator');
    setCalcState(prev => handleOperator(prev, op));
  }, [triggerVisualEffects]);

  const handleEqualsAction = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    soundEngine.play('equals');
    haptics.trigger('equals');
    setIsProcessing(true);

    if (e) {
      triggerVisualEffects(e.clientX, e.clientY, 'equals');
    } else if (displayRef.current) {
      const rect = displayRef.current.getBoundingClientRect();
      triggerVisualEffects(rect.left + rect.width / 2, rect.top + rect.height / 2, 'equals');
    }

    setCalcState(prev => handleEquals(prev));

    setTimeout(() => {
      setIsProcessing(false);
    }, 250);
  }, [triggerVisualEffects]);

  const handleClearAction = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    soundEngine.play('clear');
    haptics.trigger('clear');
    if (e) triggerVisualEffects(e.clientX, e.clientY, 'clear');
    setCalcState(prev => clearAll(prev));
  }, [triggerVisualEffects]);

  const handleBackspaceAction = useCallback(() => {
    soundEngine.play('backspace');
    haptics.trigger('backspace');
    setCalcState(prev => backspace(prev));
  }, []);

  const handleToggleSignAction = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    soundEngine.play('unary');
    haptics.trigger('digit');
    if (e) triggerVisualEffects(e.clientX, e.clientY, 'digit');
    setCalcState(prev => toggleSign(prev));
  }, [triggerVisualEffects]);

  const handlePercentAction = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    soundEngine.play('operator');
    haptics.trigger('operator');
    if (e) triggerVisualEffects(e.clientX, e.clientY, 'operator');
    setCalcState(prev => handlePercentage(prev));
  }, [triggerVisualEffects]);

  const handleUnaryMathAction = useCallback((op: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    soundEngine.play('unary');
    haptics.trigger('unary');
    if (e) triggerVisualEffects(e.clientX, e.clientY, 'operator');
    setCalcState(prev => handleUnaryMath(prev, op));
  }, [triggerVisualEffects]);

  const handleMemoryAction = useCallback((action: 'MC' | 'MR' | 'M+' | 'M-', e?: React.MouseEvent<HTMLButtonElement>) => {
    soundEngine.play('operator');
    haptics.trigger('operator');
    if (e) triggerVisualEffects(e.clientX, e.clientY, 'operator');

    setCalcState(prev => {
      switch (action) {
        case 'MC': return memoryClear(prev);
        case 'MR': return memoryRecall(prev);
        case 'M+': return memoryAdd(prev);
        case 'M-': return memorySubtract(prev);
      }
    });
  }, [triggerVisualEffects]);

  // Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleDigitInput(key);
      } else if (key === '.') {
        e.preventDefault();
        handleDecimalInput();
      } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        e.preventDefault();
        const opMap: Record<string, string> = { '*': '×', '/': '÷', '+': '+', '-': '-' };
        handleOperatorInput(opMap[key] || key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEqualsAction();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspaceAction();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClearAction();
      } else if (key === '%') {
        e.preventDefault();
        handlePercentAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleDigitInput,
    handleDecimalInput,
    handleOperatorInput,
    handleEqualsAction,
    handleBackspaceAction,
    handleClearAction,
    handlePercentAction,
  ]);

  return (
    <div
      className={`min-h-screen w-full relative flex flex-col items-center justify-center p-3 sm:p-6 bg-radial from-slate-900 via-neutral-950 to-black text-white font-sans overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200`}
    >
      {/* Dynamic Ambient Radiant Aura Glows */}
      <div
        className="fixed top-1/4 -left-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-25 animate-pulse-glow"
        style={{ backgroundColor: theme.primaryGlow }}
      />
      <div
        className="fixed bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-25 animate-pulse-glow"
        style={{ backgroundColor: theme.secondaryGlow }}
      />

      {/* Outer Shell Wrapper with max width for desktop / mobile */}
      <div className="w-full max-w-md sm:max-w-lg z-10 flex flex-col items-center">
        {/* App Title & Quick Utility Header */}
        <header className="w-full flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shadow-lg transition-transform hover:rotate-12"
              style={{
                backgroundColor: theme.primaryGlow,
                boxShadow: `0 0 14px ${theme.primaryGlow}90`,
              }}
            >
              <Zap className="w-4 h-4 text-black font-black" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-wider uppercase font-mono flex items-center gap-1.5 text-zinc-100">
                LuminaCalc
              </h1>
              <div className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase -mt-0.5">
                Lights • Sound • Haptics
              </div>
            </div>
          </div>

          {/* Quick Header Buttons */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-2xl p-1 backdrop-blur-md">
            {/* Quick sound mute toggle */}
            <button
              type="button"
              onClick={() => updateSound({ enabled: !soundOptions.enabled })}
              className={`p-2 rounded-xl transition-all ${
                soundOptions.enabled
                  ? 'text-emerald-400 hover:bg-emerald-500/20'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/10'
              }`}
              title={soundOptions.enabled ? 'Sound On' : 'Sound Muted'}
              aria-label={soundOptions.enabled ? 'Mute sound' : 'Unmute sound'}
            >
              {soundOptions.enabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Light intensity cycle button */}
            <button
              type="button"
              onClick={() => {
                const levels: ('max' | 'normal' | 'subtle' | 'off')[] = [
                  'max',
                  'normal',
                  'subtle',
                  'off',
                ];
                const nextIdx = (levels.indexOf(lightIntensity) + 1) % levels.length;
                setLightIntensity(levels[nextIdx]);
              }}
              className="p-2 rounded-xl text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1 text-xs font-mono"
              title={`Lights: ${lightIntensity.toUpperCase()}`}
              aria-label={`Cycle lights intensity (current: ${lightIntensity})`}
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* History Tape Drawer Button */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
              title="Calculation History"
              aria-label="View history"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Settings Dialog Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
              title="Settings & Themes"
              aria-label="Open settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Calculator Chassis Container with 3D tactile shake */}
        <div
          className={`relative w-full rounded-3xl p-4 sm:p-6 border backdrop-blur-xl shadow-2xl transition-all duration-150 bg-gradient-to-b ${theme.chassisBg}`}
          style={{
            transform: shakeTransform,
            borderColor: `${theme.primaryGlow}30`,
            boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${theme.primaryGlow}15, inset 0 1px 1px rgba(255,255,255,0.15)`,
          }}
        >
          {/* Particle & Fancy Laser Canvas Overlay */}
          <ParticleCanvas
            theme={theme}
            lightIntensity={lightIntensity}
            onRegisterEmitter={emit => {
              particleEmitterRef.current = emit;
            }}
          />

          {/* Subtly animated ambient light edge bar */}
          <div
            className="absolute top-0 inset-x-8 h-[2px] rounded-full pointer-events-none opacity-80"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.primaryGlow}, ${theme.secondaryGlow}, transparent)`,
              boxShadow: `0 0 12px ${theme.primaryGlow}`,
            }}
          />

          {/* Calculator Digital Screen */}
          <div className="mb-4">
            <Display
              expression={calcState.expression}
              display={calcState.display}
              error={calcState.error}
              memory={calcState.memory}
              theme={theme}
              isProcessing={isProcessing}
              onBackspace={handleBackspaceAction}
              onToggleHistory={() => setIsHistoryOpen(true)}
              displayRef={displayRef}
            />
          </div>

          {/* 3D Tactile Keypad */}
          <Keypad
            theme={theme}
            isScientific={isScientific}
            onToggleScientific={() => setIsScientific(prev => !prev)}
            onDigit={handleDigitInput}
            onDecimal={handleDecimalInput}
            onOperator={handleOperatorInput}
            onEquals={handleEqualsAction}
            onClear={handleClearAction}
            onToggleSign={handleToggleSignAction}
            onPercent={handlePercentAction}
            onUnaryMath={handleUnaryMathAction}
            onMemory={handleMemoryAction}
          />

          {/* History Tape Slide-Over Drawer */}
          <HistoryDrawer
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            history={calcState.history}
            onSelectResult={res => {
              setCalcState(prev => ({
                ...prev,
                display: res,
                waitingForOperand: false,
                lastAction: 'history_recall',
              }));
              soundEngine.play('digit');
              haptics.trigger('digit');
            }}
            onClearHistory={() => {
              setCalcState(prev => ({ ...prev, history: [] }));
              soundEngine.play('clear');
            }}
            theme={theme}
          />

          {/* Settings & Themes Modal */}
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            currentTheme={themeId}
            onSelectTheme={tid => setThemeId(tid)}
            soundOptions={soundOptions}
            onUpdateSound={updateSound}
            lightIntensity={lightIntensity}
            onSelectLightIntensity={lvl => setLightIntensity(lvl)}
            hapticsEnabled={hapticsEnabled}
            onToggleHaptics={updateHaptics}
            theme={theme}
          />
        </div>

        {/* Footer info & keyboard tips */}
        <footer className="mt-3 text-center text-[11px] font-mono text-zinc-500 flex flex-wrap items-center justify-center gap-3">
          <span>Keyboard enabled: 0-9, + - * /, Enter, Esc</span>
          <span>•</span>
          <span className="text-zinc-400">Audio Synth • Haptics • Reactive Lasers</span>
        </footer>
      </div>
    </div>
  );
}

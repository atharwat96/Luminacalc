import React from 'react';
import { ThemeId, THEMES, ThemeConfig } from '../utils/theme';
import { SoundPack, SoundEngineOptions, soundEngine } from '../utils/soundEngine';
import { X, Volume2, VolumeX, Sparkles, Sliders, Smartphone, Palette } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  soundOptions: SoundEngineOptions;
  onUpdateSound: (options: Partial<SoundEngineOptions>) => void;
  lightIntensity: 'max' | 'normal' | 'subtle' | 'off';
  onSelectLightIntensity: (level: 'max' | 'normal' | 'subtle' | 'off') => void;
  hapticsEnabled: boolean;
  onToggleHaptics: (enabled: boolean) => void;
  theme: ThemeConfig;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  soundOptions,
  onUpdateSound,
  lightIntensity,
  onSelectLightIntensity,
  hapticsEnabled,
  onToggleHaptics,
  theme,
}) => {
  if (!isOpen) return null;

  const soundPacks: { id: SoundPack; label: string; desc: string }[] = [
    { id: 'cyber', label: 'Cyber Neon', desc: 'Futuristic laser blips & compute hum' },
    { id: 'thock', label: 'Creamy Thock', desc: 'Satisfying mechanical keyboard switches' },
    { id: 'arcade', label: '8-Bit Retro', desc: 'Chiptune bleeps & 1-up fanfare' },
    { id: 'chords', label: 'Musical Chords', desc: 'Pentatonic scale with chord resolves' },
    { id: 'scifi', label: 'Starship Console', desc: 'Tactical spaceship telemetry audio' },
  ];

  return (
    <div
      role="dialog"
      aria-label="Calculator Settings"
      className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md rounded-3xl p-5 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200 border overflow-y-auto"
      style={{ borderColor: `${theme.primaryGlow}50` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4" style={{ color: theme.primaryGlow }} />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-100">
            Lights, Sound & Haptics
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close Settings"
          aria-label="Close settings"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 py-4 space-y-5 scrollbar-thin">
        {/* Fancy Lights Intensity */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fancy Lights & Lasers</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(['max', 'normal', 'subtle', 'off'] as const).map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => onSelectLightIntensity(lvl)}
                className={`py-2 px-1 text-xs font-mono font-medium rounded-xl border transition-all text-center uppercase ${
                  lightIntensity === lvl
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white border-white/5'
                }`}
              >
                {lvl === 'max' ? 'Overdrive' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Themes */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            <Palette className="w-3.5 h-3.5" style={{ color: theme.primaryGlow }} />
            <span>Chroma Lighting Theme</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(THEMES) as ThemeId[]).map(tid => {
              const t = THEMES[tid];
              const isSelected = currentTheme === tid;
              return (
                <button
                  key={tid}
                  type="button"
                  onClick={() => onSelectTheme(tid)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-white/40 bg-zinc-800/80 shadow-lg'
                      : 'border-white/5 bg-zinc-900/50 hover:bg-zinc-800/50 text-zinc-400'
                  }`}
                  style={{
                    borderColor: isSelected ? t.primaryGlow : undefined,
                    boxShadow: isSelected ? `0 0 12px ${t.primaryGlow}40` : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: t.primaryGlow }}
                    />
                    <span className="text-xs font-semibold text-zinc-200">{t.name}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound Pack & Volume */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              {soundOptions.enabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
              )}
              <span>Synthesized Sound Effects</span>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSound({ enabled: !soundOptions.enabled })}
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono transition-all ${
                soundOptions.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-400 border border-white/10'
              }`}
            >
              {soundOptions.enabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* Sound Pack selector */}
          <div className="space-y-1.5 mb-3">
            {soundPacks.map(pack => (
              <button
                key={pack.id}
                type="button"
                onClick={() => {
                  onUpdateSound({ pack: pack.id });
                  // Sample a sound
                  setTimeout(() => soundEngine.play('equals'), 50);
                }}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  soundOptions.pack === pack.id
                    ? 'border-cyan-400/60 bg-cyan-950/20 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'border-white/5 bg-zinc-900/40 hover:bg-zinc-800/40 text-zinc-400'
                }`}
              >
                <div>
                  <div className="text-xs font-medium text-zinc-200">{pack.label}</div>
                  <div className="text-[11px] text-zinc-500">{pack.desc}</div>
                </div>
                {soundOptions.pack === pack.id && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Selected
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-3 bg-zinc-900/50 p-2.5 rounded-xl border border-white/5">
            <span className="text-xs text-zinc-400 font-mono w-14">Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundOptions.volume}
              disabled={!soundOptions.enabled}
              onChange={e =>
                onUpdateSound({ volume: parseFloat(e.target.value) })
              }
              className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              aria-label="Sound Volume"
            />
            <span className="text-xs text-zinc-300 font-mono w-10 text-right">
              {Math.round(soundOptions.volume * 100)}%
            </span>
          </div>
        </div>

        {/* Haptic Feedback */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Haptic Feedback & Recoil</span>
            </div>
            <button
              type="button"
              onClick={() => onToggleHaptics(!hapticsEnabled)}
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono transition-all ${
                hapticsEnabled
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-zinc-800 text-zinc-400 border border-white/10'
              }`}
            >
              {hapticsEnabled ? 'On' : 'Off'}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Vibration for mobile devices + visual tactile recoil bounce on all screens.
          </p>
        </div>
      </div>

      {/* Done button */}
      <div className="pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-bold font-mono text-sm bg-white text-black hover:bg-zinc-200 transition-colors shadow-lg active:scale-[0.98]"
        >
          Done
        </button>
      </div>
    </div>
  );
};

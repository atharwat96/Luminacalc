/**
 * Web Audio API Sound Engine
 * Synthesizes high-fidelity sound effects with zero external network assets.
 */

export type SoundPack = 'cyber' | 'thock' | 'arcade' | 'chords' | 'scifi';

export interface SoundEngineOptions {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  pack: SoundPack;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;
  private options: SoundEngineOptions = {
    enabled: true,
    volume: 0.6,
    pack: 'cyber',
  };

  constructor() {
    // Lazily initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.options.volume, this.ctx.currentTime);

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setOptions(newOptions: Partial<SoundEngineOptions>) {
    this.options = { ...this.options, ...newOptions };
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.options.enabled ? this.options.volume : 0,
        this.ctx.currentTime
      );
    }
  }

  public getOptions(): SoundEngineOptions {
    return { ...this.options };
  }

  /**
   * Main play sound dispatcher
   */
  public play(type: 'digit' | 'operator' | 'equals' | 'clear' | 'backspace' | 'unary' | 'error', value?: string) {
    if (!this.options.enabled || this.options.volume <= 0) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      switch (this.options.pack) {
        case 'cyber':
          this.playCyber(type, value);
          break;
        case 'thock':
          this.playThock(type, value);
          break;
        case 'arcade':
          this.playArcade(type, value);
          break;
        case 'chords':
          this.playChords(type, value);
          break;
        case 'scifi':
          this.playSciFi(type, value);
          break;
      }
    } catch {
      // Audio execution failure fallback
    }
  }

  /**
   * Cyberpunk / Futuristic Neon synthesizer
   */
  private playCyber(type: string, value?: string) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    if (type === 'digit') {
      const digitNum = parseInt(value || '5', 10);
      const baseFreq = 440 + (isNaN(digitNum) ? 5 : digitNum) * 45;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.05);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 2, now);
      filter.Q.setValueAtTime(3, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.08);

      // Add a subtle click transient
      this.playTransientClick(now, 1800, 0.015);
    } else if (type === 'operator') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(620, now);
      osc2.frequency.setValueAtTime(930, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.12);
      osc2.stop(now + 0.12);
    } else if (type === 'equals') {
      // Grand compute resolution chord & sweep
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.035);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(4500, now + 0.2);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.22, now + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45 + idx * 0.05);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + idx * 0.035);
        osc.stop(now + 0.6);
      });

      // Sub bass hit
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(140, now);
      sub.frequency.exponentialRampToValueAtTime(40, now + 0.35);
      subGain.gain.setValueAtTime(0.4, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(now);
      sub.stop(now + 0.35);
    } else if (type === 'clear') {
      // Laser drop / warp sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'error') {
      // Dissonant dual tone
      [330, 310].forEach(f => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } else {
      // default blip
      this.playTransientClick(now, 1200, 0.03);
    }
  }

  /**
   * Creamy Mechanical Keyboard ("Thock") switch simulation
   */
  private playThock(type: string, _value?: string) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Filtered noise burst for tactile switch plastic housing impact
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const isEquals = type === 'equals';
    filter.frequency.setValueAtTime(isEquals ? 450 : 850, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isEquals ? 0.6 : 0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isEquals ? 0.08 : 0.045));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);

    // Deep body thock oscillator
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    const startPitch = isEquals ? 180 : 280;
    osc.frequency.setValueAtTime(startPitch, now);
    osc.frequency.exponentialRampToValueAtTime(startPitch * 0.4, now + (isEquals ? 0.09 : 0.05));

    oscGain.gain.setValueAtTime(isEquals ? 0.5 : 0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isEquals ? 0.09 : 0.05));

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * 8-Bit Arcade Chiptune Retro sound
   */
  private playArcade(type: string, value?: string) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    if (type === 'digit') {
      const digitNum = parseInt(value || '4', 10);
      const noteFreq = [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3, 587.3, 659.3][isNaN(digitNum) ? 0 : digitNum % 10];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(noteFreq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'equals') {
      // 1-UP arcade fanfare
      const notes = [330, 392, 659, 523, 587, 784];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.2, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.06);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.07);
      });
    } else if (type === 'operator') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.04);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.09);
    } else {
      this.playTransientClick(now, 900, 0.03);
    }
  }

  /**
   * Musical Pentatonic Chords synthesizer
   */
  private playChords(type: string, value?: string) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Pentatonic scale in C Major: C4, D4, E4, G4, A4, C5, D5, E5, G5, A5
    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

    if (type === 'digit') {
      const d = parseInt(value || '0', 10);
      const freq = pentatonic[isNaN(d) ? 0 : d % pentatonic.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'equals') {
      // Triad resolve chord with warm vibrato
      const chord = [261.63, 329.63, 392.00, 523.25];
      chord.forEach(f => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 0.5);
      });
    } else if (type === 'operator') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(392.00, now); // G4 fifth
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      this.playTransientClick(now, 1400, 0.04);
    }
  }

  /**
   * Starship / LCARS tactical sci-fi console
   */
  private playSciFi(type: string, value?: string) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const d = parseInt(value || '3', 10);
    const f = 700 + (isNaN(d) ? 3 : d) * 60;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'equals') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    } else if (type === 'clear') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.linearRampToValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  private playTransientClick(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.2, time + duration);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + duration);
  }
}

export const soundEngine = new SoundEngine();

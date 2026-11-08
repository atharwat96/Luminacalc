/**
 * Haptic Feedback & Tactile Shockwave Manager
 */

export type HapticType = 'digit' | 'operator' | 'equals' | 'clear' | 'backspace' | 'unary' | 'error';

class HapticsManager {
  private enabled: boolean = true;
  private shakeCallbacks: Set<(intensity: number) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('luminacalc_haptics');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('luminacalc_haptics', String(enabled));
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public onVisualHaptic(callback: (intensity: number) => void): () => void {
    this.shakeCallbacks.add(callback);
    return () => this.shakeCallbacks.delete(callback);
  }

  public trigger(type: HapticType) {
    if (!this.enabled) return;

    // Physical vibration motor (Mobile devices)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        switch (type) {
          case 'digit':
            navigator.vibrate(12);
            break;
          case 'operator':
            navigator.vibrate([16, 25, 16]);
            break;
          case 'equals':
            // Crescendo compute rumble
            navigator.vibrate([24, 30, 45, 20, 60]);
            break;
          case 'clear':
            navigator.vibrate(35);
            break;
          case 'backspace':
            navigator.vibrate(14);
            break;
          case 'unary':
            navigator.vibrate([18, 20, 18]);
            break;
          case 'error':
            navigator.vibrate([40, 30, 40, 30, 60]);
            break;
        }
      } catch {
        // Safe ignore
      }
    }

    // Visual haptic micro-recoil (for desktops & visual juice)
    let intensity = 1;
    if (type === 'equals') intensity = 3.5;
    else if (type === 'clear') intensity = 2.5;
    else if (type === 'operator') intensity = 1.8;
    else if (type === 'error') intensity = 2.8;

    this.shakeCallbacks.forEach(cb => cb(intensity));
  }
}

export const haptics = new HapticsManager();

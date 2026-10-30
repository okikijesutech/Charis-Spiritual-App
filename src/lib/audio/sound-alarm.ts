/**
 * Contemplative Audio Synthesizer & Sound Alarm
 * Uses Web Audio API for 0ms latency, zero-bandwidth, offline chime synthesis.
 * Produces serene, harmonic bell frequencies (528Hz Love/Renewal resonance + overtone warmth).
 */

class SoundAlarmService {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Synthesize a single resonant singing bowl / cathedral chime.
   * @param freq Fundamental frequency in Hz (e.g. 528Hz)
   * @param duration Duration in seconds
   */
  playChime(freq = 528, duration = 2.4, volume = 0.3): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Master gain envelope for soft fade in and natural resonant decay
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(volume, now + 0.05);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterGain.connect(ctx.destination);

    // Fundamental tone (warm sine wave)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + duration);

    // Harmonic overtone (octave + fifth for serene bell overtone)
    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.exponentialRampToValueAtTime(volume * 0.35, now + 0.04);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.7);
    overtoneGain.connect(ctx.destination);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 1.5, now); // Perfect fifth overtone
    osc2.connect(overtoneGain);
    osc2.start(now);
    osc2.stop(now + duration);
  }

  /**
   * Plays a tranquil, contemplative 3-note ascending chime sequence.
   * Notes: C5 (523.25 Hz) -> E5 (659.25 Hz) -> G5 (783.99 Hz)
   */
  playContemplativeSequence(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [
      { freq: 523.25, delay: 0 },
      { freq: 659.25, delay: 0.35 },
      { freq: 783.99, delay: 0.75 },
    ];

    notes.forEach(({ freq, delay }) => {
      setTimeout(() => {
        this.playChime(freq, 2.2, 0.28);
      }, delay * 1000);
    });
  }
}

export const soundAlarmService = new SoundAlarmService();

/**
 * Contemplative Audio Synthesizer & Sound Alarm
 * Uses Web Audio API for 0ms latency, zero-bandwidth, offline chime synthesis.
 * Produces serene, harmonic bell frequencies with distinct sound themes.
 */

import { SoundTheme } from '../../types/settings';

export interface SoundThemeMeta {
  id: SoundTheme;
  name: string;
  description: string;
}

export const SOUND_THEMES: SoundThemeMeta[] = [
  {
    id: 'bowl',
    name: 'Stillness Bowl',
    description: 'Deep resonant Tibetan singing bowl (432Hz)',
  },
  {
    id: 'harp',
    name: 'Lyrical Harp',
    description: 'Bright ascending 4-note contemplative triad',
  },
  {
    id: 'cathedral',
    name: 'Cathedral Chime',
    description: 'Reverent traditional 3-bell sequence (528Hz)',
  },
];

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
   * Synthesize a single resonant chime tone.
   */
  playChime(freq = 528, duration = 2.4, volume = 0.3): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(volume, now + 0.05);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterGain.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + duration);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.exponentialRampToValueAtTime(volume * 0.35, now + 0.04);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.75);
    overtoneGain.connect(ctx.destination);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 1.5, now);
    osc2.connect(overtoneGain);
    osc2.start(now);
    osc2.stop(now + duration);
  }

  /**
   * Play sound by chosen SoundTheme.
   */
  playTheme(theme: SoundTheme = 'bowl'): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (theme === 'bowl') {
      // Deep 432 Hz Tibetan singing bowl with long sustain
      this.playChime(432, 3.2, 0.35);
      return;
    }

    if (theme === 'harp') {
      // Ascending lyrical harp arpeggio: E5 -> G#5 -> B5 -> E6
      const harpNotes = [
        { freq: 659.25, delay: 0 },
        { freq: 830.61, delay: 0.15 },
        { freq: 987.77, delay: 0.3 },
        { freq: 1318.51, delay: 0.45 },
      ];
      harpNotes.forEach(({ freq, delay }) => {
        setTimeout(() => this.playChime(freq, 2.0, 0.22), delay * 1000);
      });
      return;
    }

    // Default 'cathedral': C5 -> E5 -> G5
    const cathedralNotes = [
      { freq: 523.25, delay: 0 },
      { freq: 659.25, delay: 0.35 },
      { freq: 783.99, delay: 0.75 },
    ];
    cathedralNotes.forEach(({ freq, delay }) => {
      setTimeout(() => this.playChime(freq, 2.2, 0.28), delay * 1000);
    });
  }

  playContemplativeSequence(): void {
    this.playTheme('cathedral');
  }
}

export const soundAlarmService = new SoundAlarmService();

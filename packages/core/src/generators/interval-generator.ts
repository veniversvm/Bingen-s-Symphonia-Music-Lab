import { NoteUtils, transpose } from "../index";

export type IntervalPlaybackMode = 'asc' | 'desc' | 'mixed' | 'harmonic';

export interface IntervalChallenge {
  id: string;
  notes: string[];
  interval: string;       // Ej: "2m"
  playbackMode: IntervalPlaybackMode;
  prettyName: string;     // Ej: "Segunda menor"
}

// 1. Definición de Niveles de Intervalos
export const INTERVAL_LEVELS = [
  { id: 1,  name: "2das",      intervals: ["2m", "2M"] },
  { id: 2,  name: "3ras",      intervals: ["3m", "3M"] },
  { id: 3,  name: "2das y 3ras", intervals: ["2m", "2M", "3m", "3M"] },
  { id: 4,  name: "Justas",    intervals: ["4P", "5P"] },
  { id: 5,  name: "Acum. L5",  intervals: ["2m", "2M", "3m", "3M", "4P", "5P"] },
  { id: 6,  name: "Tritono",   intervals: ["4A"] },
  { id: 7,  name: "Acum. L7",  intervals: ["2m", "2M", "3m", "3M", "4P", "5P", "4A"] },
  { id: 8,  name: "6tas",      intervals: ["6m", "6M"] },
  { id: 9,  name: "Acum. L9",  intervals: ["2m", "2M", "3m", "3M", "4P", "5P", "4A", "6m", "6M"] },
  { id: 10, name: "7mas",      intervals: ["7m", "7M"] },
  { id: 11, name: "Acum. L11", intervals: ["2m", "2M", "3m", "3M", "4P", "5P", "4A", "6m", "6M", "7m", "7M"] },
  { id: 12, name: "Octavas",   intervals: ["8P", "1P"] }
];

// 2. Definición de Sub-niveles (Etapas internas)
export const INTERNAL_MODES: IntervalPlaybackMode[] = ['asc', 'desc', 'mixed', 'harmonic'];

export class IntervalGenerator {
  public static generate(levelIdx: number, subLevelIdx: number): IntervalChallenge {
    const level = INTERVAL_LEVELS[levelIdx];
    const interval = level.intervals[Math.floor(Math.random() * level.intervals.length)];
    
    // Si subLevelIdx es 4 (Full Mix), elegimos modo aleatorio, si no, usamos el del index
    let mode: IntervalPlaybackMode = INTERNAL_MODES[subLevelIdx] || 
                                     INTERNAL_MODES[Math.floor(Math.random() * 4)];

    // Si es mixed, elegimos entre asc o desc
    if (mode === 'mixed') mode = Math.random() > 0.5 ? 'asc' : 'desc';

    // Generación de notas: Tesitura central A3 - A5
    const rootMidi = Math.floor(Math.random() * (72 - 57 + 1)) + 57;
    const rootNote = NoteUtils.fromMidi(rootMidi);
    const targetNote = transpose(rootNote, mode === 'desc' ? `-${interval}` : interval);

    return {
      id: crypto.randomUUID(),
      notes: mode === 'desc' ? [targetNote, rootNote] : [rootNote, targetNote],
      interval: interval,
      playbackMode: mode,
      prettyName: interval // El front se encarga del i18n
    };
  }
}
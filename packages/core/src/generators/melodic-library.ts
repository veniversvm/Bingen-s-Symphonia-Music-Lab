// packages/core/src/generators/melodic-library.ts

export interface MelodicStep {
  n: string[]; // Notas del JSON: ["C3", "C4"]
  d: "1" | "2"; // Duración del JSON: "1" o "2"
}

export interface MelodicLibraryEntry {
  id: string;
  title: string;
  filename: string;      // El nombre del archivo .mid
  midiPath?: string;     // URL completa (se genera en el cargador)
  mode: 'major' | 'minor';
  originalKey: string;   
  timeSignature: string; // "4/4", "3/4", etc.
  totalMeasures: number; // 4, 8, 12, 16
  numVoices: number;     
  bpm: number;
  anacrusis: { has: boolean; beat: number };
  steps: MelodicStep[];
}

export type MelodicExercise = MelodicLibraryEntry;
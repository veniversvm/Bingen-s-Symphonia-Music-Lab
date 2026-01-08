// packages/core/src/generators/note-generator.ts
import { NoteUtils } from "../index";

export interface NoteChallenge {
  note: string;
  clef: 'treble' | 'bass';
  pitchClass: string;
}

// Exportamos la secuencia para poder usarla en el helper
export const PROGRESSION_SEQUENCE = [
  "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5",
  "B3", "A3", "G3", "F3", "E3", "D3", "C3", "B2", "A2", "G2", "F2", "E2", "D2", "C2",
  "C#4", "Eb4", "F#4", "Ab4", "Bb4", "C#3", "Eb3", "F#3", "Ab3", "Bb3"
];

export class NoteRecognitionGenerator {
  public static generate(unlockedCount: number, history: string[] = [], customPool?: string[]): NoteChallenge {
    const pool = customPool && customPool.length > 0 
      ? customPool 
      : PROGRESSION_SEQUENCE.slice(0, Math.max(2, unlockedCount));

    let selectedNote: string;

    if (history.length >= 2 && pool.length > 1) {
      const last = history[history.length - 1];
      const penult = history[history.length - 2];
      if (last === penult) {
        const filtered = pool.filter(n => n !== last);
        selectedNote = filtered[Math.floor(Math.random() * filtered.length)];
      } else {
        selectedNote = pool[Math.floor(Math.random() * pool.length)];
      }
    } else {
      selectedNote = pool[Math.floor(Math.random() * pool.length)];
    }

    const midi = NoteUtils.midi(selectedNote) || 60;
    
    return {
      note: selectedNote,
      clef: midi <= 57 ? 'bass' : 'treble', 
      pitchClass: selectedNote.replace(/\d/g, '')
    };
  }

  // ESTE ES EL MÉTODO QUE TE FALTABA
  public static getNextNoteToUnlock(unlockedCount: number): string | null {
    return PROGRESSION_SEQUENCE[unlockedCount] || null;
  }
}
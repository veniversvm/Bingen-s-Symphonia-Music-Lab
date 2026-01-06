import { NoteUtils } from "../index";

export interface NoteChallenge {
  note: string;     // Ej: "C4"
  clef: 'treble' | 'bass';
  pitchClass: string; // Ej: "C"
}

// 1. Definimos la secuencia de aprendizaje
const PROGRESSION_SEQUENCE = [
  // Fase 1: Clave de Sol (Blancas)
  "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5",
  // Fase 2: Clave de Fa (Blancas hacia abajo)
  "B3", "A3", "G3", "F3", "E3", "D3", "C3", "B2", "A2", "G2", "F2", "E2", "D2", "C2",
  // Fase 3: Cromatismo (C#4, C#3, etc...) - Simplificado para el ejemplo
  "C#4", "Eb4", "F#4", "Ab4", "Bb4", "C#3", "Eb3", "F#3", "Ab3", "Bb3"
];

export class NoteRecognitionGenerator {
  /**
   * Genera un reto basado en el nivel actual (cuántas notas de la secuencia conoce)
   */
  public static generate(unlockedCount: number, history: string[] = []): NoteChallenge {
    const pool = PROGRESSION_SEQUENCE.slice(0, Math.max(2, unlockedCount));
    let selectedNote: string;

    // Lógica anti-repetición (3 veces seguidas prohibido)
    if (history.length >= 2) {
      const last = history[history.length - 1];
      const penult = history[history.length - 2];

      if (last === penult) {
        // Si las últimas dos son iguales, filtramos esa nota del pool
        const filteredPool = pool.filter(n => n !== last);
        // Fallback por si el pool solo tuviera 1 nota (no debería pasar por el slice(0, 2))
        const finalPool = filteredPool.length > 0 ? filteredPool : pool;
        selectedNote = finalPool[Math.floor(Math.random() * finalPool.length)];
      } else {
        selectedNote = pool[Math.floor(Math.random() * pool.length)];
      }
    } else {
      selectedNote = pool[Math.floor(Math.random() * pool.length)];
    }

    const midi = NoteUtils.midi(selectedNote) || 60;
    
    return {
      note: selectedNote,
      // Regla: A3 (midi 69) o menos -> Clave de Fa
      clef: midi <= 57 ? 'bass' : 'treble', 
      pitchClass: selectedNote.replace(/\d/g, '')
    };
  }

  public static getNextNoteToUnlock(unlockedCount: number): string | null {
    return PROGRESSION_SEQUENCE[unlockedCount] || null;
  }
}
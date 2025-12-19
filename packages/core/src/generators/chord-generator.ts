// packages/core/src/generators/chord-generator.ts
import { Chord } from "tonal";

export interface ChordChallenge {
  root: string;       // "C", "F#", "Bb"
  quality: string;    // "Major", "Minor", "Diminished"
  symbol: string;     // "Cmaj7"
  notes: string[];    // ["C4", "E4", "G4", "B4"]
  prompt: string;     // "Construye un Do Mayor Séptima"
}

export const generateChordChallenge = (level: number = 1): ChordChallenge => {
  // Lógica simple por niveles
  const roots = ["C", "G", "F", "D", "A"];
  const qualities = level === 1 ? ["M", "m"] : ["M7", "m7", "7"];
  
  // Selección aleatoria
  const randomRoot = roots[Math.floor(Math.random() * roots.length)];
  const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
  
  // Usamos Tonal para obtener las notas reales
  const chord = Chord.get(`${randomRoot}${randomQuality}`);
  
  // Asignamos octava 4 por defecto para que se vea bien en el pentagrama
  const notesWithOctave = chord.notes.map(n => n + "4");

  return {
    root: randomRoot,
    quality: chord.type,
    symbol: chord.symbol,
    notes: notesWithOctave,
    prompt: `Construye el acorde: ${chord.name}`
  };
};
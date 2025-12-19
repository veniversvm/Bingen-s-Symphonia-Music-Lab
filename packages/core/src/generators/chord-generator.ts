import { Chord, Note } from "tonal";

// --- INTERFACES ---

// Para el ejercicio de Construcción (Simple)
export interface ChordChallenge {
  root: string;
  quality: string;
  symbol: string;
  notes: string[];
  prompt: string;
}

// Para el ejercicio de Dictado (Avanzado)
export interface ChordDictationChallenge {
  id: string;
  notes: string[];
  root: string;
  typeSymbol: string;
  inversion: number;
  prompt: string;
}

// Opciones de configuración para el generador personalizado
export interface GeneratorOptions {
  allowedTypes: string[];      // Ej: ["M", "m7"]
  allowedInversions: number[]; // Ej: [0, 1]
}

// --- CONSTANTES ---

export const CHORD_TYPES = [
  { label: "Mayor", symbol: "M", quality: "Major" },
  { label: "Menor", symbol: "m", quality: "Minor" },
  { label: "Aumentado", symbol: "aug", quality: "Augmented" },
  { label: "Disminuido", symbol: "dim", quality: "Diminished" },
  { label: "Mayor 7", symbol: "maj7", quality: "Major 7" },
  { label: "Menor 7", symbol: "m7", quality: "Minor 7" },
  { label: "Semidisminuido", symbol: "m7b5", quality: "Half Diminished" },
  { label: "Disminuido 7", symbol: "dim7", quality: "Diminished 7" }
];

// --- GENERADORES ---

/**
 * 1. GENERADOR DE CONSTRUCCIÓN (Niveles predefinidos)
 * Usado en: ChordConstruction.tsx
 */
export const generateCustomDictation = (options: GeneratorOptions): ChordDictationChallenge => {
    const roots = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
    
    // 1. Tipos
    const availableTypes = CHORD_TYPES.filter(t => options.allowedTypes.includes(t.symbol));
    const safeTypes = availableTypes.length > 0 ? availableTypes : [CHORD_TYPES[0]];
  
    const randomRoot = roots[Math.floor(Math.random() * roots.length)];
    const randomType = safeTypes[Math.floor(Math.random() * safeTypes.length)];
    
    const chord = Chord.get(`${randomRoot}${randomType.symbol}`);
    
    // 2. CONSTRUCCIÓN ASCENDENTE (Base en Octava 4)
    // Esto asegura que G-Bb-D sea G4-Bb4-D5 (Fundamental Estricta)
    let currentOctave = 4;
    let lastMidi = -1;
  
    let notes = chord.notes.map(noteName => {
      // Intentamos con la octava actual
      let noteWithOctave = noteName + currentOctave;
      let midi = Note.midi(noteWithOctave) || 0;
  
      // Si la nota bajó respecto a la anterior (ej: G4 -> D4), subimos octava (G4 -> D5)
      // para mantener el orden ascendente estricto.
      if (lastMidi !== -1 && midi < lastMidi) {
        currentOctave++;
        noteWithOctave = noteName + currentOctave;
        midi = Note.midi(noteWithOctave) || 0;
      }
  
      lastMidi = midi;
      return noteWithOctave;
    });
  
    // 3. APLICAR INVERSIÓN
    const maxPossibleInv = notes.length - 1;
    const validInversions = options.allowedInversions.filter(inv => inv <= maxPossibleInv);
    const safeInversions = validInversions.length > 0 ? validInversions : [0];
    const inversion = safeInversions[Math.floor(Math.random() * safeInversions.length)];
  
    // Rotamos las notas y subimos octava de las que pasan al final
    const invertedNotes = [...notes];
    for (let i = 0; i < inversion; i++) {
      const note = invertedNotes.shift(); 
      if (note) {
        const midi = Note.midi(note);
        const nextOctave = Note.fromMidi((midi || 0) + 12);
        invertedNotes.push(nextOctave);
      }
    }
  
    // 4. NORMALIZACIÓN VISUAL (CENTRAR EN PENTAGRAMA)
    // Calculamos la altura promedio del acorde resultante
    const avgMidi = invertedNotes.reduce((sum, n) => sum + (Note.midi(n) || 0), 0) / invertedNotes.length;
    
    // El centro ideal del pentagrama (Clave de Sol) es B4 (Midi 71)
    // Si el acorde está muy agudo (promedio > 74, aprox Re5), lo bajamos una octava completa.
    let finalNotes = invertedNotes;
    if (avgMidi > 74) {
       finalNotes = invertedNotes.map(n => {
          const midi = Note.midi(n) || 0;
          return Note.fromMidi(midi - 12); // Bajar 1 octava
       });
    }
  
    return {
      id: crypto.randomUUID(),
      notes: finalNotes,
      root: randomRoot,
      typeSymbol: randomType.symbol,
      inversion: inversion,
      prompt: "Identifica el Acorde"
    };
  };
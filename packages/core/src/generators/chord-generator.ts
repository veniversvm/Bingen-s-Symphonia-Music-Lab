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
export const generateChordChallenge = (level: number = 1): ChordChallenge => {
  const roots = ["C", "G", "F", "D", "A", "Eb"];
  const qualities = level === 1 ? ["M", "m"] : ["M7", "m7", "7"];
  
  const randomRoot = roots[Math.floor(Math.random() * roots.length)];
  const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
  
  const chord = Chord.get(`${randomRoot}${randomQuality}`);
  const notesWithOctave = chord.notes.map(n => n + "4");

  return {
    root: randomRoot,
    quality: chord.type,
    symbol: chord.symbol,
    notes: notesWithOctave,
    prompt: `Construye el acorde: ${chord.name}`
  };
};

/**
 * 2. GENERADOR DE DICTADO CUSTOM (Configurable)
 * Usado en: DictationGame.tsx
 */
export const generateCustomDictation = (options: GeneratorOptions): ChordDictationChallenge => {
  const roots = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  
  // 1. Filtrar tipos permitidos
  // Si la lista está vacía o es inválida, usamos "Mayor" por defecto para no romper la app
  const availableTypes = CHORD_TYPES.filter(t => options.allowedTypes.includes(t.symbol));
  const safeTypes = availableTypes.length > 0 ? availableTypes : [CHORD_TYPES[0]];

  const randomRoot = roots[Math.floor(Math.random() * roots.length)];
  const randomType = safeTypes[Math.floor(Math.random() * safeTypes.length)];
  
  const chord = Chord.get(`${randomRoot}${randomType.symbol}`);
  // Usamos octava 4 como base
  let notes = chord.notes.map(n => n + "4"); 

  // 2. Filtrar inversiones válidas para este acorde específico
  // (Una tríada tiene máx inv 2, una séptima máx inv 3)
  const maxPossibleInv = notes.length - 1;
  const validInversions = options.allowedInversions.filter(inv => inv <= maxPossibleInv);
  const safeInversions = validInversions.length > 0 ? validInversions : [0];
  
  const inversion = safeInversions[Math.floor(Math.random() * safeInversions.length)];

  // 3. Aplicar Inversión (Rotar notas + Subir octava)
  const invertedNotes = [...notes];
  for (let i = 0; i < inversion; i++) {
    const note = invertedNotes.shift(); // Sacar la nota más grave
    if (note) {
      const midi = Note.midi(note);
      // Subir 12 semitonos
      const nextOctave = Note.fromMidi((midi || 0) + 12);
      invertedNotes.push(nextOctave);
    }
  }

  return {
    id: crypto.randomUUID(), // Genera ID único
    notes: invertedNotes,
    root: randomRoot,
    typeSymbol: randomType.symbol,
    inversion: inversion,
    prompt: "Identifica el Acorde"
  };
};
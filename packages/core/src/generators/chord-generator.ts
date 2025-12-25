import { Chord, Note, transpose } from "tonal";

// --- INTERFACES ---
export interface ChordChallenge {
  root: string;
  quality: string;
  symbol: string;
  notes: string[];
  prompt: string;
}

export interface ChordDictationChallenge {
  id: string;
  notes: string[];
  root: string;
  typeSymbol: string;
  inversion: number;
  prompt: string;
}

export interface GeneratorOptions {
  allowedTypes: string[];      
  allowedInversions: number[]; 
}

// --- CONSTANTES ---
export const CHORD_TYPES = [
  { label: "Mayor", symbol: "M" },
  { label: "Menor", symbol: "m" },
  { label: "Aumentado", symbol: "aug" },
  { label: "Disminuido", symbol: "dim" },
  { label: "Mayor 7", symbol: "maj7" },
  { label: "Menor 7", symbol: "m7" },
  { label: "Dominante 7", symbol: "7" },
  { label: "Semidisminuido", symbol: "m7b5" },
  { label: "Disminuido 7", symbol: "dim7" }
];

// --- HELPERS DE TEXTO MUSICAL ---

export const beautifyNote = (note: string) => 
  note.replace(/##/g, '𝄪').replace(/#/g, '♯').replace(/bb/g, '𝄫').replace(/b/g, '♭');

export const sanitizeNote = (note: string) => 
  note.replace(/♯/g, '#').replace(/♭/g, 'b').replace(/𝄪/g, '##').replace(/𝄫/g, 'bb');

/**
 * Mueve una nota de octava preservando su deletreo exacto (Cb4 -> Cb5)
 */
const shiftOctave = (note: string, octaves: number): string => {
  if (octaves === 0) return note;
  const interval = octaves > 0 ? "8P" : "-8P";
  let result = note;
  for (let i = 0; i < Math.abs(octaves); i++) {
    result = transpose(result, interval);
  }
  return result;
};

/**
 * Construye el acorde de forma ascendente partiendo de una octava base
 */
const buildAscendingChord = (notes: string[], startOctave: number): string[] => {
  let currentOctave = startOctave;
  let lastMidi = -1;

  return notes.map(noteName => {
    let noteWithOctave = noteName + currentOctave;
    let midi = Note.midi(noteWithOctave) || 0;

    if (lastMidi !== -1 && midi < lastMidi) {
      currentOctave++;
      noteWithOctave = noteName + currentOctave;
    }
    lastMidi = Note.midi(noteWithOctave) || 0;
    return noteWithOctave;
  });
};

// --- GENERADORES ---

export const generateCustomDictation = (options: GeneratorOptions): ChordDictationChallenge => {
  // Raíces extendidas para cubrir todas las posibilidades teóricas
  const roots = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B", "Cb"];
  const randomRoot = roots[Math.floor(Math.random() * roots.length)];
  
  const availableTypes = CHORD_TYPES.filter(t => options.allowedTypes.includes(t.symbol));
  const selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)] || CHORD_TYPES[0];

  const chord = Chord.get(`${sanitizeNote(randomRoot)}${selectedType.symbol}`);
  
  // 1. Construcción ascendente inicial (Octava 4)
  let notes = buildAscendingChord(chord.notes, 4);

  // 2. Aplicar Inversión respetando el número de notas
  const maxPossibleInv = notes.length - 1;
  const validInversions = options.allowedInversions.filter(inv => inv <= maxPossibleInv);
  const selectedInversion = validInversions.length > 0
    ? validInversions[Math.floor(Math.random() * validInversions.length)]
    : 0;

  let finalNotes = [...notes];
  for (let i = 0; i < selectedInversion; i++) {
    const n = finalNotes.shift()!;
    finalNotes.push(shiftOctave(n, 1));
  }

  // 3. NORMALIZACIÓN DE RANGO (A3 a A5) preservando el deletreo
  // Buscamos que la nota más grave esté cerca del centro del piano
  let bottomMidi = Note.midi(finalNotes[0]) || 0;

  // Si es muy agudo (arriba de La 4), bajamos una octava
  while (bottomMidi > 69) {
    finalNotes = finalNotes.map(n => shiftOctave(n, -1));
    bottomMidi = Note.midi(finalNotes[0]) || 0;
  }
  // Si es muy grave (debajo de La 3), subimos una octava
  while (bottomMidi < 57) {
    finalNotes = finalNotes.map(n => shiftOctave(n, 1));
    bottomMidi = Note.midi(finalNotes[0]) || 0;
  }

  return {
    id: window.crypto.randomUUID(),
    notes: finalNotes, 
    root: randomRoot,
    typeSymbol: selectedType.symbol,
    inversion: selectedInversion,
    prompt: "Construye / Identifica el Acorde"
  };
};

/**
 * Generador simplificado para niveles fijos
 */
export const generateChordChallenge = (level: number = 1): ChordChallenge => {
  const roots = ["C", "G", "F", "D", "A", "Eb", "Bb"];
  const qualities = level === 1 ? ["M", "m"] : ["M7", "m7", "7"];
  const randomRoot = roots[Math.floor(Math.random() * roots.length)];
  const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
  
  const chord = Chord.get(`${sanitizeNote(randomRoot)}${randomQuality}`);
  
  return {
    root: randomRoot,
    quality: chord.type,
    symbol: chord.symbol,
    notes: buildAscendingChord(chord.notes, 4),
    prompt: `Construye: ${randomRoot} ${chord.name}`
  };
};
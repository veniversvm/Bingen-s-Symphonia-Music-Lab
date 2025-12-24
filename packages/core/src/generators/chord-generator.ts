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
// Sincronizado con los símbolos que Tonal.js reconoce perfectamente
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

/**
 * Convierte caracteres ASCII (#, b) a Símbolos Musicales (♯, ♭) para la UI
 */
export const beautifyNote = (note: string) => 
  note.replace(/#/g, '♯').replace(/b/g, '♭');

/**
 * Convierte Símbolos Musicales (♯, ♭) a ASCII (#, b) para la lógica de Tonal/Vexflow
 */
export const sanitizeNote = (note: string) => 
  note.replace(/♯/g, '#').replace(/♭/g, 'b');

const shiftOctave = (note: string, octaves: number): string => {
  if (octaves === 0) return note;
  const interval = octaves > 0 ? "8P" : "-8P";
  let result = note;
  for (let i = 0; i < Math.abs(octaves); i++) {
    result = transpose(result, interval);
  }
  return result;
};

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
  // Definimos las raíces con símbolos UNICODE para que el prompt se vea profesional
  const roots = ["C", "C♯", "D♭", "D", "D♯", "E♭", "E", "F", "F♯", "G♭", "G", "G♯", "A♭", "A", "A♯", "B♭", "B", "C♭"];
  const randomRoot = roots[Math.floor(Math.random() * roots.length)];
  
  const availableTypes = CHORD_TYPES.filter(t => options.allowedTypes.includes(t.symbol));
  const selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)] || CHORD_TYPES[0];

  // IMPORTANTE: Antes de pasarlo a Tonal, convertimos el root Unicode a ASCII
  const asciiRoot = sanitizeNote(randomRoot);
  const chord = Chord.get(`${asciiRoot}${selectedType.symbol}`);
  
  let notes = buildAscendingChord(chord.notes, 4);

  const maxPhysicalInversion = notes.length - 1;
  const validInversions = options.allowedInversions.filter(inv => inv <= maxPhysicalInversion);
  const selectedInversion = validInversions[Math.floor(Math.random() * validInversions.length)] || 0;

  let finalNotes = [...notes];
  for (let i = 0; i < selectedInversion; i++) {
    const n = finalNotes.shift()!;
    finalNotes.push(shiftOctave(n, 1));
  }

  return {
    id: window.crypto.randomUUID(),
    notes: finalNotes, // Mantenemos ASCII interno para Vexflow
    root: randomRoot,  // Enviamos UNICODE para el Banner del front
    typeSymbol: selectedType.symbol,
    inversion: selectedInversion,
    prompt: "Construye / Identifica"
  };
};

/**
 * Generador simplificado
 */
export const generateChordChallenge = (level: number = 1): ChordChallenge => {
  const roots = ["C", "G", "F", "D", "A", "E♭", "B♭"];
  const qualities = level === 1 ? ["M", "m"] : ["M7", "m7", "7"];
  const randomRoot = roots[Math.floor(Math.random() * roots.length)];
  const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
  
  const asciiRoot = sanitizeNote(randomRoot);
  const chord = Chord.get(`${asciiRoot}${randomQuality}`);
  
  return {
    root: randomRoot,
    quality: chord.type,
    symbol: chord.symbol,
    notes: buildAscendingChord(chord.notes, 4),
    prompt: `Construye: ${randomRoot} ${chord.name}`
  };
};
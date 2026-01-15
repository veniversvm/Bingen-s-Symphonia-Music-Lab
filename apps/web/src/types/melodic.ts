export interface CuratedDictation {
  id: string;
  title: string;
  midiPath: string; // Ruta al archivo .mid en /public
  difficulty: number;
  metadata: {
    key: string;           // Tonalidad original
    measures: number;      // Extensión
    voices: number;        // 1, 2, 3 o 4
    hasModulation: boolean;
    accidentals: 'low' | 'medium' | 'high';
    rhythm: string[];      // ["white", "black", "syncopated"]
  };
}

export interface UserNote {
  pitch: string;    // Ej: "C4"
  duration: string; // Ej: "h" para blanca, "q" para negra
}
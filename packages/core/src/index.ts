// packages/core/src/index.ts

export const APP_NAME = "Bingen's Symphonia Music Lab";

// 1. Mantenemos tu estándar: Note es un alias de string (el nombre de la nota)
export type Note = string;

// 2. Exportamos la lógica de Tonal con un alias (NoteUtils) 
// para evitar el conflicto con el tipo Note. 
// Añadimos 'transpose' y 'Distance' que son útiles para el motor melódico.
export { Note as NoteUtils, Chord, Interval, transpose, distance } from "tonal";

export interface Exercise {
  id: string;
  question: string;
  answer: Note[]; 
}

// 3. Exportación de generadores de las distintas features
export * from './generators/chord-generator';
export * from './generators/note-generator';
export * from './generators/melodic-library';

// Una función simple para probar que la lógica se comparte
export const getScale = (root: string): string[] => {
  return [`${root}`, "Scale", "Generator", "Works!"];
};
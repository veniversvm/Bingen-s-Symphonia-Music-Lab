// packages/core/src/index.ts

export const APP_NAME = "Bingen's Symphonia Music Lab";

// 1. Mantenemos tu estándar: Note es un alias de string
export type Note = string;

// 2. Exportamos la lógica de Tonal con un alias (NoteUtils) 
// para evitar el conflicto con el tipo Note
export { Note as NoteUtils, Chord, Interval } from "tonal";

export interface Exercise {
  id: string;
  question: string;
  answer: Note[]; // Aquí usa el type Note (string)
}

export * from './generators/chord-generator';

export const getScale = (root: string): string[] => {
  return [`${root}`, "Scale", "Generator", "Works!"];
};
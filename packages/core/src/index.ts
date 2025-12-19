// packages/core/src/index.ts

export const APP_NAME = "Bingen's Symphonia Music Lab";

export type Note = string;

export interface Exercise {
  id: string;
  question: string;
  answer: Note[];
}

// Una función simple para probar que la lógica se comparte
export const getScale = (root: string): string[] => {
  return [`${root}`, "Scale", "Generator", "Works!"];
};

// Agrega esta línea al final
export * from './generators/chord-generator';
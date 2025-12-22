// apps/web/src/features/excercises/ChordDictation/i18n/index.ts
import { createMemo } from "solid-js";
import { flatten, translator } from "@solid-primitives/i18n";
import { currentLang } from "../../../../i18n"; // Signal global
import { es as globalEs } from "../../../../i18n/es"; // Diccionario global ES
import { en as globalEn } from "../../../../i18n/en"; // Diccionario global EN
import { dict as localEs } from "./es"; 
import { dict as localEn } from "./en";

// Mezclamos global + local
const dictionaries = {
  es: { ...globalEs, ...localEs },
  en: { ...globalEn, ...localEn }
};

export const useChordI18n = () => {
  const dict = createMemo(() => flatten(dictionaries[currentLang()]));
  const t = translator(dict);
  return [t];
};
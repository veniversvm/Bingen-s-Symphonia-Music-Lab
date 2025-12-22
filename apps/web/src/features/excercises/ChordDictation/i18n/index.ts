// apps/web/src/features/excercises/ChordDictation/i18n/index.ts
import { createMemo } from "solid-js";
import { flatten, translator } from "@solid-primitives/i18n";
import { currentLang } from "../../../../i18n"; // Signal global
import { dict as es } from "./es"; // Importamos 'dict' y lo llamamos 'es'
import { dict as en } from "./en"; // Importamos 'dict' y lo llamamos 'en'

const dictionaries = { es, en };

export const useChordI18n = () => {
  // createMemo hace que el cambio sea reactivo al signal global
  const dict = createMemo(() => flatten(dictionaries[currentLang()]));
  const t = translator(dict);
  return [t];
};
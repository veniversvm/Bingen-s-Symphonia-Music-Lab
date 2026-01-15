import { createMemo } from "solid-js";
import { flatten, translator } from "@solid-primitives/i18n";
import { currentLang } from "../../../../i18n"; // Signal global de idioma
import { es as globalEs } from "../../../../i18n/es"; 
import { en as globalEn } from "../../../../i18n/en"; 
import { dict as localEs } from "./es"; 
import { dict as localEn } from "./en";

const dictionaries = {
  es: { ...globalEs, ...localEs },
  en: { ...globalEn, ...localEn }
};

export const useMelodicI18n = () => {
  const dictData = createMemo(() => flatten(dictionaries[currentLang()]));
  const t = translator(dictData);
  return [t];
};
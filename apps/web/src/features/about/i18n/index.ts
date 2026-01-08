import { createMemo } from "solid-js";
import { flatten, translator } from "@solid-primitives/i18n";
import { currentLang } from "../../../i18n"; // Signal global
import { dict as es } from "./es";
import { dict as en } from "./en";

const dictionaries = { es, en };

export const useAboutI18n = () => {
  // flatten: true permite usar puntos para acceder a objetos anidados
  const dict = createMemo(() => flatten(dictionaries[currentLang()]));
  const t = translator(dict);
  return [t];
};
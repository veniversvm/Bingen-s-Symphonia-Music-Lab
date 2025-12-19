import { createSignal, createMemo } from "solid-js";
import { flatten, translator } from "@solid-primitives/i18n";
import { en } from "./en";
import { es } from "./es";

// 1. Definir los diccionarios disponibles
const rawDictionaries = { en, es };

// 2. Estado del idioma actual (por defecto español)
const [locale, setLocale] = createSignal<"es" | "en">("es");

// 3. Crear el diccionario reactivo aplanado
// 'flatten' convierte { home: { title: "Hola" } } en { "home.title": "Hola" }
const dict = createMemo(() => flatten(rawDictionaries[locale()]));

// 4. Crear la función de traducción 't'
// 'translator' devuelve una función que lee del signal 'dict'
const t = translator(dict);

// 5. Exportar hook y setters
// Mantenemos la firma [t] para que tu código en los componentes siga funcionando igual
export const useI18n = () => [t]; 
export const setLanguage = setLocale;
export const currentLang = locale;
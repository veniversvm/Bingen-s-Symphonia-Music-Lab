import { createMemo } from "solid-js";
import { currentLang } from "../../../i18n"; // Importamos el signal global

const dictionaries = {
  es: {
    active: "Instrumentos Activos",
    random: "* El sistema seleccionará uno al azar para cada ejercicio.",
    piano: "Piano",
    guitar: "Guitarra",
    violin: "Violín",
    flute: "Flauta",
    trumpet: "Trompeta",
    synth: "Sinte",
    voice: "Voz"
  },
  en: {
    active: "Active Instruments",
    random: "* The system will select one at random for each exercise.",
    piano: "Piano",
    guitar: "Guitar",
    violin: "Violin",
    flute: "Flute",
    trumpet: "Trumpet",
    synth: "Synth",
    voice: "Voice"
  }
};

export const useInstrumentI18n = () => {
  // Retorna un memo que reacciona al cambio de idioma global
  const t = createMemo(() => dictionaries[currentLang()]);
  return t;
};
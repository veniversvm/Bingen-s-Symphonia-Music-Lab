import { createSignal, onCleanup, onMount, Show } from "solid-js";
import {
  IntervalGenerator,
  INTERNAL_MODES,
  INTERVAL_LEVELS,
} from "@bingens/core";
import { NoteUtils, transpose } from "@bingens/core";
import { audioEngine } from "../../../lib/audio";
import { useIntervalI18n } from "./i18n";
import { ExerciseSummary } from "../ExerciseSummary";
import type { IntervalSettings } from "./IntervalDictationConfig";
import { IntervalGameUI } from "./IntervalGameUI"; // Importamos el componente visual

export const IntervalDictationGame = (props: {
  settings: IntervalSettings;
  onExit: () => void;
}) => {
  const [t] = useIntervalI18n();

  // Estados Lógicos
  const [levelIdx, setLevelIdx] = createSignal(0);
  const [subLevelIdx, setSubLevelIdx] = createSignal(0);
  const [streak, setStreak] = createSignal(0);
  const [instIdx, setInstIdx] = createSignal(0);
  const [challenge, setChallenge] = createSignal<any>(null);
  const [feedback, setFeedback] = createSignal<null | "correct" | "wrong">(
    null,
  );
  const [isGameOver, setIsGameOver] = createSignal(false);

  // Score de Sesión
  const [sessionScore, setSessionScore] = createSignal(0);
  const [sessionTotal, setSessionTotal] = createSignal(0);

  // --- LÓGICA DE GENERACIÓN ---
  const generateCustomChallenge = () => {
    const intervals = props.settings.selectedIntervals;
    const interval = intervals[Math.floor(Math.random() * intervals.length)];

    // CAMBIO AQUÍ: Usamos los modos elegidos por el usuario
    // Si por alguna razón llega vacío (no debería), fallback a todos
    const modes =
      props.settings.playbackModes.length > 0
        ? props.settings.playbackModes
        : ["asc", "desc", "harmonic"];

    const mode = modes[Math.floor(Math.random() * modes.length)];

    // Generar notas (A3 a A5)
    const rootMidi = Math.floor(Math.random() * (72 - 57 + 1)) + 57;
    const rootNote = NoteUtils.fromMidi(rootMidi);

    // Calcular nota destino
    // Si es descendente, restamos el intervalo. Si no, sumamos.
    const targetNote = transpose(
      rootNote,
      mode === "desc" ? `-${interval}` : interval,
    );

    return {
      id: crypto.randomUUID(),
      // Si es descendente: [Aguda, Grave]. Si no: [Grave, Aguda]
      notes: mode === "desc" ? [rootNote, targetNote] : [rootNote, targetNote], // Ojo aquí con el orden de transpose vs array
      interval: interval,
      playbackMode: mode,
    };
  };

  onCleanup(() => {
    // Cuando el componente se destruye (navegación), matamos el sonido
    audioEngine.stopAll();
  });

  // Dentro de IntervalDictationGame.tsx

  const nextChallenge = async () => {
    // 1. Limpieza inmediata (visual y sonora)
    setFeedback(null);
    setSessionTotal((c) => c + 1);
    audioEngine.stopAll(); // <--- Silencio total instantáneo

    // 2. Generamos el nuevo reto
    let next;
    if (props.settings.mode === "mastery") {
      next = IntervalGenerator.generate(levelIdx(), subLevelIdx());
    } else {
      next = generateCustomChallenge();
    }
    setChallenge(next);

    // 3. PEQUEÑA PAUSA (500ms) antes de sonar el nuevo ejercicio
    setTimeout(async () => {
      // Selección del instrumento
      const currentInst =
        props.settings.mode === "mastery"
          ? props.settings.instruments[
              instIdx() % props.settings.instruments.length
            ]
          : props.settings.instruments[
              Math.floor(Math.random() * props.settings.instruments.length)
            ];

      // Cargar el instrumento (si ya está cargado es instantáneo)
      await audioEngine.setInstrument(currentInst);

      // Tocar el intervalo
      playInterval();
    }, 500);
  };

  const playInterval = () => {
    const ch = challenge();
    if (!ch) return;
    if (ch.playbackMode === "harmonic") audioEngine.play(ch.notes);
    else audioEngine.playSequence(ch.notes, 0.7);
  };

  const handleResponse = (interval: string) => {
    if (feedback()) return;
    const isCorrect = interval === challenge().interval;
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setSessionScore((s) => s + 1);
      // Lógica de progreso solo para Mastery
      if (props.settings.mode === "mastery") {
        const newStreak = streak() + 1;
        setStreak(newStreak);

        if (newStreak >= 3) {
          setStreak(0);
          // Avance de subnivel/instrumento/nivel...
          if (subLevelIdx() < 4) {
            setSubLevelIdx(subLevelIdx() + 1);
          } else {
            if (instIdx() < props.settings.instruments.length - 1) {
              setInstIdx(instIdx() + 1);
              setSubLevelIdx(0);
            } else {
              if (levelIdx() < INTERVAL_LEVELS.length - 1) {
                setLevelIdx(levelIdx() + 1);
                setSubLevelIdx(0);
                setInstIdx(0);
              } else {
                setIsGameOver(true);
              }
            }
          }
        }
      }
    } else {
      if (props.settings.mode === "mastery") setStreak(0);
    }
  };

  onMount(nextChallenge);

  // --- DATOS PARA LA UI ---
  // Calculamos los textos a mostrar según el modo
  const getLevelName = () =>
    props.settings.mode === "mastery"
      ? INTERVAL_LEVELS[levelIdx()].name
      : "Personalizado";
  const getSubLevelName = () =>
    props.settings.mode === "mastery"
      ? t(`sublevels.${INTERNAL_MODES[subLevelIdx()]}` as any) || "FULL MIX"
      : "Aleatorio";
  const getOptions = () =>
    props.settings.mode === "mastery"
      ? INTERVAL_LEVELS[levelIdx()].intervals
      : props.settings.selectedIntervals;

  return (
    <Show
      when={!isGameOver()}
      fallback={
        <ExerciseSummary
          score={sessionScore()}
          total={sessionTotal() - 1}
          onRetry={() => {
            setSessionTotal(0);
            setSessionScore(0);
            setStreak(0);
            setIsGameOver(false);
            nextChallenge();
          }}
          onExit={props.onExit}
        />
      }
    >
      {/* RENDERIZAMOS EL COMPONENTE GENÉRICO */}
      <IntervalGameUI
        levelName={getLevelName()}
        subLevelName={getSubLevelName() as string}
        instrumentName={audioEngine.getIsLoading() ? "..." : "Instrumento"}
        streak={props.settings.mode === "mastery" ? streak() : 0}
        feedback={feedback()}
        intervalName={challenge()?.interval}
        options={getOptions()}
        isLoading={audioEngine.getIsLoading()}
        onPlay={playInterval}
        onAnswer={handleResponse}
        onNext={nextChallenge}
        onExit={props.onExit}
      />
    </Show>
  );
};

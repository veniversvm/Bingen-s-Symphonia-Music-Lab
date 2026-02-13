import { createSignal, onCleanup, onMount, Show } from "solid-js";
import {
  IntervalGenerator,
  INTERVAL_LEVELS,
  NoteUtils,
  transpose,
} from "@bingens/core";
import { audioEngine, type InstrumentName } from "../../../lib/audio";
import { useIntervalI18n } from "./i18n";
import { ExerciseSummary } from "../ExerciseSummary";
import type { IntervalSettings } from "./IntervalDictationConfig";
import { IntervalGameUI } from "./IntervalGameUI";

export const IntervalDictationGame = (props: {
  settings: IntervalSettings;
  onExit: () => void;
}) => {
  const [t] = useIntervalI18n();

  // ─────────────────────────────────────────
  // ESTADOS LÓGICOS (PROGRESIÓN)
  // ─────────────────────────────────────────
  const [levelIdx, setLevelIdx] = createSignal(0);
  const [subLevelIdx, setSubLevelIdx] = createSignal(0);
  const [streak, setStreak] = createSignal(0);
  const [instIdx, setInstIdx] = createSignal(0);
  const [isGameOver, setIsGameOver] = createSignal(false);

  // ─────────────────────────────────────────
  // ESTADOS DEL JUEGO ACTUAL
  // ─────────────────────────────────────────
  const [challenge, setChallenge] = createSignal<any>(null);
  const [feedback, setFeedback] = createSignal<null | "correct" | "wrong">(null);
  const [sessionScore, setSessionScore] = createSignal(0);
  const [sessionTotal, setSessionTotal] = createSignal(0);

  // ─────────────────────────────────────────
  // GENERACIÓN DE RETOS
  // ─────────────────────────────────────────
  
  // Generador para modo personalizado (Custom)
  const generateCustomChallenge = () => {
    const intervals = props.settings.selectedIntervals;
    const interval = intervals[Math.floor(Math.random() * intervals.length)];

    // Obtener modos permitidos (o todos si no hay ninguno)
    const possibleModes = props.settings.playbackModes.length > 0
        ? props.settings.playbackModes
        : ["asc", "desc", "harmonic"];

    const mode = possibleModes[Math.floor(Math.random() * possibleModes.length)];

    // Rango central: Midi 57 (A3) a 72 (C5)
    const rootMidi = Math.floor(Math.random() * (72 - 57 + 1)) + 57;
    const rootNote = NoteUtils.fromMidi(rootMidi);
    const intervalNote = transpose(rootNote, interval); 

    return {
      id: window.crypto.randomUUID(),
      // Lógica de orden: Descendente toca primero la aguda
      notes: mode === "desc" ? [intervalNote, rootNote] : [rootNote, intervalNote],
      interval: interval,
      playbackMode: mode,
    };
  };

  const nextChallenge = async () => {
    setFeedback(null);
    setSessionTotal((c) => c + 1);
    
    // Limpieza auditiva inmediata
    audioEngine.stopAll();

    // Determinar qué tipo de reto generar
    const next = props.settings.mode === "mastery"
      ? IntervalGenerator.generate(levelIdx(), subLevelIdx())
      : generateCustomChallenge();
    
    setChallenge(next);

    // PAUSA PEDAGÓGICA: Esperar 500ms para resetear el oído del alumno
    setTimeout(async () => {
      // Rotación de instrumentos según configuración
      const currentInst = props.settings.mode === "mastery"
          ? props.settings.instruments[instIdx() % props.settings.instruments.length]
          : props.settings.instruments[Math.floor(Math.random() * props.settings.instruments.length)];

      await audioEngine.setInstrument(currentInst as InstrumentName);
      playInterval();
    }, 500);
  };

  // ─────────────────────────────────────────
  // REPRODUCCIÓN
  // ─────────────────────────────────────────
  const playInterval = () => {
    const ch = challenge();
    if (!ch) return;

    if (ch.playbackMode === "harmonic") {
      audioEngine.play(ch.notes);
    } else {
      // Método público que permite oír las notas por separado
      audioEngine.playSequence(ch.notes, 0.7);
    }
  };

  // ─────────────────────────────────────────
  // VALIDACIÓN Y PROGRESO
  // ─────────────────────────────────────────
  const handleResponse = (interval: string) => {
    if (feedback()) return;
    const isCorrect = interval === challenge().interval;
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setSessionScore((s) => s + 1);
      
      // Lógica Mastery (Avanzar nivel tras 3 aciertos seguidos)
      if (props.settings.mode === "mastery") {
        const newStreak = streak() + 1;
        setStreak(newStreak);

        if (newStreak >= 3) {
          setStreak(0);
          // Avance de sub-etapas (asc -> desc -> mix...)
          if (subLevelIdx() < 4) {
            setSubLevelIdx(s => s + 1);
          } else {
            // Rotar instrumento o subir nivel general
            if (instIdx() < props.settings.instruments.length - 1) {
              setInstIdx(i => i + 1);
              setSubLevelIdx(0);
            } else {
              if (levelIdx() < INTERVAL_LEVELS.length - 1) {
                setLevelIdx(l => l + 1);
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
      // Si falla en modo maestría, la racha vuelve a cero
      if (props.settings.mode === "mastery") setStreak(0);
    }
  };

  const resetGame = () => {
    setSessionTotal(0);
    setSessionScore(0);
    setStreak(0);
    setIsGameOver(false);
    nextChallenge();
  };

  onMount(nextChallenge);
  onCleanup(() => audioEngine.stopAll());

  // ─────────────────────────────────────────
  // HELPERS DE INTERFAZ (TRADUCCIONES)
  // ─────────────────────────────────────────

  const getLevelDisplayName = () => 
    props.settings.mode === "mastery" 
      ? `${t('nav.practice' as any)}: ${INTERVAL_LEVELS[levelIdx()].name}` 
      : (t('modes.custom' as any) as string);

  const getSubLevelDisplayName = () => {
    const ch = challenge();
    if (!ch) return "...";
    // Muestra el modo real (Ascendente, Descendente, etc.) según el reto generado
    return (t(`sublevels.${ch.playbackMode}` as any) as string) || "N/A";
  };

  const getOptions = () =>
    props.settings.mode === "mastery"
      ? INTERVAL_LEVELS[levelIdx()].intervals
      : props.settings.selectedIntervals;

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <Show
      when={!isGameOver()}
      fallback={
        <ExerciseSummary
          score={sessionScore()}
          total={Math.max(feedback() ? sessionTotal() : sessionTotal() - 1, 0)}
          onRetry={resetGame}
          onExit={props.onExit}
        />
      }
    >
      <IntervalGameUI
        levelName={getLevelDisplayName()}
        subLevelName={getSubLevelDisplayName()}
        instrumentName={audioEngine.getIsLoading() ? "..." : "Soundfont"}
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

export default IntervalDictationGame;
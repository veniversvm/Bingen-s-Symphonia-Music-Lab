import { createSignal, onMount, Show, For, createMemo } from "solid-js";
import {
  NoteRecognitionGenerator,
  type NoteChallenge,
  NoteUtils,
} from "@bingens/core";

import { PianoInput } from "../../../components/music/PianoInput";
import { useNoteI18n } from "./i18n";
import { audioEngine, type InstrumentName } from "../../../lib/audio";
import {
  Ear,
  ChevronRight,
  Sparkles,
  Trophy,
} from "lucide-solid";
import type { NoteConfigSettings } from "./NoteRecognitionConfig";
import { NoteStaff } from "../../../components/music/NotesStaff";

interface Props {
  settings: NoteConfigSettings;
  onExit: () => void;
}

export const NoteRecognitionGame = (props: Props) => {
  const [t] = useNoteI18n();

  // ─────────────────────────────────────────
  // ESTADO DE PROGRESIÓN
  // ─────────────────────────────────────────
  const [unlockedCount, setUnlockedCount] = createSignal(2); // Do, Re iniciales
  const [streak, setStreak] = createSignal(0);
  const [isMasteryPhase, setIsMasteryPhase] = createSignal(false);
  const [noteHistory, setNoteHistory] = createSignal<string[]>([]);

  // Nivel calculado para la UI
  const currentLevel = createMemo(() => unlockedCount() - 1);

  // ─────────────────────────────────────────
  // ESTADO DEL JUEGO
  // ─────────────────────────────────────────
  const [challenge, setChallenge] = createSignal<NoteChallenge | null>(null);
  const [feedback, setFeedback] = createSignal<null | "correct" | "wrong">(null);
  const [isRevealed, setIsRevealed] = createSignal(false);
  const [inputType, setInputType] = createSignal<"piano" | "buttons">("piano");

  // ─────────────────────────────────────────
  // AUDIO / INSTRUMENTOS
  // ─────────────────────────────────────────
  const [currentInst, setCurrentInst] = createSignal<InstrumentName>("acoustic_grand_piano");

  const masteryInstruments: InstrumentName[] = [
    "acoustic_guitar_nylon",
    "violin",
    "flute",
    "choir_aahs",
  ];

  // ─────────────────────────────────────────
  // BOTONES (17 notas para cubrir enarmonía)
  // ─────────────────────────────────────────
  const pitchClasses = [
    "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"
  ];

  // Determinar si el piano muestra sostenidos o bemoles según el reto
  const preferredAccidental = () => challenge()?.note.includes('b') ? 'flat' : 'sharp';

  // ─────────────────────────────────────────
  // NUEVO RETO
  // ─────────────────────────────────────────
  const nextChallenge = async () => {
    setIsRevealed(false);
    setFeedback(null);

    // Si el modo es custom, usamos el pool de notas del usuario
    const pool = props.settings.mode === "custom" ? props.settings.customNotes : undefined;

    // Generamos el reto evitando repeticiones (pasando noteHistory en lugar de history)
    const next = NoteRecognitionGenerator.generate(
      unlockedCount(),
      noteHistory(),
      pool
    );

    // Actualizamos historial (últimas 2 notas)
    setNoteHistory((prev) => [...prev, next.note].slice(-2));
    setChallenge(next);

    // Selección de Instrumento
    if (props.settings.mode === "custom") {
      // En modo custom, rotamos entre los instrumentos elegidos por el usuario
      const insts = props.settings.instruments;
      setCurrentInst(insts[Math.floor(Math.random() * insts.length)]);
    } else {
      // En modo default, lógica 5 (Piano) + 5 (Maestría)
      if (isMasteryPhase()) {
        const randomInst = masteryInstruments[Math.floor(Math.random() * masteryInstruments.length)];
        setCurrentInst(randomInst);
      } else {
        setCurrentInst("acoustic_grand_piano");
      }
    }

    await audioEngine.setInstrument(currentInst());
    playNote();
  };

  // ─────────────────────────────────────────
  // REPRODUCIR NOTA
  // ─────────────────────────────────────────
  const playNote = () => {
    const note = challenge()?.note;
    if (note) audioEngine.play([note]);
  };

  // ─────────────────────────────────────────
  // RESPUESTA DEL USUARIO
  // ─────────────────────────────────────────
  const handleResponse = (inputPC: string) => {
    if (isRevealed() || !challenge()) return;

    // Normalización para comparación
    const userPC = inputPC.replace("♯", "#").replace("♭", "b").replace(/\d/g, "");
    const correctPC = challenge()!.pitchClass;

    // Comparación por CHROMA (Sonido): Asegura que C# sea igual a Db en el piano
    const isCorrect = NoteUtils.get(userPC).chroma === NoteUtils.get(correctPC).chroma;

    setIsRevealed(true);

    if (isCorrect) {
      setFeedback("correct");
      const newStreak = streak() + 1;
      setStreak(newStreak);

      // ── LÓGICA DE PROGRESIÓN (Solo en modo Default) ──
      if (props.settings.mode === "default") {
        if (newStreak >= 5) {
          if (!isMasteryPhase()) {
            setIsMasteryPhase(true);
            setStreak(0);
          } else {
            setUnlockedCount((c) => c + 1);
            setIsMasteryPhase(false);
            setStreak(0);
          }
        }
      }
    } else {
      setFeedback("wrong");
      setStreak(0);
      // Si falla en modo default, regresa a la fase de piano para reforzar
      if (props.settings.mode === "default") setIsMasteryPhase(false);
    }
  };

  onMount(nextChallenge);

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────
  return (
    <div class="max-w-2xl mx-auto p-4 space-y-4 animate-fade-in pb-20">

      {/* HUD DE PROGRESO */}
      <div class="flex justify-between items-center bg-base-100 p-4 rounded-2xl shadow-lg border border-base-content/5 relative overflow-hidden">
        {/* Nivel de fondo */}
        <div class="absolute -left-2 -bottom-4 text-7xl font-black opacity-5 pointer-events-none italic uppercase">
          L{currentLevel()}
        </div>

        <div class="flex flex-col gap-1 w-2/3 z-10">
          <span class="text-[10px] uppercase font-black opacity-40 tracking-widest flex items-center gap-2">
            {t("game.streak")}
            <Show when={isMasteryPhase()}>
              <span class="text-secondary animate-pulse flex items-center gap-1 font-bold">
                <Sparkles size={12}/> {t("game.mastery") as string}
              </span>
            </Show>
          </span>
          <div class="flex gap-2">
            <For each={[0, 1, 2, 3, 4]}>
              {(i) => (
                <div
                  class={`h-2 flex-1 rounded-full transition-all duration-500 ${
                    streak() > i
                    ? (isMasteryPhase() ? 'bg-secondary shadow-[0_0_10px_var(--secondary)]' : 'bg-primary')
                    : 'bg-base-300'
                  }`}
                />
              )}
            </For>
          </div>
        </div>

        <div class="text-right z-10">
          <span class="text-[9px] uppercase font-black opacity-30 block leading-none mb-1">
             {props.settings.mode === 'custom' ? 'MODO CUSTOM' : 'Próxima nota'}
          </span>
          <p class="text-xl font-serif font-bold text-primary flex items-center justify-end gap-2 leading-none">
            <Show when={props.settings.mode === 'default'} fallback={<button onClick={props.onExit} class="btn btn-ghost btn-xs text-error font-black">EXIT</button>}>
              <Trophy size={16} class={isMasteryPhase() ? "text-secondary" : "opacity-20"} />
              {NoteRecognitionGenerator.getNextNoteToUnlock(unlockedCount()) || "MAX"}
            </Show>
          </p>
        </div>
      </div>

      {/* ÁREA DE ESCUCHA / PENTAGRAMA */}
      <div class="card bg-base-100 shadow-xl border border-base-content/10 overflow-hidden">
        <div class="h-10 flex items-center justify-between px-4 bg-base-200/50">
          <div class="flex items-center gap-2">
             <div class={`w-2 h-2 rounded-full ${audioEngine.getIsLoading() ? 'bg-warning animate-bounce' : 'bg-success'}`}></div>
             <span class="text-[9px] uppercase font-black opacity-50 tracking-widest">
               {currentInst().replace(/_/g, " ")}
             </span>
          </div>
          <Show when={!isRevealed()}>
            <button onClick={playNote} class="btn btn-ghost btn-xs gap-2 font-bold uppercase text-[10px]">
              <Ear size={14} /> {(t("game.repeat") as string) || "Oír"}
            </button>
          </Show>
        </div>

        <div class="p-8 min-h-[180px] flex items-center justify-center bg-base-100">
          <Show
            when={isRevealed()}
            fallback={
              <div class="flex flex-col items-center gap-4 opacity-10 animate-pulse text-primary">
                <Ear size={64} />
                <p class="text-[10px] uppercase font-black tracking-widest italic text-base-content">Adivina el tono...</p>
              </div>
            }
          >
            <div class="animate-in zoom-in duration-300">
              <NoteStaff note={challenge()!.note} clef={challenge()!.clef} />
            </div>
          </Show>
        </div>

        <Show when={isRevealed()}>
          <div class={`py-2 text-center text-white font-black text-xs uppercase tracking-[0.2em] animate-in slide-in-from-bottom-2 ${feedback() === 'correct' ? 'bg-success' : 'bg-error'}`}>
             {feedback() === 'correct' ? t('game.correct') as string : `${t('game.wrong') as string} • ${challenge()?.pitchClass}`}
          </div>
        </Show>
      </div>

      {/* INPUTS */}
      <div class="space-y-4">
        <Show
          when={!isRevealed()}
          fallback={
            <button
              class="btn btn-primary btn-lg w-full gap-3 shadow-2xl animate-bounce font-black uppercase tracking-widest"
              onClick={nextChallenge}
            >
              {(t("common.next") as string) || "Siguiente"}
              <ChevronRight size={24} />
            </button>
          }
        >
          <div class="animate-in fade-in slide-in-from-bottom-4">
            <div class="flex justify-center mb-4">
              <div class="join border border-base-content/10 bg-base-100 shadow-sm">
                <button
                  class={`join-item btn btn-xs px-6 ${inputType() === "piano" ? "btn-primary text-white" : "btn-ghost"}`}
                  onClick={() => setInputType("piano")}
                >
                  {t("game.inputPiano") as string}
                </button>
                <button
                  class={`join-item btn btn-xs px-6 ${inputType() === "buttons" ? "btn-active" : ""}`}
                  onClick={() => setInputType("buttons")}
                >
                  {t("game.inputButtons") as string}
                </button>
              </div>
            </div>

            <Show
              when={inputType() === "piano"}
              fallback={
                <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  <For each={pitchClasses}>
                    {(pc) => (
                      <button
                        class="btn btn-outline btn-md font-bold text-lg h-14"
                        onClick={() => handleResponse(pc)}
                      >
                        {pc.replace("#", "♯").replace("b", "♭")}
                      </button>
                    )}
                  </For>
                </div>
              }
            >
              <div class="bg-base-100 p-2 rounded-2xl shadow-lg border border-base-content/5">
                <PianoInput
                  mode={preferredAccidental()}
                  selectedNotes={[]}
                  onNoteClick={(name) => handleResponse(name.replace(/\d/g, ""))}
                />
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default NoteRecognitionGame;

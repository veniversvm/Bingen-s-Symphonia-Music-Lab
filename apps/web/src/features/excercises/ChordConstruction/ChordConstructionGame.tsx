import { createSignal, onMount, Show, createMemo, onCleanup } from "solid-js";
import {
  NoteUtils,
  generateCustomDictation,
  type ChordDictationChallenge,
} from "@bingens/core";
import { audioEngine, type InstrumentName } from "../../../lib/audio";
import { VexStaff } from "../../../components/music/VexStaff";
import {
  PianoInput,
  type SpellingMode,
} from "../../../components/music/PianoInput";
import { useChordI18n } from "../ChordDictation/i18n";
import {
  CircleCheck,
  CircleX,
  ChevronDown,
  Undo2,
  Send,
  Music2,
  Play,
  Music,
} from "lucide-solid";
import { ExerciseSummary } from "../ExerciseSummary";
import type { ChordDictationSettings } from "../ChordDictation/ChordDictationConfig";

interface Props {
  settings: ChordDictationSettings;
  onExit: () => void;
}

export const ChordConstructionGame = (props: Props) => {
  const [t] = useChordI18n();
  const [challenge, setChallenge] =
    createSignal<ChordDictationChallenge | null>(null);
  const [userNotes, setUserNotes] = createSignal<string[]>([]);
  const [spellingMode, setSpellingMode] = createSignal<SpellingMode>("mixed");
  const [count, setCount] = createSignal(1);
  const [score, setScore] = createSignal(0);
  const [isGameOver, setIsGameOver] = createSignal(false);
  const [feedback, setFeedback] = createSignal<"correct" | "wrong" | null>(
    null,
  );
  const [currentInstrument] = createSignal<InstrumentName>(
    "acoustic_grand_piano",
  );

  // --- LÓGICA DE SESIÓN ---

  const isLastExercise = () =>
    props.settings.limit !== "infinite" && count() === props.settings.limit;

  // ESTA ES LA FUNCIÓN QUE FALTABA
  const finishSession = () => setIsGameOver(true);

  const handleNext = () => {
    if (isLastExercise()) {
      finishSession();
    } else {
      setCount((c) => c + 1);
      nextChallenge();
    }
  };

  const resetGame = () => {
    setCount(1);
    setScore(0);
    setIsGameOver(false);
    nextChallenge();
  };

  onCleanup(() => {
    // Cuando el componente se destruye (navegación), matamos el sonido
    audioEngine.stopAll();
  });

  const nextChallenge = async () => {
    setFeedback(null);
    setUserNotes([]);
    const next = generateCustomDictation({
      allowedTypes: props.settings.types,
      allowedInversions: props.settings.inversions,
    });
    setChallenge(next);
    await audioEngine.setInstrument(
      props.settings.instruments[0] || "acoustic_grand_piano",
    );
  };

  // --- LÓGICA MUSICAL ---

  const sortedUserNotes = createMemo(() => {
    return [...userNotes()].sort(
      (a, b) => (NoteUtils.midi(a) ?? 0) - (NoteUtils.midi(b) ?? 0),
    );
  });

  const handleNoteInput = (note: string) => {
    if (feedback()) return;
    const midi = NoteUtils.midi(note);
    const existing = userNotes().find((n) => NoteUtils.midi(n) === midi);
    if (existing) {
      setUserNotes(userNotes().filter((n) => n !== existing));
    } else {
      if (userNotes().length >= 4) return;
      setUserNotes([...userNotes(), note]);
      audioEngine.play([note]);
    }
  };

  const undoLastNote = () => {
    if (feedback() || userNotes().length === 0) return;
    setUserNotes(userNotes().slice(0, -1));
  };

  const checkAnswer = () => {
    const correctNotes = challenge()?.notes;
    if (!correctNotes || userNotes().length === 0) return;

    const simplify = (notes: string[]) =>
      notes.map((n) => n.replace(/\d/g, ""));
    const userSimplified = simplify(sortedUserNotes());
    const targetSimplified = simplify(correctNotes);

    if (JSON.stringify(userSimplified) === JSON.stringify(targetSimplified)) {
      setFeedback("correct");
      setScore((s) => s + 1);
      audioEngine.play(sortedUserNotes());
    } else {
      setFeedback("wrong");
      setTimeout(() => audioEngine.arpeggiate(correctNotes), 500);
    }
  };

  const getCorrectChordName = () => {
    const sym = challenge()?.typeSymbol;
    return sym ? (t(`chords.${sym}` as any) as string) : "...";
  };

  const getCorrectInvName = () => {
    const inv = challenge()?.inversion;
    const invKeys = ["fundamental", "first", "second", "third"];
    return inv !== undefined
      ? (t(`config.inversions_labels.${invKeys[inv]}` as any) as string)
      : "...";
  };

  onMount(() => nextChallenge());

  return (
    <Show
      when={!isGameOver()}
      fallback={
        <ExerciseSummary
          score={score()}
          total={Math.max(feedback() ? count() : count() - 1, 0)}
          onRetry={resetGame}
          onExit={props.onExit}
        />
      }
    >
      <div class="w-full max-w-7xl mx-auto px-2 sm:px-3 md:px-4 animate-fade-in pb-6">
        {/* GRID RESPONSIVO PRINCIPAL */}
        <div
          class="
          grid
          grid-cols-1
          lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]
          gap-4
          items-stretch
        "
        >
          {/* ================= IZQUIERDA: MONITOR ================= */}
          <div class="flex flex-col bg-base-100 rounded-3xl shadow-xl border border-base-content/10 overflow-hidden min-h-0">
            {/* TOOLBAR */}
            <div class="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-base-200/50 border-b border-base-content/5">
              <div class="flex items-center gap-3">
                <button
                  onClick={finishSession}
                  class="btn btn-ghost btn-xs text-error font-black uppercase"
                >
                  {t("config.finishEarly" as any) || "Terminar"}
                </button>
                <span class="text-[10px] font-bold text-primary opacity-60 uppercase truncate max-w-[140px]">
                  {currentInstrument().replace(/_/g, " ")}
                </span>
              </div>

              <div class="flex items-center gap-4">
                <div class="text-right leading-none">
                  <p class="text-[10px] font-black opacity-30 uppercase tracking-tighter">
                    Progreso
                  </p>
                  <p class="text-sm font-mono font-bold">
                    {count()} / {props.settings.limit}
                    {/* <span class="text-secondary"> +{score()}</span> */}
                  </p>
                </div>

                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 border-base-content/5 bg-base-100 shadow-inner">
                  <Show when={feedback() === "correct"}>
                    <CircleCheck class="text-success" size={26} />
                  </Show>
                  <Show when={feedback() === "wrong"}>
                    <CircleX class="text-error" size={26} />
                  </Show>
                  <Show when={!feedback()}>
                    <div class="w-2 h-2 rounded-full bg-base-300 animate-pulse"></div>
                  </Show>
                </div>
              </div>
            </div>

            {/* BANNER DE FEEDBACK REDUCIDO (Aquí está el cambio clave) */}
            <div
              class="py-1 flex items-center justify-center border-b border-base-content/5 transition-all duration-300 px-4 min-h-[2rem]"
              classList={{
                "bg-success/10 text-success": feedback() === "correct",
                "bg-error/10 text-error": feedback() === "wrong",
                "bg-primary/5 text-primary": !feedback(),
              }}
            >
              <Show
                when={feedback()}
                fallback={
                  <div class="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-tighter sm:tracking-widest">
                    <span class="opacity-40 lowercase font-serif italic font-normal">
                      construir:
                    </span>
                    <span>
                      {challenge()?.root} {getCorrectChordName()}
                    </span>
                    <span class="opacity-30">—</span>
                    <span class="opacity-70">{getCorrectInvName()}</span>
                  </div>
                }
              >
                <div class="flex items-center gap-3 animate-in zoom-in duration-300">
                  <span class="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">
                    {feedback() === "correct"
                      ? "¡CORRECTO!"
                      : "RESPUESTA CORRECTA"}
                  </span>
                  {feedback() === "wrong" && (
                    <span class="text-[9px] font-bold opacity-70 border-l border-current pl-3">
                      {challenge()?.root} {getCorrectChordName()}
                    </span>
                  )}
                </div>
              </Show>
            </div>

            {/* PENTAGRAMA */}
            <div class="flex-grow flex items-center justify-center p-3 sm:p-4 md:p-6 xl:p-8 bg-base-100">
              <VexStaff
                notes={sortedUserNotes()}
                targetNotes={feedback() ? challenge()?.notes : []}
              />
            </div>

            {/* AUDIO */}
            <div class="grid grid-cols-2 border-t border-base-content/10 bg-base-200/30">
              <button
                class="
                  btn
                  btn-ghost
                  rounded-none
                  border-r border-base-content/5
                  gap-2
                  h-9 sm:h-12
                  py-1
                "
                onClick={() => audioEngine.play(sortedUserNotes())}
                disabled={userNotes().length === 0}
              >
                <Play size={16} class="fill-current" />
                <span class="text-[10px] sm:text-xs uppercase font-black leading-none">
                  Mi Acorde
                </span>
              </button>

              <button
                class="
                  btn
                  btn-ghost
                  rounded-none
                  gap-2
                  h-9 sm:h-12
                  py-1
                "
                onClick={() =>
                  challenge() && audioEngine.arpeggiate(challenge()!.notes)
                }
              >
                <Music2 size={16} />
                <span class="text-[10px] sm:text-xs uppercase font-black leading-none">
                  Referencia
                </span>
              </button>
            </div>
          </div>

          {/* ================= DERECHA: CONTROL ================= */}
          <div class="flex flex-col gap-4 min-h-0">
            <div class="card bg-base-100 shadow-xl border border-base-content/5 overflow-hidden flex-grow">
              <div class="card-body p-3 sm:p-4 md:p-6 flex flex-col h-full gap-6">
                <div class="flex-grow overflow-x-auto overscroll-x-contain">
                  {/* <h3 class="text-[10px] font-black uppercase opacity-40 mb-3 tracking-widest">
                    Teclado de Construcción
                  </h3> */}
                  <PianoInput
                    onNoteClick={handleNoteInput}
                    selectedNotes={userNotes()}
                    mode={spellingMode()}
                  />
                </div>

                {/* ACCIONES */}
                <div class="flex items-center gap-2 w-full h-11 sm:h-12 mt-auto">
                  {/* Undo */}
                  <button
                    class="
      btn btn-ghost
      border border-base-content/10
      w-11 sm:w-14
      h-full
      p-0
      flex items-center justify-center
      hover:bg-warning/10
    "
                    onClick={undoLastNote}
                    disabled={!!feedback() || userNotes().length === 0}
                  >
                    <Undo2 size={18} class="opacity-70" />
                  </button>

                  {/* Spelling mode */}
                  <div class="join border border-base-content/10 bg-base-200/50 h-full">
                    <button
                      class={`join-item btn btn-ghost h-full px-2 py-1 text-[10px] font-black uppercase leading-none ${
                        spellingMode() === "mixed"
                          ? "bg-primary text-white"
                          : "opacity-40"
                      }`}
                      onClick={() => setSpellingMode("mixed")}
                    >
                      Nat
                    </button>

                    <button
                      class={`join-item btn btn-ghost h-full px-3 py-1 text-base font-bold leading-none ${
                        spellingMode() === "sharp"
                          ? "bg-primary text-white"
                          : "opacity-40"
                      }`}
                      onClick={() => setSpellingMode("sharp")}
                    >
                      ♯
                    </button>

                    <button
                      class={`join-item btn btn-ghost h-full px-3 py-1 text-base font-bold leading-none ${
                        spellingMode() === "flat"
                          ? "bg-primary text-white"
                          : "opacity-40"
                      }`}
                      onClick={() => setSpellingMode("flat")}
                    >
                      ♭
                    </button>
                  </div>

                  {/* Acción principal */}
                  <div class="flex-1 h-full">
                    <Show
                      when={!feedback()}
                      fallback={
                        <button
                          class="
            btn btn-neutral
            h-full w-full
            gap-2
            shadow-lg
            font-black uppercase
            text-xs
            py-1
            animate-in zoom-in
            border-none
          "
                          onClick={handleNext}
                        >
                          {isLastExercise()
                            ? t("config.finish" as any)
                            : t("common.next" as any)}
                          <ChevronDown
                            size={16}
                            class={isLastExercise() ? "" : "-rotate-90"}
                          />
                        </button>
                      }
                    >
                      <button
                        class="
          btn btn-primary
          h-full w-full
          shadow-lg
          font-black uppercase
          tracking-widest
          text-xs
          py-1
          gap-2
          border-none
        "
                        disabled={userNotes().length === 0}
                        onClick={checkAnswer}
                      >
                        <Send size={16} />
                        <span class="hidden xl:inline leading-none">
                          COMPROBAR
                        </span>
                      </button>
                    </Show>
                  </div>
                </div>
              </div>
            </div>

            {/* TIP DESKTOP */}
            <div class="hidden lg:flex card bg-primary/5 border border-primary/10 p-4 items-center gap-3">
              <Music size={16} class="text-primary opacity-50" />
              <p class="text-[10px] font-serif italic opacity-50">
                Pulsa la tecla una vez para añadirla, y otra vez para
                eliminarla.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

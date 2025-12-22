import { createSignal, onMount, Show } from "solid-js";
import {
  generateCustomDictation,
  type ChordDictationChallenge,
  type Note,
  NoteUtils,
} from "@bingens/core";
import { audioEngine, type InstrumentName } from "../../../lib/audio";
import { VexStaff } from "../../../components/music/VexStaff";
import { PianoInput } from "../../../components/music/PianoInput";
import { useChordI18n } from "../ChordDictation/i18n";
import {
  CircleCheck,
  CircleX,
  ChevronDown,
  Trash2,
  Send,
  LogOut,
  Music2,
  Play,
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
  const [count, setCount] = createSignal(1);
  const [score, setScore] = createSignal(0);
  const [isGameOver, setIsGameOver] = createSignal(false);
  const [feedback, setFeedback] = createSignal<"correct" | "wrong" | null>(
    null
  );
  const [currentInstrument] = createSignal<InstrumentName>(
    "acoustic_grand_piano"
  );

  // --- LÓGICA DE NAVEGACIÓN ---

  const nextChallenge = async () => {
    if (props.settings.limit !== "infinite" && count() > props.settings.limit) {
      setIsGameOver(true);
      return;
    }
    setFeedback(null);
    setUserNotes([]);
    const next = generateCustomDictation({
      allowedTypes: props.settings.types,
      allowedInversions: props.settings.inversions,
    });
    setChallenge(next);
    await audioEngine.setInstrument(
      props.settings.instruments[0] || "acoustic_grand_piano"
    );
  };

  const handleNext = () => {
    if (
      props.settings.limit !== "infinite" &&
      count() === props.settings.limit
    ) {
      setIsGameOver(true);
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

  // --- LÓGICA MUSICAL SIMPLIFICADA (Pitch Class Only) ---

  const preferredAccidental = () => {
    const notes = challenge()?.notes || [];
    return notes.some((n) => n.includes("b")) ? "flat" : "sharp";
  };

  const handleNoteInput = (clickedNote: string) => {
    if (feedback()) return;

    const clickedMidi = NoteUtils.midi(clickedNote);
    const challengeNotes = challenge()?.notes || [];

    /**
     * MAGIA ENARMÓNICA:
     * Buscamos en el reto si existe una nota con el mismo MIDI que la tecla pulsada.
     * Si el reto pide E#4 (midi 65) y el usuario pulsa la tecla F4 (midi 65),
     * el sistema elegirá E#4 automáticamente.
     */
    const matchedNoteFromChallenge = challengeNotes.find(
      (n) => NoteUtils.midi(n) === clickedMidi
    );

    // Si hay coincidencia en el reto, usamos ese nombre exacto (E#, B#, Cb, etc.)
    // Si no, usamos el nombre estándar de la tecla del piano.
    let noteToProcess = matchedNoteFromChallenge
      ? matchedNoteFromChallenge
      : clickedNote;

    // Lógica de Toggle (Añadir/Quitar)
    if (userNotes().includes(noteToProcess)) {
      setUserNotes(userNotes().filter((n) => n !== noteToProcess));
    } else {
      if (userNotes().length >= 4) return;

      // Ordenamos por MIDI para que el pentagrama sea siempre ascendente
      const newNotes = [...userNotes(), noteToProcess].sort(
        (a, b) => (NoteUtils.midi(a) ?? 0) - (NoteUtils.midi(b) ?? 0)
      );

      setUserNotes(newNotes);
      audioEngine.play([noteToProcess]);
    }
  };

  const checkAnswer = () => {
    const correctNotes = challenge()?.notes;
    if (!correctNotes || userNotes().length === 0) return;

    // Comparamos ignorando octavas: "C#4" -> "C#"
    const simplify = (notes: string[]) =>
      notes.map((n) => n.replace(/\d/g, ""));

    const userSimplified = simplify(userNotes());
    const targetSimplified = simplify(correctNotes);

    const isCorrect =
      JSON.stringify(userSimplified) === JSON.stringify(targetSimplified);

    if (isCorrect) {
      setFeedback("correct");
      setScore((s) => s + 1);
      audioEngine.play(userNotes());
    } else {
      setFeedback("wrong");
      setTimeout(() => audioEngine.arpeggiate(correctNotes), 500);
    }
  };

  const getChallengeName = () => {
    const sym = challenge()?.typeSymbol;
    const inv = challenge()?.inversion;
    if (!sym || inv === undefined) return "...";
    const invKeys = ["fundamental", "first", "second", "third"];
    // @ts-ignore
    return `${t(`chords.${sym}`)} - ${t(`config.inversions_labels.${invKeys[inv]}`)}`;
  };

  onMount(() => nextChallenge());

  return (
    <Show
      when={!isGameOver()}
      fallback={
        <ExerciseSummary
          score={score()}
          total={feedback() ? count() : count() - 1}
          onRetry={resetGame}
          onExit={props.onExit}
        />
      }
    >
      <div class="w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-2 space-y-3 md:space-y-6 animate-fade-in pb-10">
        {/* CONSOLA SUPERIOR */}
        <div class="flex flex-col bg-base-100 rounded-2xl shadow-xl border border-base-content/10 overflow-hidden">
          <div class="flex items-center justify-between px-3 py-2 md:px-6 md:py-4 bg-base-200/50 border-b border-base-content/5">
            <button
              onClick={() => setIsGameOver(true)}
              class="btn btn-ghost btn-xs md:btn-sm text-error font-black gap-1 hover:bg-error/10"
            >
              <LogOut size={14} />
              <span class="hidden sm:inline uppercase tracking-tighter">
                {t("config.finishEarly" as any) as string}
              </span>
            </button>

            <div class="flex items-center gap-3 md:gap-6 text-right">
              <div>
                <p class="text-[9px] md:text-xs font-black opacity-40 uppercase">
                  Progreso
                </p>
                <p class="text-xs md:text-base font-mono font-bold leading-none">
                  {count()} / {props.settings.limit}{" "}
                  <span class="text-secondary">+{score()}</span>
                </p>
              </div>
              <div class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 border-base-content/5">
                <Show when={feedback() === "correct"}>
                  <CircleCheck size={24} class="text-success" />
                </Show>
                <Show when={feedback() === "wrong"}>
                  <CircleX size={24} class="text-error" />
                </Show>
                <Show when={!feedback()}>
                  <div class="w-2 h-2 rounded-full bg-base-300 animate-pulse" />
                </Show>
              </div>
            </div>
          </div>

          {/* BANNER DE RETO */}
          <div class="h-10 md:h-14 flex items-center justify-center border-b border-base-content/5 transition-colors duration-300 bg-primary/5 text-primary">
            <h2 class="text-xs md:text-lg font-serif font-bold uppercase tracking-wider">
              <Show
                when={feedback() === "wrong"}
                fallback={`${challenge()?.root} ${getChallengeName()}`}
              >
                {t("game.prompt" as any) || "Era"}: {challenge()?.root}{" "}
                {getChallengeName()}
              </Show>
            </h2>
          </div>

          <div class="p-2 md:p-8 min-h-[140px] md:min-h-[280px] flex items-center justify-center bg-base-100">
            <VexStaff notes={userNotes()} />
          </div>

          {/* BOTONES DE AUDIO */}
          <div class="grid grid-cols-2 border-t border-base-content/10 bg-base-200/30">
            <button
              class="btn btn-ghost rounded-none border-r border-base-content/5 gap-2 h-12"
              onClick={() => audioEngine.play(userNotes())}
              disabled={userNotes().length === 0}
            >
              <Play size={16} class="fill-current" />{" "}
              <span class="text-[10px] md:text-xs uppercase font-black">
                Mi Acorde
              </span>
            </button>
            <button
              class="btn btn-ghost rounded-none gap-2 h-12"
              onClick={() =>
                challenge() && audioEngine.arpeggiate(challenge()!.notes)
              }
            >
              <Music2 size={16} />{" "}
              <span class="text-[10px] md:text-xs uppercase font-black">
                Referencia
              </span>
            </button>
          </div>
        </div>

        {/* PIANO */}
        <div class="card bg-base-100 shadow-lg border border-base-content/5">
          <div class="card-body p-3 md:p-8 space-y-4">
            <PianoInput
              onNoteClick={handleNoteInput}
              selectedNotes={userNotes()}
              preferredAccidental={preferredAccidental()}
            />

            <div class="flex gap-2">
              <button
                class="btn btn-ghost flex-1 gap-2 border-base-content/10"
                onClick={() => setUserNotes([])}
                disabled={!!feedback()}
              >
                <Trash2 size={18} />{" "}
                <span class="hidden sm:inline">Limpiar</span>
              </button>

              <Show
                when={!feedback()}
                fallback={
                  <button
                    class="btn btn-neutral btn-md md:btn-lg flex-1 gap-3 shadow-lg font-black uppercase"
                    onClick={handleNext}
                  >
                    {count() === props.settings.limit
                      ? t("config.finish" as any)
                      : t("common.next" as any)}
                    <ChevronDown
                      size={20}
                      class={
                        count() === props.settings.limit ? "" : "-rotate-90"
                      }
                    />
                  </button>
                }
              >
                <button
                  class="btn btn-primary btn-md md:btn-lg flex-1 gap-3 font-black shadow-xl uppercase tracking-widest"
                  disabled={userNotes().length === 0}
                  onClick={checkAnswer}
                >
                  <Send size={18} /> {t("game.submit" as any) || "Comprobar"}
                </button>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

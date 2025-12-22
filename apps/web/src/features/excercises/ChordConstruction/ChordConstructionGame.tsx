import { createSignal, onMount, Show } from "solid-js";
// Importamos 'Note' como TIPO y 'NoteUtils' como VALOR/OBJETO
import {
  generateCustomDictation,
  type ChordDictationChallenge,
  type Note,
  NoteUtils,
} from "@bingens/core";
import { audioEngine } from "../../../lib/audio";
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
  settings: ChordDictationSettings; // En lugar de 'any'
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

  // --- LÓGICA DE NAVEGACIÓN ---

  const nextChallenge = async () => {
    // 1. Verificamos el límite de ejercicios
    if (props.settings.limit !== "infinite" && count() > props.settings.limit) {
      setIsGameOver(true);
      return;
    }

    setFeedback(null);
    setUserNotes([]);

    // 2. MAPEADO DE LLAVES:
    // Convertimos 'types' a 'allowedTypes' e 'inversions' a 'allowedInversions'
    const next = generateCustomDictation({
      allowedTypes: props.settings.types,
      allowedInversions: props.settings.inversions,
    });

    setChallenge(next);

    // 3. Opcional: Sonido de referencia (si quieres que suene el piano al cargar)
    // await audioEngine.setInstrument('acoustic_grand_piano');
  };

  const resetGame = () => {
    setCount(1);
    setScore(0);
    setIsGameOver(false);
    nextChallenge();
  };

  // --- LÓGICA DEL JUEGO ---

  const getChallengeName = () => {
    const sym = challenge()?.typeSymbol;
    const inv = challenge()?.inversion;
    if (!sym || inv === undefined) return "...";
    const invKeys = ["fundamental", "first", "second", "third"];
    // @ts-ignore
    return `${t(`chords.${sym}`)} - ${t(`config.inversions_labels.${invKeys[inv]}`)}`;
  };

  onMount(() => nextChallenge());

  // Función para manejar el botón "Siguiente" o "Finalizar"
  const isLastExercise = () =>
    props.settings.limit !== "infinite" && count() === props.settings.limit;

  const handleNext = () => {
    if (isLastExercise()) {
      setIsGameOver(true);
    } else {
      setCount((c) => c + 1);
      nextChallenge();
    }
  };

  const handleNoteInput = (clickedNote: string) => {
    if (feedback()) return;
  
    const challengeNotes = challenge()?.notes || [];
    
    // Lógica de Enarmonía Contextual:
    // Si el usuario toca "Gb4" pero el reto espera "F#4", lo convertimos antes de procesar
    let noteToProcess = clickedNote;
    const enharmonic = NoteUtils.enharmonic(clickedNote);
    
    if (!challengeNotes.includes(clickedNote) && challengeNotes.includes(enharmonic)) {
      noteToProcess = enharmonic;
    }
  
    // Ahora sí, hacemos el toggle con la nota "bien deletreada"
    if (userNotes().includes(noteToProcess)) {
      setUserNotes(userNotes().filter(n => n !== noteToProcess));
    } else {
      if (userNotes().length >= 4) return;
      const newNotes = [...userNotes(), noteToProcess].sort(
        (a, b) => (NoteUtils.midi(a) ?? 0) - (NoteUtils.midi(b) ?? 0)
      );
      setUserNotes(newNotes);
      audioEngine.play([noteToProcess]);
    }
  };
  

  const checkAnswer = () => {
    const correct = challenge()?.notes;
    if (!correct) return;

    // Comparamos arrays ordenados
    const isCorrect = JSON.stringify(userNotes()) === JSON.stringify(correct);

    if (isCorrect) {
      setFeedback("correct");
      setScore((s) => s + 1);
      audioEngine.play(userNotes());
    } else {
      setFeedback("wrong");
      // Al fallar, tocamos el acorde correcto para que el usuario compare el sonido
      setTimeout(() => audioEngine.arpeggiate(correct), 500);
    }
  };

  const preferredAccidental = () => {
    const notes = challenge()?.notes || [];
    // Si alguna nota del reto tiene un bemol 'b', preferimos bemoles
    return notes.some((n) => n.includes("b")) ? "flat" : "sharp";
  };

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
        {/* BLOQUE SUPERIOR UNIFICADO */}
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
                <p class="text-[9px] md:text-xs font-black opacity-40 uppercase tracking-widest">
                  Progreso
                </p>
                <p class="text-xs md:text-base font-mono font-bold leading-none">
                  {count()} / {props.settings.limit}{" "}
                  <span class="text-secondary">+{score()}</span>
                </p>
              </div>
              <div class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 border-base-content/5 shadow-inner">
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

          {/* BANNER DE INSTRUCCIÓN: Muestra qué acorde construir */}
          <div
            class="h-10 md:h-14 flex items-center justify-center border-b border-base-content/5 transition-colors duration-300"
            classList={{
              "bg-success/10 text-success": feedback() === "correct",
              "bg-error/10 text-error": feedback() === "wrong",
              "bg-primary/5 text-primary": !feedback(),
            }}
          >
            <h2 class="text-xs md:text-lg font-serif font-bold uppercase tracking-wider">
              <Show
                when={feedback() === "wrong"}
                fallback={`${challenge()?.root} ${getChallengeName()}`}
              >
                {/* Si se equivoca, recordamos cuál era la respuesta correcta */}
                {t("game.prompt" as any) || "Era"}: {challenge()?.root}{" "}
                {getChallengeName()}
              </Show>
            </h2>
          </div>

          {/* PENTAGRAMA: Muestra las notas del USUARIO en tiempo real */}
          <div class="p-2 md:p-8 min-h-[140px] md:min-h-[280px] flex items-center justify-center bg-base-100">
            {/* 
                Importante: Aquí pasamos userNotes() para el "Live Rendering". 
                Si hay feedback de error, podrías mostrar challenge().notes en otro color 
             */}
            <VexStaff notes={userNotes()} />
          </div>

          {/* BOTONES DE REPETICIÓN (Solo útiles tras responder o para referencia) */}
          <div class="grid grid-cols-2 border-t border-base-content/10 bg-base-200/30">
            <button
              class="btn btn-ghost rounded-none border-r border-base-content/5 gap-2 h-12"
              onClick={() => audioEngine.play(userNotes())}
              disabled={userNotes().length === 0}
            >
              <Play size={16} class="fill-current" />{" "}
              <span class="text-[10px] md:text-xs uppercase font-black">
                Escuchar Mi Acorde
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
                Referencia Correcta
              </span>
            </button>
          </div>
        </div>

        {/* PIANO Y ACCIONES */}
        <div class="card bg-base-100 shadow-lg border border-base-content/5">
          <div class="card-body p-3 md:p-8 space-y-4">
            {/* El PianoInput debe manejar el scroll horizontal si es el expandido */}
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
                    {isLastExercise()
                      ? t("config.finish" as any)
                      : t("common.next" as any)}
                    <ChevronDown
                      size={20}
                      class={isLastExercise() ? "" : "-rotate-90"}
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

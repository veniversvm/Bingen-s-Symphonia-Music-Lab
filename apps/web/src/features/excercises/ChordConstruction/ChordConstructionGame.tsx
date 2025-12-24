import { createSignal, onMount, Show, createMemo, createEffect } from "solid-js";
import {
  NoteUtils,
  generateCustomDictation,
  type ChordDictationChallenge,
} from "@bingens/core";
import { audioEngine, type InstrumentName } from "../../../lib/audio";
import { VexStaff } from "../../../components/music/VexStaff";
import { PianoInput, type SpellingMode } from "../../../components/music/PianoInput";
import { useChordI18n } from "../ChordDictation/i18n";
import {
  CircleCheck,
  CircleX,
  ChevronDown,
  Undo2,
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
  const [challenge, setChallenge] = createSignal<ChordDictationChallenge | null>(null);
  const [userNotes, setUserNotes] = createSignal<string[]>([]);
  const [spellingMode, setSpellingMode] = createSignal<SpellingMode>("mixed");
  const [count, setCount] = createSignal(1);
  const [score, setScore] = createSignal(0);
  const [isGameOver, setIsGameOver] = createSignal(false);
  const [feedback, setFeedback] = createSignal<"correct" | "wrong" | null>(null);
  const [currentInstrument] = createSignal<InstrumentName>("acoustic_grand_piano");

  // --- LÓGICA DE RE-DELETREO ---
  const translateNote = (note: string, mode: SpellingMode): string => {
    const midi = NoteUtils.midi(note);
    if (midi === null) return note;
    const pc = midi % 12;
    const oct = Math.floor(midi / 12) - 1;
    const map: any = {
      0: { mixed: "C", sharp: "C", flat: "C" }, 1: { mixed: "C#", sharp: "C#", flat: "Db" },
      2: { mixed: "D", sharp: "D", flat: "D" }, 3: { mixed: "Eb", sharp: "D#", flat: "Eb" },
      4: { mixed: "E", sharp: "E", flat: "E" }, 5: { mixed: "F", sharp: "F", flat: "F" },
      6: { mixed: "F#", sharp: "F#", flat: "Gb" }, 7: { mixed: "G", sharp: "G", flat: "G" },
      8: { mixed: "Ab", sharp: "G#", flat: "Ab" }, 9: { mixed: "A", sharp: "A", flat: "A" },
      10: { mixed: "Bb", sharp: "A#", flat: "Bb" }, 11: { mixed: "B", sharp: "B", flat: "B" }
    };
    let name = map[pc][mode];
    if (mode === 'sharp') { if (pc === 5) name = "E#"; if (pc === 0) name = "B#"; }
    else if (mode === 'flat') { if (pc === 4) name = "Fb"; if (pc === 11) name = "Cb"; }
    let finalOct = oct;
    if (mode === 'sharp' && pc === 0 && name === "B#") finalOct = oct - 1;
    if (mode === 'flat' && pc === 11 && name === "Cb") finalOct = oct + 1;
    return `${name}${finalOct}`;
  };

  createEffect(() => {
    const mode = spellingMode();
    const current = userNotes();
    if (current.length === 0) return;
    const respelled = current.map(n => translateNote(n, mode));
    if (JSON.stringify(respelled) !== JSON.stringify(current)) setUserNotes(respelled);
  });

  // --- LÓGICA DE CONTROL ---
  const sortedUserNotes = createMemo(() => {
    return [...userNotes()].sort((a, b) => (NoteUtils.midi(a) ?? 0) - (NoteUtils.midi(b) ?? 0));
  });

  const isLastExercise = () => props.settings.limit !== "infinite" && count() === props.settings.limit;

  const nextChallenge = async () => {
    setFeedback(null);
    setUserNotes([]);
    setChallenge(generateCustomDictation({
      allowedTypes: props.settings.types,
      allowedInversions: props.settings.inversions,
    }));
    await audioEngine.setInstrument(props.settings.instruments[0] || "acoustic_grand_piano");
  };

  const handleNext = () => {
    if (isLastExercise()) setIsGameOver(true);
    else { setCount(c => c + 1); nextChallenge(); }
  };

  const resetGame = () => {
    setCount(1); setScore(0); setIsGameOver(false); nextChallenge();
  };

  const handleNoteInput = (note: string) => {
    if (feedback()) return;
    const midi = NoteUtils.midi(note);
    const existing = userNotes().find((n) => NoteUtils.midi(n) === midi);
    if (existing) setUserNotes(userNotes().filter((n) => n !== existing));
    else {
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
    const simplify = (notes: string[]) => notes.map((n) => n.replace(/\d/g, ""));
    if (JSON.stringify(simplify(sortedUserNotes())) === JSON.stringify(simplify(correctNotes))) {
      setFeedback("correct"); setScore((s) => s + 1); audioEngine.play(sortedUserNotes());
    } else {
      setFeedback("wrong"); setTimeout(() => audioEngine.arpeggiate(correctNotes), 500);
    }
  };

  const getCorrectChordName = () => {
    const sym = challenge()?.typeSymbol;
    return sym ? (t(`chords.${sym}` as any) as string) : "...";
  };

  const getCorrectInvName = () => {
    const inv = challenge()?.inversion;
    const invKeys = ["fundamental", "first", "second", "third"];
    return inv !== undefined ? (t(`config.inversions_labels.${invKeys[inv]}` as any) as string) : "...";
  };

  onMount(() => nextChallenge());

  return (
    <Show when={!isGameOver()} fallback={<ExerciseSummary score={score()} total={feedback() ? count() : count() - 1} onRetry={resetGame} onExit={props.onExit} />}>
      <div class="w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-2 space-y-3 md:space-y-6 animate-fade-in pb-10">
        
        {/* 1. BLOQUE SUPERIOR (CONSOLA) */}
        <div class="flex flex-col bg-base-100 rounded-2xl shadow-xl border border-base-content/10 overflow-hidden">
          
          {/* TOOLBAR */}
          <div class="flex items-center justify-between px-3 py-2 md:px-6 md:py-4 bg-base-200/50 border-b border-base-content/5">
            <div class="flex items-center gap-2">
              <button onClick={() => setIsGameOver(true)} class="btn btn-ghost btn-xs md:btn-sm text-error font-black gap-1 uppercase">
                <LogOut size={14} /> <span>{t("config.finishEarly" as any)}</span>
              </button>
              <div class="divider divider-horizontal mx-0 opacity-20 hidden sm:flex"></div>
              <div class="flex flex-col">
                <span class="text-[9px] md:text-xs font-black uppercase opacity-40">Instrumento</span>
                <span class="text-[10px] md:text-sm font-bold text-primary truncate max-w-[80px]">
                   {currentInstrument().replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-3 md:gap-6 text-right">
              <div>
                <p class="text-[9px] md:text-xs font-black opacity-40 uppercase">Progreso</p>
                <p class="text-xs md:text-base font-mono font-bold leading-none">
                  {count()} / {props.settings.limit} <span class="text-secondary">+{score()}</span>
                </p>
              </div>
              <div class="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 border-base-content/5">
                <Show when={feedback() === "correct"}><CircleCheck size={26} class="text-success" /></Show>
                <Show when={feedback() === "wrong"}><CircleX size={26} class="text-error" /></Show>
                <Show when={!feedback()}><div class="w-2 h-2 rounded-full bg-base-300 animate-pulse" /></Show>
              </div>
            </div>
          </div>

          {/* BANNER DE INSTRUCCIÓN (RESTAURADO) */}
          <div 
            class="h-12 md:h-20 flex items-center justify-center border-b border-base-content/5 transition-all duration-300 px-4 text-center"
            classList={{
              'bg-success/10 text-success': feedback() === 'correct',
              'bg-error/10 text-error': feedback() === 'wrong',
              'bg-primary/5 text-primary': !feedback()
            }}
          >
            <div class="flex items-center gap-2 font-bold uppercase text-sm md:text-xl tracking-widest">
              <Show when={feedback()} fallback={
                <span class="flex flex-col md:flex-row items-center gap-1 md:gap-3">
                  <span class="opacity-40 text-[10px] md:text-xs lowercase font-serif italic">construir:</span>
                  <span class="animate-in fade-in slide-in-from-left-2">{challenge()?.root} {getCorrectChordName()} — {getCorrectInvName()}</span>
                </span>
              }>
                <span class="animate-in zoom-in duration-300">
                  {feedback() === 'correct' ? t('common.correct') : `${challenge()?.root} ${getCorrectChordName()} — ${getCorrectInvName()}`}
                </span>
              </Show>
            </div>
          </div>

          {/* ÁREA DEL PENTAGRAMA */}
          <div class="p-2 md:p-8 min-h-[160px] md:min-h-[300px] flex items-center justify-center bg-base-100">
            <VexStaff notes={sortedUserNotes()} targetNotes={feedback() ? challenge()?.notes : []} />
          </div>

          {/* REPRODUCCIÓN */}
          <div class="grid grid-cols-2 border-t border-base-content/10 bg-base-200/30">
            <button class="btn btn-ghost rounded-none border-r border-base-content/5 gap-2 h-12 md:h-16" onClick={() => audioEngine.play(sortedUserNotes())} disabled={userNotes().length === 0}>
              <Play size={18} class="fill-current" /> <span class="text-[10px] md:text-sm uppercase font-black">Mi Acorde</span>
            </button>
            <button class="btn btn-ghost rounded-none gap-2 h-12 md:h-16" onClick={() => challenge() && audioEngine.arpeggiate(challenge()!.notes)}>
              <Music2 size={18} /> <span class="text-[10px] md:text-sm uppercase font-black">Referencia</span>
            </button>
          </div>
        </div>

        {/* 2. CARD DEL PIANO Y ACCIONES INTEGRADAS */}
        <div class="card bg-base-100 shadow-xl border border-base-content/5 overflow-visible">
          <div class="card-body p-3 md:p-6 space-y-4">
            
            <PianoInput onNoteClick={handleNoteInput} selectedNotes={sortedUserNotes()} mode={spellingMode()} />

            {/* BARRA DE ACCIONES ÚNICA Y COMPACTA */}
            <div class="flex items-center gap-2 w-full h-12 md:h-16 mt-2">
              
              {/* BOTÓN DESHACER */}
              <button 
                class="btn btn-ghost border border-base-content/10 w-12 md:w-16 h-full p-0 min-h-0 flex items-center justify-center hover:bg-warning/10 transition-colors"
                onClick={undoLastNote}
                disabled={!!feedback() || userNotes().length === 0}
                title="Deshacer"
              >
                <Undo2 size={22} class="opacity-70" />
              </button>

              {/* SELECTOR DE ENARMONÍA */}
              <div class="join border border-base-content/10 bg-base-200/50 h-full">
                <button class={`join-item btn btn-ghost btn-sm md:btn-md h-full px-2 md:px-6 text-[10px] md:text-xs font-black uppercase ${spellingMode() === 'mixed' ? 'bg-primary text-white' : 'opacity-40'}`} onClick={() => setSpellingMode('mixed')}>Nat</button>
                <button class={`join-item btn btn-ghost btn-sm md:btn-md h-full px-3 md:px-8 font-bold ${spellingMode() === 'sharp' ? 'bg-primary text-white' : 'opacity-40'}`} onClick={() => setSpellingMode('sharp')}>#</button>
                <button class={`join-item btn btn-ghost btn-sm md:btn-md h-full px-3 md:px-8 font-bold ${spellingMode() === 'flat' ? 'bg-primary text-white' : 'opacity-40'}`} onClick={() => setSpellingMode('flat')}>♭</button>
              </div>

              {/* BOTÓN PRINCIPAL */}
              <div class="flex-1 h-full">
                <Show when={!feedback()} fallback={
                  <button class="btn btn-neutral h-full w-full gap-2 shadow-lg font-black uppercase text-xs md:text-base animate-in zoom-in border-none" onClick={handleNext}>
                    {isLastExercise() ? t("config.finish" as any) : t("common.next" as any)}
                    <ChevronDown size={20} class={isLastExercise() ? "" : "-rotate-90"} />
                  </button>
                }>
                  <button 
                    class="btn btn-primary h-full w-full shadow-lg font-black uppercase tracking-widest text-xs md:text-base gap-2 border-none"
                    disabled={userNotes().length === 0}
                    onClick={checkAnswer}
                  >
                    <Send size={18} /> 
                    <span class="hidden xs:inline">{t('game.submit' as any) || 'COMPROBAR'}</span>
                  </button>
                </Show>
              </div>

            </div>
          </div>
        </div>

      </div>
    </Show>
  );
};
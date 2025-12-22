import { createSignal, onMount, Show, For } from "solid-js";
import {
  generateCustomDictation,
  CHORD_TYPES,
  type ChordDictationChallenge,
} from "@bingens/core";
import { audioEngine, type InstrumentName } from "../../../lib/audio";
import { VexStaff } from "../../../components/music/VexStaff";
import { useChordI18n } from "./i18n";
import { CircleCheck, CircleX, ChevronDown, Play, Music2, LogOut } from "lucide-solid";
import type { ChordDictationSettings } from "./ChordDictationConfig";
import { ExerciseSummary } from "../ExerciseSummary";

interface Props {
  settings: ChordDictationSettings;
  onExit: () => void;
}

export const ChordDictationGame = (props: Props) => {
  const [t] = useChordI18n();
  const [challenge, setChallenge] = createSignal<ChordDictationChallenge | null>(null);
  const [count, setCount] = createSignal(1);
  const [score, setScore] = createSignal(0);
  const [isGameOver, setIsGameOver] = createSignal(false);
  const [currentInstrument, setCurrentInstrument] = createSignal<InstrumentName>("acoustic_grand_piano");
  const [selectedType, setSelectedType] = createSignal<string | null>(null);
  const [selectedInv, setSelectedInv] = createSignal<number | null>(null);
  const [feedback, setFeedback] = createSignal<"correct" | "wrong" | null>(null);
  const [voices] = createSignal([true, true, true, true]);

  // --- LÓGICA DE CONTROL DE SESIÓN ---

  const isLastExercise = () => 
    props.settings.limit !== "infinite" && count() === props.settings.limit;

  const finishSession = () => {
    setIsGameOver(true);
  };

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

  const getActiveNotes = () => {
    const currentChallenge = challenge();
    if (!currentChallenge) return [];
    return currentChallenge.notes.filter((_, index) => voices()[index] ?? true);
  };

  // --- HELPERS DE TRADUCCIÓN PARA EL BANNER ---

  const getCorrectInvName = () => {
    const inv = challenge()?.inversion;
    if (inv === undefined) return "...";
    const invKeys = ["fundamental", "first", "second", "third"];
    return t(`config.inversions_labels.${invKeys[inv]}` as any) as string;
  };

  const getCorrectChordName = () => {
    const sym = challenge()?.typeSymbol;
    if (!sym) return "...";
    return t(`chords.${sym}` as any) as string;
  };

  const getSelectedTypeName = () => {
    if (!selectedType()) return t("config.selectType" as any) as string;
    return t(`chords.${selectedType()}` as any) as string;
  };

  const getSelectedInvName = () => {
    if (selectedInv() === null) return t("config.selectInv" as any) as string;
    const invKeys = ["fundamental", "first", "second", "third"];
    return t(`config.inversions_labels.${invKeys[selectedInv()!]}` as any) as string;
  };

  // --- CICLO DE JUEGO ---

  onMount(() => nextChallenge());

  const nextChallenge = async () => {
    setFeedback(null);
    setSelectedType(null);
    setSelectedInv(null);

    const next = generateCustomDictation({
      allowedTypes: props.settings.types,
      allowedInversions: props.settings.inversions,
    });
    setChallenge(next);

    const availableInstruments = props.settings.instruments;
    const randomInstrument = availableInstruments[Math.floor(Math.random() * availableInstruments.length)] || "acoustic_grand_piano";
    setCurrentInstrument(randomInstrument);
    await audioEngine.setInstrument(randomInstrument);
    
    // Tocar el nuevo acorde (respetando si hay voces muteadas)
    setTimeout(() => audioEngine.play(getActiveNotes()), 300);
  };

  const confirmAnswer = () => {
    if (!challenge()) return;
    const isCorrect =
      challenge()!.typeSymbol === selectedType() &&
      challenge()!.inversion === selectedInv();
    if (isCorrect) {
      setFeedback("correct");
      setScore((s) => s + 1);
    } else {
      setFeedback("wrong");
    }
  };

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
      <div class="w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-2 space-y-3 md:space-y-6 animate-fade-in pb-10">
        
        {/* BLOQUE SUPERIOR UNIFICADO: CONSOLA MUSICAL */}
        <div class="flex flex-col bg-base-100 rounded-2xl shadow-xl border border-base-content/10 overflow-hidden transition-all">
          
          {/* TOOLBAR */}
          <div class="flex items-center justify-between px-3 py-2 md:px-6 md:py-4 bg-base-200/50 border-b border-base-content/5">
            <div class="flex items-center gap-2">
              <button 
                onClick={finishSession}
                class="btn btn-ghost btn-xs md:btn-sm text-error font-black gap-1 hover:bg-error/10 uppercase tracking-tighter"
              >
                <LogOut size={14} />
                <span class="hidden sm:inline">{t('config.finishEarly' as any) as string}</span>
              </button>
              <div class="divider divider-horizontal mx-0 opacity-20 hidden sm:flex"></div>
              <div class="flex flex-col">
                <span class="text-[9px] md:text-xs font-black uppercase opacity-40">Instrumento</span>
                <span class="text-[10px] md:text-sm font-bold text-primary truncate max-w-[80px] md:max-w-none">
                  {currentInstrument().replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-3 md:gap-6 text-right">
              <div>
                <p class="text-[9px] md:text-xs font-black opacity-40 uppercase tracking-widest leading-none mb-1">Progreso</p>
                <p class="text-xs md:text-lg font-mono font-bold leading-none">
                  {count()} <span class="opacity-30 text-[10px]">{props.settings.limit !== 'infinite' ? `/ ${props.settings.limit}` : '∞'}</span>
                  <span class="text-secondary ml-2">+{score()}</span>
                </p>
              </div>
              <div class="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 border-base-content/5 bg-base-100 shadow-inner">
                 <Show when={feedback() === 'correct'}><CircleCheck class="text-success" size={26} /></Show>
                 <Show when={feedback() === 'wrong'}><CircleX class="text-error" size={26} /></Show>
                 <Show when={!feedback()}><div class="w-2 h-2 md:w-3 md:h-3 rounded-full bg-base-300 animate-pulse"></div></Show>
              </div>
            </div>
          </div>

          {/* BANNER DE FEEDBACK PRE-PREPARADO */}
          <div 
            class="h-9 md:h-14 flex items-center justify-center border-b border-base-content/5 transition-all duration-300"
            classList={{
              'bg-success/10 text-success': feedback() === 'correct',
              'bg-error/10 text-error': feedback() === 'wrong',
              'bg-base-100 text-base-content/30': !feedback()
            }}
          >
            <Show 
              when={feedback()} 
              fallback={<span class="text-[10px] md:text-xs uppercase font-bold tracking-widest italic opacity-50">Escucha el acorde</span>}
            >
              <div class="flex items-center gap-2 animate-in slide-in-from-top-1 font-bold uppercase text-[11px] md:text-lg tracking-wider">
                <span>{feedback() === 'correct' ? (t('common.correct' as any) as string) : `${getCorrectChordName()} - ${getCorrectInvName()}`}</span>
              </div>
            </Show>
          </div>

          {/* ÁREA DEL PENTAGRAMA */}
          <div class="p-2 md:p-8 min-h-[140px] md:min-h-[280px] flex items-center justify-center bg-base-100">
             {/* Solo mostramos la respuesta en el pentagrama tras responder */}
             <VexStaff notes={feedback() ? (challenge()?.notes || []) : []} />
          </div>

          {/* BOTONES DE REPRODUCCIÓN */}
          <div class="grid grid-cols-2 border-t border-base-content/10 bg-base-200/30">
            <button class="btn btn-ghost rounded-none border-r border-base-content/5 gap-2 h-12 md:h-16" onClick={() => challenge() && audioEngine.play(getActiveNotes())}>
              <Play size={16} class="fill-current" /> <span class="text-[10px] md:text-sm uppercase font-black tracking-widest">Acorde</span>
            </button>
            <button class="btn btn-ghost rounded-none gap-2 h-12 md:h-16" onClick={() => challenge() && audioEngine.arpeggiate(getActiveNotes())}>
              <Music2 size={16} /> <span class="text-[10px] md:text-sm uppercase font-black tracking-widest">Arpegio</span>
            </button>
          </div>
        </div>

        {/* CARD DE SELECCIÓN */}
        <div class="card bg-base-100 shadow-lg border border-base-content/5">
          <div class="card-body p-3 md:p-8 space-y-4 md:space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              
              {/* DROPDOWN CALIDAD */}
              <div class="dropdown w-full">
                <label class="text-[9px] md:text-xs uppercase font-black opacity-40 mb-1 block ml-1 tracking-widest">Calidad</label>
                <div tabindex="0" role="button" class={`btn btn-outline btn-sm md:btn-md h-11 md:h-14 w-full justify-between font-bold border-base-content/10 ${feedback() ? 'btn-disabled' : ''}`}>
                  <span class="truncate md:text-base">{getSelectedTypeName()}</span>
                  <ChevronDown size={14} />
                </div>
                <ul tabindex="0" class="dropdown-content z-[30] menu p-1 shadow-2xl bg-base-100 rounded-xl w-full border border-base-content/10 mt-1 max-h-60 overflow-y-auto">
                  <For each={CHORD_TYPES.filter(t => props.settings.types.includes(t.symbol))}>{(type) => (
                    <li>
                      <button class="py-3 md:text-base font-bold" onClick={() => {(document.activeElement as HTMLElement)?.blur(); setSelectedType(type.symbol)}}>
                        {t(`chords.${type.symbol}` as any) as string}
                      </button>
                    </li>
                  )}</For>
                </ul>
              </div>

              {/* DROPDOWN INVERSIÓN */}
              <div class="dropdown w-full">
                <label class="text-[9px] md:text-xs uppercase font-black opacity-40 mb-1 block ml-1 tracking-widest">Estado</label>
                <div tabindex="0" role="button" class={`btn btn-outline btn-sm md:btn-md h-11 md:h-14 w-full justify-between font-bold border-base-content/10 ${feedback() ? 'btn-disabled' : ''}`}>
                  <span class="truncate md:text-base">{getSelectedInvName()}</span>
                  <ChevronDown size={14} />
                </div>
                <ul tabindex="0" class="dropdown-content z-[30] menu p-1 shadow-2xl bg-base-100 rounded-xl w-full border border-base-content/10 mt-1">
                  <For each={props.settings.inversions}>{(inv) => (
                    <li>
                      <button class="py-3 md:text-base font-bold" onClick={() => {(document.activeElement as HTMLElement)?.blur(); setSelectedInv(inv)}}>
                        {t(`config.inversions_labels.${["fundamental", "first", "second", "third"][inv]}` as any) as string}
                      </button>
                    </li>
                  )}</For>
                </ul>
              </div>
            </div>

            {/* BOTÓN DE ACCIÓN FINAL */}
            <div class="pt-1">
              <Show when={!feedback()} fallback={
                <button 
                  class="btn btn-neutral btn-md md:btn-lg w-full gap-3 shadow-lg font-black uppercase text-xs md:text-base animate-in zoom-in" 
                  onClick={handleNext}
                >
                  {isLastExercise() ? (t('config.finish' as any) as string) : (t('common.next' as any) as string)}
                  <ChevronDown size={20} class={isLastExercise() ? "" : "-rotate-90"} />
                </button>
              }>
                <button 
                  class="btn btn-primary btn-md md:btn-lg w-full shadow-lg font-black uppercase tracking-widest text-xs md:text-base"
                  disabled={selectedType() === null || selectedInv() === null}
                  onClick={confirmAnswer}
                >
                  {t('common.confirm' as any) as string}
                </button>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};
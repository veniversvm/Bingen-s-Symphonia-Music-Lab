import { createSignal, onMount, Show, For } from 'solid-js';
import { generateCustomDictation, CHORD_TYPES, type ChordDictationChallenge } from '@bingens/core';
import { audioEngine, type InstrumentName } from '../../../lib/audio';
import { VexStaff } from '../../../components/music/VexStaff';
import { useChordI18n } from './i18n';
import { 
  CircleCheck, 
  CircleX,     
  ChevronDown, 
  Play, 
  Music2 
} from 'lucide-solid';
import type { ChordDictationSettings } from './ChordDictationConfig';

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
  const [currentInstrument, setCurrentInstrument] = createSignal<InstrumentName>('acoustic_grand_piano');
  const [selectedType, setSelectedType] = createSignal<string | null>(null);
  const [selectedInv, setSelectedInv] = createSignal<number | null>(null);
  const [feedback, setFeedback] = createSignal<'correct' | 'wrong' | null>(null);
  const [voices] = createSignal([true, true, true, true]);

  const getActiveNotes = () => {
    const currentChallenge = challenge();
    if (!currentChallenge) return [];
    return currentChallenge.notes.filter((_, index) => voices()[index] ?? true);
  };

  // NUEVO HELPER: Para mostrar la inversión correcta en el overlay de error
  const getCorrectInvName = () => {
    const inv = challenge()?.inversion;
    if (inv === undefined) return "...";
    const invKeys = ["fundamental", "first", "second", "third"];
    // @ts-ignore
    return t(`config.inversions_labels.${invKeys[inv]}`) as string;
  };


  const getCorrectChordName = () => {
    const sym = challenge()?.typeSymbol;
    if (!sym) return "...";
    // @ts-ignore
    return t(`chords.${sym}`) as string;
  };

  
  onMount(() => nextChallenge());

  const nextChallenge = async () => {
    if (props.settings.limit !== 'infinite' && count() > props.settings.limit) {
      setIsGameOver(true);
      return;
    }
    setFeedback(null);
    setSelectedType(null);
    setSelectedInv(null);
    
    const next = generateCustomDictation({
      allowedTypes: props.settings.types,
      allowedInversions: props.settings.inversions
    });
    setChallenge(next);

    const randomInstrument = props.settings.instruments[Math.floor(Math.random() * props.settings.instruments.length)] || 'acoustic_grand_piano';
    setCurrentInstrument(randomInstrument);
    await audioEngine.setInstrument(randomInstrument);
    setTimeout(() => audioEngine.play(getActiveNotes()), 300);
  };

  const confirmAnswer = () => {
    if (!challenge()) return;
    const isCorrect = challenge()!.typeSymbol === selectedType() && challenge()!.inversion === selectedInv();
    if (isCorrect) {
      setFeedback('correct');
      setScore(s => s + 1);
    } else {
      setFeedback('wrong');
    }
  };

  const handleNext = () => {
    setCount(c => c + 1);
    nextChallenge();
  };

  const getSelectedTypeName = () => {
    if (!selectedType()) return t('config.selectType') as string;
    return t(`chords.${selectedType()}` as any) as string;
  };

  const getSelectedInvName = () => {
    if (selectedInv() === null) return t('config.selectInv') as string;
    const invKeys = ["fundamental", "first", "second", "third"];
    return t(`config.inversions_labels.${invKeys[selectedInv()!]}` as any) as string;
  };

  if (isGameOver()) {
    return (
      <div class="card bg-base-100 shadow-2xl max-w-sm mx-auto text-center p-8 mt-10 border border-primary/20">
        <h2 class="text-2xl font-serif font-bold mb-4">Sesión Finalizada</h2>
        <div class="stat p-0 mb-6">
          <div class="stat-title italic">Puntaje</div>
          <div class="stat-value text-primary text-4xl">{score()} / {props.settings.limit}</div>
        </div>
        <button class="btn btn-primary w-full" onClick={props.onExit}>Menu Principal</button>
      </div>
    );
  }

  
  return (
    <div class="w-full max-w-md mx-auto px-2 space-y-2 animate-fade-in">
      
      {/* 1. BLOQUE SUPERIOR UNIFICADO (Toolbar + Feedback + Pentagrama) */}
      <div class="flex flex-col bg-base-100 rounded-2xl shadow-xl border border-base-content/10 overflow-hidden">
        
        {/* TOOLBAR SUPERIOR COMPACTA */}
        <div class="flex items-center justify-between px-3 py-2 bg-base-200/50 border-b border-base-content/5">
          <div class="flex flex-col">
            <span class="text-[9px] font-black uppercase opacity-40 tracking-tighter">Instrumento</span>
            <span class="text-[10px] font-bold text-primary truncate max-w-[100px]">
              {currentInstrument().replace(/_/g, ' ')}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-right">
              <p class="text-[9px] font-black opacity-40 uppercase">Progreso</p>
              <p class="text-xs font-mono font-bold leading-none">{count()} / {props.settings.limit} <span class="text-secondary">+{score()}</span></p>
            </div>
            {/* Indicador circular de estado */}
            <div class="w-8 h-8 rounded-full flex items-center justify-center border-2 border-base-content/5">
               <Show when={feedback() === 'correct'}><CircleCheck class="text-success" size={22} /></Show>
               <Show when={feedback() === 'wrong'}><CircleX class="text-error" size={22} /></Show>
               <Show when={!feedback()}><div class="w-2 h-2 rounded-full bg-base-300 animate-pulse"></div></Show>
            </div>
          </div>
        </div>

        {/* BANNER DE FEEDBACK PRE-PREPARADO (Siempre ocupa espacio) */}
        <div 
          class="h-9 flex items-center justify-center border-b border-base-content/5 transition-colors duration-300"
          classList={{
            'bg-success/10 text-success': feedback() === 'correct',
            'bg-error/10 text-error': feedback() === 'wrong',
            'bg-base-100 text-base-content/30': !feedback()
          }}
        >
          <Show 
            when={feedback()} 
            fallback={<span class="text-[10px] uppercase font-bold tracking-widest italic">{t('home.subtitle' as any) || 'Escucha el acorde'}</span>}
          >
            <div class="flex items-center gap-2 animate-in slide-in-from-top-1 font-bold uppercase text-[11px] tracking-wider">
              <span>{feedback() === 'correct' ? t('common.correct') as string : `${getCorrectChordName()} - ${getCorrectInvName()}`}</span>
            </div>
          </Show>
        </div>

        {/* ÁREA DEL PENTAGRAMA */}
        <div class="p-2 min-h-[140px] flex items-center justify-center bg-base-100">
           {/* El VexStaff siempre está ahí o muestra el placeholder central */}
           <Show when={feedback() || true}> 
              <VexStaff notes={feedback() ? (challenge()?.notes || []) : []} />
           </Show>
        </div>

        {/* BOTONES DE REPRODUCCIÓN INTEGRADOS */}
        <div class="grid grid-cols-2 border-t border-base-content/10 bg-base-200/30">
          <button class="btn btn-ghost rounded-none border-r border-base-content/5 gap-2 h-12" onClick={() => challenge() && audioEngine.play(getActiveNotes())}>
            <Play size={16} class="fill-current" /> <span class="text-[10px] uppercase font-bold">Acorde</span>
          </button>
          <button class="btn btn-ghost rounded-none gap-2 h-12" onClick={() => challenge() && audioEngine.arpeggiate(getActiveNotes())}>
            <Music2 size={16} /> <span class="text-[10px] uppercase font-bold">Arpegio</span>
          </button>
        </div>
      </div>

      {/* 2. CARD DE SELECCIÓN (Más compacta) */}
      <div class="card bg-base-100 shadow-lg border border-base-content/5">
        <div class="card-body p-3 space-y-3">
          
          <div class="grid grid-cols-1 gap-2">
            {/* DROPDOWN CALIDAD */}
            <div class="dropdown w-full">
              <label class="text-[9px] uppercase font-black opacity-40 mb-1 block ml-1 tracking-widest">Calidad</label>
              <div tabindex="0" role="button" class={`btn btn-outline btn-sm h-11 w-full justify-between font-bold border-base-content/10 ${feedback() ? 'btn-disabled' : ''}`}>
                <span class="truncate">{getSelectedTypeName()}</span>
                <ChevronDown size={14} />
              </div>
              <ul tabindex="0" class="dropdown-content z-[30] menu p-1 shadow-2xl bg-base-100 rounded-xl w-full border border-base-content/10 mt-1 max-h-48 overflow-y-auto">
                <For each={CHORD_TYPES.filter(t => props.settings.types.includes(t.symbol))}>{(type) => (
                  <li>
                    <button class="py-2 text-xs font-bold" onClick={() => {(document.activeElement as HTMLElement)?.blur(); setSelectedType(type.symbol)}}>
                      {t(`chords.${type.symbol}` as any) as string}
                    </button>
                  </li>
                )}</For>
              </ul>
            </div>

            {/* DROPDOWN INVERSIÓN */}
            <div class="dropdown w-full">
              <label class="text-[9px] uppercase font-black opacity-40 mb-1 block ml-1 tracking-widest">Estado</label>
              <div tabindex="0" role="button" class={`btn btn-outline btn-sm h-11 w-full justify-between font-bold border-base-content/10 ${feedback() ? 'btn-disabled' : ''}`}>
                <span class="truncate">{getSelectedInvName()}</span>
                <ChevronDown size={14} />
              </div>
              <ul tabindex="0" class="dropdown-content z-[30] menu p-1 shadow-2xl bg-base-100 rounded-xl w-full border border-base-content/10 mt-1">
                <For each={props.settings.inversions}>{(inv) => (
                  <li>
                    <button class="py-2 text-xs font-bold" onClick={() => {(document.activeElement as HTMLElement)?.blur(); setSelectedInv(inv)}}>
                      {inv === 0 ? "Fundamental" : `${inv}ª Inversión`}
                    </button>
                  </li>
                )}</For>
              </ul>
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN PRINCIPAL (Compacto) */}
          <div class="pt-1">
            <Show when={!feedback()} fallback={
              <button class="btn btn-neutral btn-md w-full gap-3 shadow-lg font-black uppercase text-xs" onClick={handleNext}>
                {t('common.next') as string}
                <ChevronDown size={18} class="-rotate-90" />
              </button>
            }>
              <button 
                class="btn btn-primary btn-md w-full shadow-lg font-black uppercase tracking-widest text-xs"
                disabled={selectedType() === null || selectedInv() === null}
                onClick={confirmAnswer}
              >
                {t('common.confirm') as string}
              </button>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};
import { createSignal, onMount, Show, For } from 'solid-js';
import { generateCustomDictation, CHORD_TYPES, type ChordDictationChallenge } from '@bingens/core';
import { audioEngine, type InstrumentName } from '../../lib/audio';
import { VexStaff } from '../../components/music/VexStaff';
// Asegúrate de que este import coincida con el nombre de tu archivo de config
import type { ChordDictationSettings } from './ChordDictationConfig'; 

interface Props {
  settings: ChordDictationSettings;
  onExit: () => void;
}

export const ChordDictationGame = (props: Props) => {
  const [challenge, setChallenge] = createSignal<ChordDictationChallenge | null>(null);
  
  // Estado de Progreso
  const [count, setCount] = createSignal(1);
  const [score, setScore] = createSignal(0);
  const [isGameOver, setIsGameOver] = createSignal(false);

  // Estado de Audio (Multi-instrumento)
  const [currentInstrument, setCurrentInstrument] = createSignal<InstrumentName>('acoustic_grand_piano');

  // Estado de Respuesta
  const [selectedType, setSelectedType] = createSignal<string | null>(null);
  const [selectedInv, setSelectedInv] = createSignal<number | null>(null);
  const [feedback, setFeedback] = createSignal<'correct' | 'wrong' | null>(null);

  // 1. Asegúrate de tener el signal de voces (por si se perdió)
const [voices] = createSignal([true, true, true, true]);

// 2. Inserta esta función:
const getActiveNotes = () => {
  const currentChallenge = challenge();
  if (!currentChallenge) return [];

  // Filtramos las notas según el estado de los checkboxes de voces.
  // Nota 0 suele ser el Bajo, la última nota es el Soprano.
  return currentChallenge.notes.filter((_, index) => {
    // Si el acorde tiene 3 notas (tríada), usamos los índices 0, 1 y 2 de voices.
    // Si tiene 4 (séptima), usamos 0, 1, 2 y 3.
    return voices()[index] ?? true;
  });
};

// 3. (Opcional) La función para cambiar las voces que usa el UI:
// const toggleVoice = (idx: number) => {
//   const newVoices = [...voices()];
//   newVoices[idx] = !newVoices[idx];
//   setVoices(newVoices);
// };

  // Cargar primer ejercicio
  onMount(() => nextChallenge());

  const nextChallenge = async () => {
    // Verificar si terminamos (si no es infinito)
    if (props.settings.limit !== 'infinite' && count() > props.settings.limit) {
      setIsGameOver(true);
      return;
    }

    setFeedback(null);
    setSelectedType(null);
    setSelectedInv(null);
    
    // 1. Generar reto musical
    const next = generateCustomDictation({
      allowedTypes: props.settings.types,
      allowedInversions: props.settings.inversions
    });
    setChallenge(next);

    // 2. Elegir Instrumento Aleatorio de la lista permitida
    const availableInstruments = props.settings.instruments;
    // Fallback a piano si por error viene vacía
    const randomInstrument = availableInstruments.length > 0 
      ? availableInstruments[Math.floor(Math.random() * availableInstruments.length)]
      : 'acoustic_grand_piano';
    
    setCurrentInstrument(randomInstrument);
    
    // 3. Cargar instrumento y reproducir
    await audioEngine.setInstrument(randomInstrument);
    
    // Pequeño delay para asegurar que el usuario esté listo
    setTimeout(() => audioEngine.play(next.notes), 300);
  };

  const confirmAnswer = () => {
    if (!challenge()) return;
    
    const correctType = challenge()!.typeSymbol === selectedType();
    const correctInv = challenge()!.inversion === selectedInv();

    if (correctType && correctInv) {
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

  // Pantalla de Resultados Finales
  if (isGameOver()) {
    return (
      <div class="card bg-base-100 shadow-xl max-w-lg mx-auto text-center p-8 animate-in zoom-in">
        <h2 class="text-3xl font-serif mb-4">¡Entrenamiento Completado!</h2>
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Puntuación Final</div>
            <div class="stat-value text-primary">{score()} / {props.settings.limit}</div>
            <div class="stat-desc">Aciertos</div>
          </div>
        </div>
        <button class="btn btn-primary mt-8 w-full" onClick={props.onExit}>Volver al Menú</button>
      </div>
    );
  }

  return (
    <div class="w-full max-w-6xl mx-auto space-y-4 md:space-y-8 animate-fade-in px-2 md:px-6">
      
      {/* 1. STATUS BAR (Top) */}
      <div class="flex justify-between items-center bg-base-100 p-3 rounded-2xl shadow-sm border border-base-content/5">
        <div class="flex flex-col">
          <span class="text-[10px] uppercase font-bold opacity-50 tracking-tighter">Progreso</span>
          <span class="font-mono text-lg leading-none">{count()} / {props.settings.limit}</span>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-[10px] uppercase font-bold opacity-50 tracking-tighter">Aciertos</span>
          <span class="text-secondary font-bold text-lg leading-none">{score()}</span>
        </div>
      </div>
  
      {/* 2. MAIN GRID */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: AUDIO Y VISUAL (8 columnas en PC) */}
        <div class="lg:col-span-7 space-y-4">
          <div class="card bg-base-100 shadow-xl border border-base-content/5 overflow-hidden">
            <div class="card-body p-4 md:p-8">
              <div class="flex justify-between items-center mb-4">
                 <h3 class="font-serif text-xl opacity-70">Escucha Atenta</h3>
                 <div class="badge badge-outline text-[10px] uppercase">{currentInstrument().replace(/_/g, ' ')}</div>
              </div>
  
              {/* PENTAGRAMA: Fondo crema estilo papel */}
              <div class="w-full bg-music-paper/10 dark:bg-base-200 rounded-xl p-2 md:p-6 border border-base-content/10 min-h-[180px] flex items-center justify-center">
                <Show when={feedback()} fallback={
                  <div class="flex flex-col items-center opacity-20 animate-pulse">
                    <div class="w-20 h-20 border-4 border-dashed border-current rounded-full flex items-center justify-center">
                       <span class="text-4xl">?</span>
                    </div>
                    <p class="mt-2 text-sm font-serif">Escucha y responde...</p>
                  </div>
                }>
                  <VexStaff notes={challenge()?.notes || []} />
                </Show>
              </div>
  
              {/* CONTROLES DE AUDIO: Botones grandes para móvil */}
              <div class="flex gap-4 mt-6">
                <button 
                  class="btn btn-primary btn-lg flex-1 shadow-lg active:scale-95 transition-transform" 
                  onClick={() => challenge() && audioEngine.play(getActiveNotes())}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  Acorde
                </button>
                <button 
                  class="btn btn-secondary btn-lg flex-1 shadow-lg active:scale-95 transition-transform" 
                  onClick={() => challenge() && audioEngine.arpeggiate(getActiveNotes())}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                  Arpegio
                </button>
              </div>
            </div>
          </div>
  
          {/* FEEDBACK ALERT (Mobile friendly) */}
          <Show when={feedback()}>
            <div class={`alert shadow-lg ${feedback() === 'correct' ? 'alert-success' : 'alert-error'} animate-in slide-in-from-top-4`}>
               <span class="font-bold">
                 {feedback() === 'correct' ? '¡Excelente!' : `Incorrecto. Era ${CHORD_TYPES.find(t => t.symbol === challenge()?.typeSymbol)?.label}`}
               </span>
            </div>
          </Show>
        </div>
  
        {/* COLUMNA DERECHA: SELECCIÓN (5 columnas en PC) */}
        <div class="lg:col-span-5 space-y-4">
          <div class="card bg-base-100 shadow-xl border border-base-content/5">
            <div class="card-body p-4 md:p-6">
              
              <div class="space-y-6">
                {/* Tipos: Usamos grid de 2 columnas en móvil para que los botones sean grandes */}
                <div>
                  <label class="label-text font-bold mb-3 block text-primary">Calidad del Acorde</label>
                  <div class="grid grid-cols-2 gap-2">
                    <For each={CHORD_TYPES.filter(t => props.settings.types.includes(t.symbol))}>{(type) => (
                      <button 
                        class={`btn btn-md md:btn-sm ${selectedType() === type.symbol ? 'btn-primary' : 'btn-outline opacity-60'}`}
                        disabled={!!feedback()}
                        onClick={() => setSelectedType(type.symbol)}
                      >
                        {type.label}
                      </button>
                    )}</For>
                  </div>
                </div>
  
                {/* Inversiones */}
                <div>
                  <label class="label-text font-bold mb-3 block text-secondary">Estado / Inversión</label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <For each={props.settings.inversions}>{(inv) => (
                      <button 
                        class={`btn btn-md md:btn-sm ${selectedInv() === inv ? 'btn-secondary' : 'btn-outline opacity-60'}`}
                        disabled={!!feedback()}
                        onClick={() => setSelectedInv(inv)}
                      >
                        {inv === 0 ? 'Fundamental' : `${inv}ª Inv.`}
                      </button>
                    )}</For>
                  </div>
                </div>
  
                {/* ACCIÓN PRINCIPAL */}
                <div class="pt-4">
                  <Show when={!feedback()} fallback={
                    <button class="btn btn-neutral btn-lg w-full gap-2 animate-bounce" onClick={handleNext}>
                      Siguiente Reto <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  }>
                    <button 
                      class="btn btn-primary btn-lg w-full shadow-xl"
                      disabled={!selectedType() || selectedInv() === null}
                      onClick={confirmAnswer}
                    >
                      Confirmar
                    </button>
                  </Show>
                </div>
  
              </div>
            </div>
          </div>
        </div>
  
      </div>
    </div>
  );
};
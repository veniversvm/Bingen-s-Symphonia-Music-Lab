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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6"> 
      {/* Barra de Progreso */}
      <div class="flex justify-between items-end px-2">
        <span class="text-sm font-mono opacity-50">
          Ejercicio {count()} {props.settings.limit !== 'infinite' && `/ ${props.settings.limit}`}
        </span>
        <span class="badge badge-lg">Aciertos: {score()}</span>
      </div>
      <progress 
        class="progress progress-primary w-full transition-all duration-500" 
        value={count()} 
        max={props.settings.limit === 'infinite' ? 100 : props.settings.limit}
      ></progress>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* COLUMNA IZQUIERDA: AUDIO Y FEEDBACK */}
        <div class="card bg-base-100 shadow-xl h-fit border border-base-content/5">
          <div class="card-body items-center text-center">
            <h3 class="card-title font-serif">Escucha</h3>
            
            {/* Badge de Instrumento Activo */}
            <div class="badge badge-ghost gap-2 mb-2 text-xs opacity-70">
              Timbre: <span class="uppercase font-bold">{currentInstrument().replace(/_/g, ' ')}</span>
            </div>
            
            <div class="flex gap-4 my-4">
              <button 
                class="btn btn-circle btn-primary btn-lg shadow-lg hover:scale-105 transition-transform" 
                onClick={() => challenge() && audioEngine.play(challenge()!.notes)}
                title="Repetir Acorde"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
              <button 
                class="btn btn-circle btn-secondary btn-lg shadow-lg hover:scale-105 transition-transform" 
                onClick={() => challenge() && audioEngine.arpeggiate(challenge()!.notes)}
                title="Escuchar Arpegio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path></svg>
              </button>
            </div>

            <div class="divider"></div>

            {/* Visualización de Pentagrama (Solo si ya respondió) */}
            <div class="w-full h-40 bg-base-200/50 rounded-lg flex items-center justify-center relative overflow-hidden border border-base-content/10">
              <Show when={feedback()} fallback={<span class="opacity-20 italic font-serif text-2xl">? ? ?</span>}>
                 <VexStaff notes={challenge()?.notes || []} width={280} />
              </Show>
            </div>

            <Show when={feedback() === 'correct'}>
              <div class="alert alert-success mt-4 animate-in fade-in slide-in-from-bottom-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>¡Correcto!</span>
              </div>
            </Show>
            <Show when={feedback() === 'wrong'}>
              <div class="alert alert-error mt-4 animate-in fade-in slide-in-from-bottom-2 text-left">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div class="flex flex-col">
                  <span class="font-bold">Respuesta Incorrecta</span>
                  <span class="text-xs">Era: {CHORD_TYPES.find(t => t.symbol === challenge()?.typeSymbol)?.label} ({challenge()?.inversion}ª inv)</span>
                </div>
              </div>
            </Show>
          </div>
        </div>

        {/* COLUMNA DERECHA: SELECCIÓN */}
        <div class="card bg-base-100 shadow-xl border border-base-content/5 h-fit">
          <div class="card-body">
            <h3 class="card-title text-sm opacity-50 uppercase tracking-widest">Tu Respuesta</h3>
            
            <div class="space-y-6 mt-2">
              {/* Tipos */}
              <div>
                <label class="label"><span class="label-text font-bold text-primary">Tipo de Acorde</span></label>
                <div class="grid grid-cols-2 gap-2">
                  <For each={CHORD_TYPES.filter(t => props.settings.types.includes(t.symbol))}>{(type) => (
                    <button 
                      class={`btn btn-sm ${selectedType() === type.symbol ? 'btn-neutral ring-2 ring-primary ring-offset-2' : 'btn-outline border-base-content/20'}`}
                      onClick={() => setSelectedType(type.symbol)}
                      disabled={!!feedback()}
                    >
                      {type.label}
                    </button>
                  )}</For>
                </div>
              </div>

              {/* Inversiones */}
              <div>
                <label class="label"><span class="label-text font-bold text-secondary">Estado</span></label>
                <div class="grid grid-cols-2 gap-2">
                  <For each={props.settings.inversions}>{(inv) => (
                    <button 
                      class={`btn btn-sm ${selectedInv() === inv ? 'btn-neutral ring-2 ring-secondary ring-offset-2' : 'btn-outline border-base-content/20'}`}
                      onClick={() => setSelectedInv(inv)}
                      disabled={!!feedback()}
                    >
                      {inv === 0 ? 'Fundamental' : `${inv}ª Inv`}
                    </button>
                  )}</For>
                </div>
              </div>

              {/* Botones de Acción Final */}
              <div class="pt-6">
                <Show when={!feedback()}>
                  <button 
                    class="btn btn-primary w-full shadow-lg"
                    disabled={!selectedType() || selectedInv() === null}
                    onClick={confirmAnswer}
                  >
                    Confirmar Respuesta
                  </button>
                </Show>

                <Show when={feedback()}>
                  <button 
                    class="btn btn-outline w-full animate-pulse border-2" 
                    onClick={handleNext}
                    // Auto-focus para poder dar Enter y seguir
                    ref={el => setTimeout(() => el.focus(), 100)} 
                  >
                    Siguiente Ejercicio →
                  </button>
                </Show>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
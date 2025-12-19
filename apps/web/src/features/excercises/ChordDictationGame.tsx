import { createSignal, onMount, Show, For } from 'solid-js';
import { generateCustomDictation, CHORD_TYPES, type ChordDictationChallenge } from '@bingens/core';
import { audioEngine } from '../../lib/audio';
import { VexStaff } from '../../components/music/VexStaff';
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

  // Estado de Respuesta
  const [selectedType, setSelectedType] = createSignal<string | null>(null);
  const [selectedInv, setSelectedInv] = createSignal<number | null>(null);
  const [feedback, setFeedback] = createSignal<'correct' | 'wrong' | null>(null);

  // Cargar primer ejercicio
  onMount(() => nextChallenge());

  const nextChallenge = () => {
    // Verificar si terminamos (si no es infinito)
    if (props.settings.limit !== 'infinite' && count() > props.settings.limit) {
      setIsGameOver(true);
      return;
    }

    setFeedback(null);
    setSelectedType(null);
    setSelectedInv(null);
    
    // Generar usando la configuración
    const next = generateCustomDictation({
      allowedTypes: props.settings.types,
      allowedInversions: props.settings.inversions
    });
    setChallenge(next);
    
    // Reproducir automáticamente al cargar (pequeño delay para UX)
    setTimeout(() => audioEngine.play(next.notes), 500);
  };

  const confirmAnswer = () => {
    if (!challenge()) return;
    
    const correctType = challenge()!.typeSymbol === selectedType();
    const correctInv = challenge()!.inversion === selectedInv();

    if (correctType && correctInv) {
      setFeedback('correct');
      setScore(s => s + 1);
      // Sonido de éxito sutil (opcional)
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
      <div class="card bg-base-100 shadow-xl max-w-lg mx-auto text-center p-8">
        <h2 class="text-3xl font-serif mb-4">¡Entrenamiento Completado!</h2>
        <div class="stat">
          <div class="stat-title">Puntuación Final</div>
          <div class="stat-value text-primary">{score()} / {props.settings.limit}</div>
        </div>
        <button class="btn btn-primary mt-6" onClick={props.onExit}>Volver al Menú</button>
      </div>
    );
  }

  return (
    <div class="max-w-4xl mx-auto space-y-6">
      {/* Barra de Progreso */}
      <div class="flex justify-between items-end px-2">
        <span class="text-sm font-mono opacity-50">
          Ejercicio {count()} {props.settings.limit !== 'infinite' && `/ ${props.settings.limit}`}
        </span>
        <span class="badge badge-lg">Aciertos: {score()}</span>
      </div>
      <progress class="progress progress-primary w-full" value={count()} max={props.settings.limit === 'infinite' ? 100 : props.settings.limit}></progress>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* COLUMNA IZQUIERDA: AUDIO Y FEEDBACK */}
        <div class="card bg-base-100 shadow-xl h-fit">
          <div class="card-body items-center text-center">
            <h3 class="card-title font-serif">Escucha</h3>
            
            <div class="flex gap-4 my-4">
              <button class="btn btn-circle btn-primary btn-lg" onClick={() => challenge() && audioEngine.play(challenge()!.notes)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
              <button 
                class="btn btn-circle btn-secondary btn-lg" 
                onClick={() => challenge() && audioEngine.arpeggiate(challenge()!.notes)}
                title="Arpegio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path></svg>
              </button>
            </div>

            <div class="divider"></div>

            {/* Visualización de Pentagrama (Solo si ya respondió) */}
            <div class="w-full h-32 bg-base-200 rounded-lg flex items-center justify-center relative">
              <Show when={feedback()} fallback={<span class="opacity-30 italic">? ? ?</span>}>
                 <VexStaff notes={challenge()?.notes || []} width={250} />
              </Show>
            </div>

            <Show when={feedback() === 'correct'}>
              <div class="alert alert-success mt-4">¡Correcto!</div>
            </Show>
            <Show when={feedback() === 'wrong'}>
              <div class="alert alert-error mt-4">
                Era: {CHORD_TYPES.find(t => t.symbol === challenge()?.typeSymbol)?.label} ({challenge()?.inversion}ª inv)
              </div>
            </Show>
          </div>
        </div>

        {/* COLUMNA DERECHA: SELECCIÓN */}
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title text-sm opacity-50 uppercase">Tu Respuesta</h3>
            
            <div class="space-y-6 mt-2">
              {/* Tipos */}
              <div>
                <label class="label"><span class="label-text font-bold">Tipo de Acorde</span></label>
                <div class="flex flex-wrap gap-2">
                  <For each={CHORD_TYPES.filter(t => props.settings.types.includes(t.symbol))}>{(type) => (
                    <button 
                      class={`btn btn-sm grow ${selectedType() === type.symbol ? 'btn-neutral' : 'btn-outline'}`}
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
                <label class="label"><span class="label-text font-bold">Estado</span></label>
                <div class="flex flex-wrap gap-2">
                  <For each={props.settings.inversions}>{(inv) => (
                    <button 
                      class={`btn btn-sm grow ${selectedInv() === inv ? 'btn-neutral' : 'btn-outline'}`}
                      onClick={() => setSelectedInv(inv)}
                      disabled={!!feedback()}
                    >
                      {inv === 0 ? 'Fundamental' : `${inv}ª Inv`}
                    </button>
                  )}</For>
                </div>
              </div>

              {/* Botón Acción */}
              <div class="pt-4">
                <Show when={!feedback()}>
                  <button 
                    class="btn btn-primary w-full"
                    disabled={!selectedType() || selectedInv() === null}
                    onClick={confirmAnswer}
                  >
                    Confirmar
                  </button>
                </Show>

                <Show when={feedback()}>
                  <button class="btn btn-outline w-full animate-pulse" onClick={handleNext}>
                    Siguiente →
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
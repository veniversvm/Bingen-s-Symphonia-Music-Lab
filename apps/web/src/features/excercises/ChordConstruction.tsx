import { createSignal, onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { generateChordChallenge, type ChordChallenge } from '@bingens/core';
import { VexStaff } from '../../components/music/VexStaff';
// 1. IMPORTAMOS EL NUEVO MOTOR Y EL SELECTOR
import { audioEngine } from '../../lib/audio';
import { InstrumentSelector } from '../../components/music/InstrumentSelector';

export default function ChordConstruction() {
  const [challenge, setChallenge] = createSignal<ChordChallenge | null>(null);
  const [showAnswer, setShowAnswer] = createSignal(false);

  // Generar primer ejercicio al montar
  onMount(() => {
    loadNewChallenge();
  });

  const loadNewChallenge = () => {
    setShowAnswer(false);
    const newChallenge = generateChordChallenge(1); // Nivel 1
    setChallenge(newChallenge);
  };

  return (
    <div class="space-y-8 animate-fade-in">
      {/* Header de Navegación */}
      <div class="flex items-center gap-2 text-sm opacity-70">
        <A href="/exercises" class="hover:underline">Ejercicios</A> 
        <span>/</span>
        <span>Acordes</span>
      </div>

      <div class="card bg-base-100 shadow-xl border border-base-content/5">
        <div class="card-body items-center text-center">
          
          {/* TÍTULO Y BOTÓN DE REPRODUCCIÓN */}
          <div class="flex items-center gap-3 justify-center mb-2">
            <h2 class="card-title text-2xl font-serif">
              {challenge()?.prompt || "Cargando..."}
            </h2>
            
            <button 
              class="btn btn-circle btn-sm btn-ghost text-secondary hover:bg-secondary/10"
              // 2. USAMOS audioEngine.play EN LUGAR DE playChord
              onClick={() => challenge() && audioEngine.play(challenge()!.notes)}
              title="Escuchar Acorde"
              disabled={!challenge()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
            </button>
          </div>

          <p class="text-sm opacity-60 mb-4">Nivel 1 • Tríadas Mayores y Menores</p>

          {/* 3. AQUÍ INSERTAMOS EL SELECTOR DE INSTRUMENTOS */}
          <InstrumentSelector />

          {/* ÁREA DEL PENTAGRAMA */}
          <div class="w-full max-w-md bg-base-200/50 rounded-lg p-4 my-6 border border-base-content/10">
            <VexStaff 
              notes={showAnswer() && challenge() ? challenge()!.notes : []} 
              clef="treble" 
            />
            
            {!showAnswer() && (
              <p class="text-xs text-center mt-2 opacity-50 italic">
                (El pentagrama se llenará al ver la respuesta)
              </p>
            )}
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div class="card-actions justify-center w-full gap-4">
            {!showAnswer() ? (
              <button 
                class="btn btn-primary w-full md:w-auto min-w-[150px]"
                onClick={() => {
                  setShowAnswer(true);
                  // 4. USAMOS audioEngine TAMBIÉN AL REVELAR
                  if(challenge()) audioEngine.play(challenge()!.notes);
                }}
              >
                Ver Respuesta
              </button>
            ) : (
              <div class="flex gap-2 w-full justify-center">
                 <button class="btn btn-error w-1/2 md:w-auto" onClick={loadNewChallenge}>
                   Fallé
                 </button>
                 <button class="btn btn-success w-1/2 md:w-auto" onClick={loadNewChallenge}>
                   ¡Correcto!
                 </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* DEBUG PANEL */}
      <div class="collapse collapse-arrow bg-base-200 rounded-box">
        <input type="checkbox" /> 
        <div class="collapse-title text-xs opacity-50 font-mono">
          Debug Info
        </div>
        <div class="collapse-content text-xs font-mono">
          <p>Notas Esperadas: {JSON.stringify(challenge()?.notes)}</p>
        </div>
      </div>
    </div>
  );
}
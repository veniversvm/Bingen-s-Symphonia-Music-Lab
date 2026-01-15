// apps/web/src/features/excercises/MelodicDictation/MelodicDictation.tsx
import { createSignal, Show, createResource, For } from "solid-js";
import MelodicWorkstation from "./MelodicWorkstation";
import type { MelodicExercise } from "@bingens/core";
import { fetchExerciseDirectory } from "./dataLoader";

export default function MelodicDictation() {
  const [measures, setMeasures] = createSignal(4);
  const [selectedExercise, setSelectedExercise] = createSignal<MelodicExercise | null>(null);

  // Cargamos los ejercicios cada vez que cambia la cantidad de compases
  const [exercises] = createResource(measures, fetchExerciseDirectory);

  const startGame = (ex: MelodicExercise) => {
    setSelectedExercise(ex);
  };

  return (
    <Show when={selectedExercise()} fallback={
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="card bg-base-100 shadow-xl p-6">
          <h2 class="text-2xl font-serif font-bold mb-4 text-primary italic">Configuración de Dictado</h2>
          
          <label class="label">
            <span class="label-text font-bold uppercase text-xs opacity-50">1. Extensión del Dictado</span>
          </label>
          <div class="join w-full">
            <For each={[4, 8, 12, 16]}>{(m) => (
              <button 
                class={`join-item btn flex-1 ${measures() === m ? 'btn-primary' : ''}`}
                onClick={() => setMeasures(m)}
              >
                {m} Compases
              </button>
            )}</For>
          </div>

          <div class="divider">2. Selecciona un ejercicio</div>
          
          <div class="grid grid-cols-1 gap-2">
            <Show when={!exercises.loading} fallback={<span class="loading loading-dots loading-md mx-auto"></span>}>
              <For each={exercises()}>{(ex) => (
                <button 
                  class="btn btn-outline justify-between hover:btn-primary"
                  onClick={() => startGame(ex)}
                >
                  <span>{ex.title}</span>
                  <span class="badge badge-sm">{ex.originalKey} {ex.mode}</span>
                </button>
              )}</For>
            </Show>
          </div>
        </div>
      </div>
    }>
      <MelodicWorkstation 
        exercise={selectedExercise()!} 
        settings={{
          maxRepeats: 4,
          measuresPerBlock: 2,
          targetKey: selectedExercise()!.originalKey,
          transpose: 0
        }}
        onExit={() => setSelectedExercise(null)}
      />
    </Show>
  );
}
import { createSignal, For } from 'solid-js';
import { CHORD_TYPES } from '@bingens/core';
import { InstrumentSelector } from '../../components/music/InstrumentSelector';

export interface ChordDictationSettings {
  types: string[];
  inversions: number[];
  limit: number | 'infinite';
}

interface Props {
  onStart: (settings: ChordDictationSettings) => void;
}

export const ChordDictationConfig = (props: Props) => {
  // Estado local del formulario
  const [types, setTypes] = createSignal<string[]>(["M", "m"]);
  const [inversions, setInversions] = createSignal<number[]>([0]);
  const [limit, setLimit] = createSignal<number | 'infinite'>('infinite');

  const toggleType = (sym: string) => {
    if (types().includes(sym)) {
      if (types().length > 1) setTypes(types().filter(t => t !== sym));
    } else {
      setTypes([...types(), sym]);
    }
  };

  const toggleInv = (inv: number) => {
    if (inversions().includes(inv)) {
      if (inversions().length > 1) setInversions(inversions().filter(i => i !== inv));
    } else {
      setInversions([...inversions(), inv]);
    }
  };

  return (
    <div class="card bg-base-100 shadow-xl max-w-3xl mx-auto border border-base-content/5">
      <div class="card-body">
        <h2 class="card-title font-serif text-2xl justify-center mb-6">Configuración de Práctica</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. TIPOS DE ACORDE */}
          <div>
            <h3 class="font-bold text-sm uppercase opacity-50 mb-3">Tipos de Acorde</h3>
            <div class="grid grid-cols-2 gap-2">
              <For each={CHORD_TYPES}>{(type) => (
                <label class="label cursor-pointer justify-start gap-3 border border-base-content/10 rounded-lg p-2 hover:bg-base-200">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-primary checkbox-sm"
                    checked={types().includes(type.symbol)}
                    onChange={() => toggleType(type.symbol)}
                  />
                  <span class="text-sm font-medium">{type.label}</span>
                </label>
              )}</For>
            </div>
          </div>

          {/* 2. INVERSIONES & CANTIDAD */}
          <div class="space-y-6">
            <div>
              <h3 class="font-bold text-sm uppercase opacity-50 mb-3">Inversiones</h3>
              <div class="flex flex-col gap-2">
                {[0, 1, 2, 3].map((inv) => (
                  <label class="label cursor-pointer justify-start gap-3 border border-base-content/10 rounded-lg p-2 hover:bg-base-200">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-secondary checkbox-sm"
                      checked={inversions().includes(inv)}
                      onChange={() => toggleInv(inv)}
                    />
                    <span class="text-sm">
                      {inv === 0 ? 'Estado Fundamental' : `${inv}ª Inversión`}
                      {inv === 3 && <span class="text-xs opacity-50 ml-2">(Solo 7mas)</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 class="font-bold text-sm uppercase opacity-50 mb-3">Cantidad de Ejercicios</h3>
              <div class="join w-full">
                <button 
                  class={`join-item btn flex-1 ${limit() === 10 ? 'btn-active btn-neutral' : ''}`}
                  onClick={() => setLimit(10)}
                >
                  10
                </button>
                <button 
                  class={`join-item btn flex-1 ${limit() === 20 ? 'btn-active btn-neutral' : ''}`}
                  onClick={() => setLimit(20)}
                >
                  20
                </button>
                <button 
                  class={`join-item btn flex-1 ${limit() === 'infinite' ? 'btn-active btn-neutral' : ''}`}
                  onClick={() => setLimit('infinite')}
                >
                  ∞ Infinito
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="divider">Instrumento</div>
        
        {/* 3. INSTRUMENTO (Usamos el componente que ya creamos) */}
        <InstrumentSelector />

        <div class="card-actions justify-end mt-6">
          <button 
            class="btn btn-primary btn-lg w-full md:w-auto"
            onClick={() => props.onStart({ types: types(), inversions: inversions(), limit: limit() })}
          >
            Comenzar Entrenamiento
          </button>
        </div>
      </div>
    </div>
  );
};
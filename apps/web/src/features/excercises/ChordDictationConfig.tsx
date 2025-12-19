import { createSignal, For } from 'solid-js';
import { CHORD_TYPES } from '@bingens/core';
import { InstrumentSelector } from '../../components/music/InstrumentSelector';
import type { InstrumentName } from '../../lib/audio';

export interface ChordDictationSettings {
  types: string[];
  inversions: number[];
  limit: number | 'infinite';
  instruments: InstrumentName[];
}

interface Props {
  onStart: (settings: ChordDictationSettings) => void;
}

export const ChordDictationConfig = (props: Props) => {
  const [types, setTypes] = createSignal<string[]>(["M", "m"]);
  const [inversions, setInversions] = createSignal<number[]>([0]);
  
  // Por defecto empezamos con 10, como pediste
  const [limit, setLimit] = createSignal<number | 'infinite'>(10);
  
  const [instruments, setInstruments] = createSignal<InstrumentName[]>(['acoustic_grand_piano']);

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

  // Manejador inteligente del input numérico
  const handleCustomLimit = (e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    const num = parseInt(val);
    if (!isNaN(num) && num > 0) {
      setLimit(num);
    } else {
        // Si borra todo, volvemos a infinito o mantenemos el último válido?
        // Mejor no hacer nada o setear 10 por seguridad si sale del foco
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

          {/* 2. OPCIONES LATERALES */}
          <div class="space-y-6">
            
            {/* Inversiones */}
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
                      {inv === 0 ? 'Fundamental' : `${inv}ª Inversión`}
                      {inv === 3 && <span class="text-xs opacity-50 ml-2">(Solo 7mas)</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* CANTIDAD (Modificado) */}
            <div>
              <h3 class="font-bold text-sm uppercase opacity-50 mb-3">Cantidad de Ejercicios</h3>
              <div class="flex items-center gap-4">
                {/* Opción Infinito */}
                <button 
                  class={`btn flex-1 gap-2 ${limit() === 'infinite' ? 'btn-primary' : 'btn-outline border-base-content/20'}`}
                  onClick={() => setLimit('infinite')}
                >
                  <span class="text-xl">∞</span> Infinito
                </button>

                <div class="divider divider-horizontal mx-0 text-xs opacity-50">O</div>

                {/* Opción Numérica */}
                <div class="flex-1">
                    <label class="input-group w-full">
                        <input 
                            type="number" 
                            min="1" 
                            max="100"
                            placeholder="10"
                            value={limit() === 'infinite' ? '' : limit()}
                            onInput={handleCustomLimit}
                            // Al hacer foco, si estaba en infinito, ponemos 10
                            onFocus={() => limit() === 'infinite' && setLimit(10)}
                            class={`input input-bordered w-full text-center ${limit() !== 'infinite' ? 'input-primary font-bold' : ''}`}
                        />
                        <span class="bg-base-200 text-xs font-bold px-3 flex items-center">RETOS</span>
                    </label>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="divider">Timbre e Instrumentos</div>
        
        <InstrumentSelector 
          selected={instruments()} 
          onChange={setInstruments} 
        />

        <div class="card-actions justify-end mt-6">
          <button 
            class="btn btn-primary btn-lg w-full md:w-auto shadow-lg"
            onClick={() => props.onStart({ 
              types: types(), 
              inversions: inversions(), 
              limit: limit(),
              instruments: instruments() 
            })}
          >
            Comenzar Entrenamiento
          </button>
        </div>
      </div>
    </div>
  );
};
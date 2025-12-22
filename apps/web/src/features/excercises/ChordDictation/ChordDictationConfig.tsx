import { createSignal, For, onMount, Show } from 'solid-js';
import { CHORD_TYPES } from '@bingens/core';
import { InstrumentSelector } from '../../../components/music/InstrumentSelector';
import { type InstrumentName, audioEngine } from '../../../lib/audio';
import { useChordI18n } from './i18n';
import { Music, Layers, Hash, Settings2 } from 'lucide-solid';

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
  const [t] = useChordI18n();
  const [types, setTypes] = createSignal<string[]>(["M", "m"]);
  const [inversions, setInversions] = createSignal<number[]>([0]);
  const [limit, setLimit] = createSignal<number | 'infinite'>(10);
  const [instruments, setInstruments] = createSignal<InstrumentName[]>(['acoustic_grand_piano']);

  onMount(() => {
    audioEngine.setInstrument('acoustic_grand_piano');
  });

  // Modificado para permitir deseleccionar todo (el botón validará después)
  const toggleType = (sym: string) => {
    if (types().includes(sym)) {
      setTypes(types().filter(t => t !== sym));
    } else {
      setTypes([...types(), sym]);
    }
  };

  const toggleInv = (inv: number) => {
    if (inversions().includes(inv)) {
      setInversions(inversions().filter(i => i !== inv));
    } else {
      setInversions([...inversions(), inv]);
    }
  };

  // Lógica de validación para el botón
  const isFormValid = () => types().length > 1 && inversions().length > 0;

  const invKeys = ["fundamental", "first", "second", "third"];

  return (
    <div class="w-full max-w-2xl mx-auto space-y-4 pb-10">
      
      <div class="text-center py-4">
        <h2 class="text-3xl font-serif font-bold text-primary">
          {t('config.title') as string}
        </h2>
      </div>

      <div class="space-y-3">
        
        {/* SECCIÓN 1: TIPOS DE ACORDE */}
        <details class="collapse collapse-arrow bg-base-100 border border-base-content/10 shadow-sm" open>
          <summary class="collapse-title text-sm font-bold uppercase tracking-widest flex items-center gap-3">
            <Music size={18} class="text-primary" />
            {t('config.chordTypes') as string}
            <Show when={types().length < 2}>
               <span class="badge badge-error badge-xs animate-pulse">!</span>
            </Show>
          </summary>
          <div class="collapse-content">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <For each={CHORD_TYPES}>{(type) => (
                <label class="label cursor-pointer justify-start gap-4 p-3 rounded-xl border border-base-content/5 hover:bg-base-200 transition-colors">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-primary"
                    checked={types().includes(type.symbol)}
                    onChange={() => toggleType(type.symbol)}
                  />
                  <span class="font-medium text-base">
                    {t(`chords.${type.symbol}` as any) as string}
                  </span>
                </label>
              )}</For>
            </div>
          </div>
        </details>

        {/* SECCIÓN 2: INVERSIONES */}
        <details class="collapse collapse-arrow bg-base-100 border border-base-content/10 shadow-sm">
          <summary class="collapse-title text-sm font-bold uppercase tracking-widest flex items-center gap-3">
            <Layers size={18} class="text-secondary" />
            {t('config.inversions') as string}
            <Show when={inversions().length === 0}>
               <span class="badge badge-error badge-xs animate-pulse">!</span>
            </Show>
          </summary>
          <div class="collapse-content">
            <div class="flex flex-col gap-2 pt-2">
              <For each={[0, 1, 2, 3]}>{(inv) => (
                <label class="label cursor-pointer justify-start gap-4 p-3 rounded-xl border border-base-content/5 hover:bg-base-200 transition-colors">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-secondary"
                    checked={inversions().includes(inv)}
                    onChange={() => toggleInv(inv)}
                  />
                  <div class="flex flex-col">
                    <span class="font-medium">
                      {t(`config.inversions_labels.${invKeys[inv]}` as any) as string}
                    </span>
                    {inv === 3 && (
                      <span class="text-[10px] opacity-50">
                        {t('config.inversions_labels.onlySevenths') as string}
                      </span>
                    )}
                  </div>
                </label>
              )}</For>
            </div>
          </div>
        </details>

        {/* SECCIÓN 3: CANTIDAD */}
        <details class="collapse collapse-arrow bg-base-100 border border-base-content/10 shadow-sm">
          <summary class="collapse-title text-sm font-bold uppercase tracking-widest flex items-center gap-3">
            <Hash size={18} class="text-accent" />
            {t('config.quantity') as string}
          </summary>
          <div class="collapse-content pt-4">
            <div class="flex flex-col sm:flex-row items-center gap-4">
              <button 
                class={`btn flex-1 gap-2 btn-lg w-full ${limit() === 'infinite' ? 'btn-primary' : 'btn-outline border-base-content/10'}`}
                onClick={() => setLimit('infinite')}
              >
                <span class="text-2xl">∞</span> {t('config.limit.infinite') as string}
              </button>

              <div class="divider sm:divider-horizontal opacity-30 text-xs">OR</div>

              <div class="form-control flex-1 w-full">
                <div class="join w-full">
                  <input 
                    type="number" 
                    placeholder={t('config.limit.placeholder') as string}
                    value={limit() === 'infinite' ? '' : limit()}
                    onInput={(e) => setLimit(parseInt(e.currentTarget.value) || 10)}
                    onFocus={() => limit() === 'infinite' && setLimit(10)}
                    class={`input input-bordered input-lg join-item w-full text-center font-bold ${limit() !== 'infinite' ? 'border-primary text-primary' : ''}`}
                  />
                  <span class="btn btn-lg join-item bg-base-200 pointer-events-none text-[10px] px-2 opacity-60">
                    {t('config.limit.suffix') as string}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </details>

        {/* SECCIÓN 4: INSTRUMENTOS */}
        <details class="collapse collapse-arrow bg-base-100 border border-base-content/10 shadow-sm">
          <summary class="collapse-title text-sm font-bold uppercase tracking-widest flex items-center gap-3">
            <Settings2 size={18} class="text-neutral" />
            {t('config.instruments') as string}
          </summary>
          <div class="collapse-content pt-4 overflow-x-hidden">
            <InstrumentSelector 
              selected={instruments()} 
              onChange={setInstruments} 
            />
          </div>
        </details>
      </div>

      {/* BOTÓN DE ACCIÓN FINAL CON VALIDACIÓN */}
      <div class="pt-6">
        <button 
          class="btn btn-primary btn-lg w-full shadow-2xl font-black uppercase tracking-widest"
          disabled={!isFormValid()} // <--- VALIDACIÓN ACTIVA
          onClick={() => props.onStart({ 
            types: types(), 
            inversions: inversions(), 
            limit: limit(),
            instruments: instruments() 
          })}
        >
          {t('config.cta') as string}
        </button>
        
        {/* Mensaje de ayuda si el formulario no es válido */}
        <Show when={!isFormValid()}>
          <p class="text-center text-error text-[10px] sm:text-xs font-bold mt-3 animate-pulse uppercase tracking-wider">
             {t('config.validationError') as string}
          </p>
        </Show>
      </div>
    </div>
  );
};
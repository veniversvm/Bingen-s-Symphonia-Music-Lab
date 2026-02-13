import { createSignal, For, Show } from "solid-js";
import { useIntervalI18n } from "./i18n";
import { InstrumentSelector } from "../../../components/music/InstrumentSelector";
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Trophy, 
  Settings2, 
  ChevronRight
} from "lucide-solid";
import type { InstrumentName } from "../../../lib/audio";

export interface IntervalSettings {
  mode: 'mastery' | 'custom';
  selectedIntervals: string[];
  instruments: InstrumentName[];
  playbackModes: string[];
}

export const IntervalDictationConfig = (props: { onStart: (s: IntervalSettings) => void }) => {
  const [t] = useIntervalI18n();
  
  // CORRECCIÓN 1: Añadido setMode para poder cambiar el estado
  const [mode, setMode] = createSignal<'mastery' | 'custom'>('mastery');
  
  const [selectedInsts, setSelectedInsts] = createSignal<InstrumentName[]>(["acoustic_grand_piano"]);
  
  const allIntervals = ["2m", "2M", "3m", "3M", "4P", "4A", "5P", "6m", "6M", "7m", "7M", "8P"];
  const [customIntervals, setCustomIntervals] = createSignal<string[]>(["2M", "3M", "5P"]);
  const [playbackModes, setPlaybackModes] = createSignal<string[]>(['asc', 'desc', 'harmonic']);

  const toggleMode = (m: string) => {
    if (playbackModes().includes(m)) {
      if (playbackModes().length > 1) setPlaybackModes(playbackModes().filter(x => x !== m));
    } else {
      setPlaybackModes([...playbackModes(), m]);
    }
  };

  const isValid = () => {
    if (mode() === 'mastery') return true;
    return customIntervals().length > 0 && playbackModes().length > 0;
  };

  return (
    <div class="card bg-base-100 shadow-xl border border-base-content/5 max-w-2xl mx-auto animate-fade-in">
      <div class="card-body p-6 space-y-6">
        <h2 class="text-2xl font-serif font-black text-center text-primary italic">
          {t('title') as string}
        </h2>

        {/* CORRECCIÓN 2: Pestañas de selección de modo restauradas */}
        <div class="tabs tabs-boxed bg-base-200 p-1">
          <button 
            class={`tab flex-1 gap-2 font-bold transition-all ${mode() === 'mastery' ? 'tab-active !bg-primary !text-white' : ''}`}
            onClick={() => setMode('mastery')}
          >
            <Trophy size={14} />
            <span class="text-xs uppercase tracking-widest">{t('modes.principal' as any) || "Mastery"}</span>
          </button>
          <button 
            class={`tab flex-1 gap-2 font-bold transition-all ${mode() === 'custom' ? 'tab-active !bg-secondary !text-white' : ''}`}
            onClick={() => setMode('custom')}
          >
            <Settings2 size={14} />
            <span class="text-xs uppercase tracking-widest">{t('modes.custom' as any) || "Custom"}</span>
          </button>
        </div>

        {/* CONTENIDO MODO MASTERY */}
        <Show when={mode() === 'mastery'}>
          <div class="bg-primary/5 p-6 rounded-2xl border border-primary/10 space-y-3 animate-in fade-in slide-in-from-top-2">
             <p class="text-sm font-serif italic opacity-80 leading-relaxed text-center">
               {t('sublevels.full' as any) || "El camino del maestro: Supera cada intervalo en 5 etapas con racha de 3 aciertos para avanzar."}
             </p>
             <div class="flex justify-center">
                <div class="badge badge-primary font-black uppercase text-[10px]">Recomendado</div>
             </div>
          </div>
        </Show>

        {/* CONTENIDO MODO CUSTOM */}
        <Show when={mode() === 'custom'}>
          <div class="space-y-6 animate-in fade-in slide-in-from-top-2">
            
            {/* 1. Selector de Intervalos */}
            <section>
              <label class="label text-[10px] uppercase font-black opacity-40 tracking-widest px-2">
                Seleccionar Intervalos
              </label>
              <div class="grid grid-cols-4 gap-2 bg-base-200/50 p-3 rounded-xl border border-base-content/5">
                <For each={allIntervals}>{(interval) => (
                  <button 
                    class={`btn btn-sm ${customIntervals().includes(interval) ? 'btn-secondary text-white shadow-md' : 'btn-ghost opacity-40'}`}
                    onClick={() => {
                      if (customIntervals().includes(interval)) setCustomIntervals(customIntervals().filter(i => i !== interval));
                      else setCustomIntervals([...customIntervals(), interval]);
                    }}
                  >
                    {interval}
                  </button>
                )}</For>
              </div>
            </section>

            {/* 2. Selector de Modos de Reproducción */}
            <section>
              <label class="label text-[10px] uppercase font-black opacity-40 tracking-widest px-2">
                {t('config.playbackModes' as any) || "Dirección"}
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button 
                  class={`btn h-16 flex flex-col gap-1 transition-all ${playbackModes().includes('asc') ? 'btn-primary shadow-lg' : 'btn-outline border-base-content/10 opacity-40'}`}
                  onClick={() => toggleMode('asc')}
                >
                  <TrendingUp size={18} /> 
                  <span class="text-[9px] font-black uppercase tracking-tighter">{t('sublevels.asc' as any)}</span>
                </button>

                <button 
                  class={`btn h-16 flex flex-col gap-1 transition-all ${playbackModes().includes('desc') ? 'btn-primary shadow-lg' : 'btn-outline border-base-content/10 opacity-40'}`}
                  onClick={() => toggleMode('desc')}
                >
                  <TrendingDown size={18} />
                  <span class="text-[9px] font-black uppercase tracking-tighter">{t('sublevels.desc' as any)}</span>
                </button>

                <button 
                  class={`btn h-16 flex flex-col gap-1 transition-all ${playbackModes().includes('harmonic') ? 'btn-primary shadow-lg' : 'btn-outline border-base-content/10 opacity-40'}`}
                  onClick={() => toggleMode('harmonic')}
                >
                  <Layers size={18} />
                  <span class="text-[9px] font-black uppercase tracking-tighter">{t('sublevels.harmonic' as any)}</span>
                </button>
              </div>
            </section>
          </div>
        </Show>

        {/* Timbres (Común a ambos modos) */}
        <section class="space-y-2">
          <label class="label text-[10px] uppercase font-black opacity-40 tracking-widest px-2">Timbres Disponibles</label>
          <InstrumentSelector selected={selectedInsts()} onChange={setSelectedInsts} />
        </section>

        {/* BOTÓN START */}
        <div class="pt-4">
          <button 
            class="btn btn-primary btn-lg w-full shadow-2xl font-black uppercase tracking-widest gap-2"
            disabled={!isValid()}
            onClick={() => props.onStart({
              mode: mode(),
              selectedIntervals: mode() === 'mastery' ? [] : customIntervals(),
              instruments: selectedInsts(),
              playbackModes: playbackModes()
            })}
          >
            {t('config.cta' as any) || "Comenzar"}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
import { createSignal, For, Show } from "solid-js";
import { useNoteI18n } from "./i18n";

import { Music, Scissors } from "lucide-solid";
import type { InstrumentName } from "../../../lib/audio";

export interface NoteConfigSettings {
  mode: 'default' | 'custom';
  instruments: InstrumentName[];
  customNotes: string[]; // Ej: ["C4", "D4", "E4"]
  clefs: ('treble' | 'bass')[];
}

interface Props {
  onStart: (settings: NoteConfigSettings) => void;
}

export const NoteRecognitionConfig = (props: Props) => {
  const [t] = useNoteI18n();
  const [mode, setMode] = createSignal<'default' | 'custom'>('default');
  const [selectedInsts, setSelectedInsts] = createSignal<InstrumentName[]>(["acoustic_grand_piano"]);
  
  // Notas para el pool personalizado (Octava 4 para simplificar selección)
  const availableNotes = ["C4", "C#4", "Db4", "D4", "D#4", "Eb4", "E4", "F4", "F#4", "Gb4", "G4", "G#4", "Ab4", "A4", "A#4", "Bb4", "B4"];
  const [customNotes, setCustomNotes] = createSignal<string[]>(["C4", "D4"]);

  const toggleNote = (n: string) => {
    if (customNotes().includes(n)) {
      if (customNotes().length > 2) setCustomNotes(customNotes().filter(note => note !== n));
    } else {
      setCustomNotes([...customNotes(), n]);
    }
  };

  const instruments: {name: InstrumentName, label: string}[] = [
    { name: "acoustic_grand_piano", label: "🎹" },
    { name: "acoustic_guitar_nylon", label: "🎸" },
    { name: "violin", label: "🎻" },
    { name: "flute", label: "🎼" },
    { name: "choir_aahs", label: "🗣️" },
    { name: 'trumpet', label: '🎺' },
    { name: 'lead_1_square', label: '👾' },
  ];

  const toggleInst = (name: InstrumentName) => {
    if (selectedInsts().includes(name)) {
      if (selectedInsts().length > 1) setSelectedInsts(selectedInsts().filter(i => i !== name));
    } else {
      setSelectedInsts([...selectedInsts(), name]);
    }
  };

  return (
    <div class="card bg-base-100 shadow-2xl border border-base-content/5 max-w-2xl mx-auto">
      <div class="card-body p-6 space-y-6">
        <h2 class="text-2xl font-serif font-black text-center text-primary italic">
          {t('config.title' as any) || "Configuración de Lectura"}
        </h2>

        {/* MODO SELECTOR */}
        <div class="tabs tabs-boxed bg-base-200 p-1">
          <button 
            class={`tab flex-1 font-bold ${mode() === 'default' ? 'tab-active !bg-primary !text-white' : ''}`}
            onClick={() => setMode('default')}
          >
            {t('modes.principal')}
          </button>
          <button 
            class={`tab flex-1 font-bold ${mode() === 'custom' ? 'tab-active !bg-secondary !text-white' : ''}`}
            onClick={() => setMode('custom')}
          >
            {t('modes.custom')}
          </button>
        </div>

        <Show when={mode() === 'custom'}>
          <div class="space-y-6 animate-in fade-in slide-in-from-top-2">
            {/* INSTRUMENTOS */}
            <section>
              <label class="label text-[10px] uppercase font-black opacity-40 tracking-widest">
                <Music size={12} class="mr-2"/> Instrumentos
              </label>
              <div class="flex flex-wrap gap-2 justify-center bg-base-200 p-3 rounded-xl">
                <For each={instruments}>{(inst) => (
                  <button 
                    class={`btn btn-circle ${selectedInsts().includes(inst.name) ? 'btn-primary' : 'btn-ghost opacity-40'}`}
                    onClick={() => toggleInst(inst.name)}
                  >
                    <span class="text-xl">{inst.label}</span>
                  </button>
                )}</For>
              </div>
            </section>

            {/* NOTAS PERSONALIZADAS */}
            <section>
              <label class="label text-[10px] uppercase font-black opacity-40 tracking-widest">
                <Scissors size={12} class="mr-2"/> Pool de Notas (Pitch Class)
              </label>
              <div class="grid grid-cols-4 sm:grid-cols-6 gap-1.5 bg-base-200 p-3 rounded-xl">
                <For each={availableNotes}>{(n) => (
                  <button 
                    class={`btn btn-sm text-[10px] ${customNotes().includes(n) ? 'btn-secondary text-white' : 'btn-ghost opacity-30'}`}
                    onClick={() => toggleNote(n)}
                  >
                    {n.replace('4', '').replace('#', '♯').replace('b', '♭')}
                  </button>
                )}</For>
              </div>
            </section>
          </div>
        </Show>

        <Show when={mode() === 'default'}>
          <div class="bg-primary/5 p-4 rounded-xl border border-primary/10 italic text-sm opacity-70">
            <p>El modo principal utiliza la progresión de Hildegarda: desbloqueas notas una a una logrando rachas de aciertos.</p>
          </div>
        </Show>

        <button 
          class="btn btn-primary btn-lg w-full shadow-xl font-black uppercase tracking-widest mt-4"
          onClick={() => props.onStart({
            mode: mode(),
            instruments: selectedInsts(),
            customNotes: customNotes(),
            clefs: ['treble', 'bass']
          })}
        >
          {t('config.generate' as any) || "Comenzar"}
        </button>
      </div>
    </div>
  );
};
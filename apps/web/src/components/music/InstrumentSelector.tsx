import type { InstrumentName } from "../../lib/audio";

interface Props {
  selected: InstrumentName[];
  onChange: (instruments: InstrumentName[]) => void;
}

export const InstrumentSelector = (props: Props) => {
  
  const toggleInstrument = (name: InstrumentName) => {
    const current = props.selected;
    
    if (current.includes(name)) {
      // Evitar dejar la lista vacía (mínimo 1 instrumento)
      if (current.length > 1) {
        props.onChange(current.filter(i => i !== name));
      }
    } else {
      props.onChange([...current, name]);
    }
  };

  const isSelected = (name: InstrumentName) => props.selected.includes(name);

  // Helper para clases CSS
  const btnClass = (name: InstrumentName) => 
    `btn btn-sm transition-all border-base-content/10 ${
      isSelected(name) 
        ? 'btn-primary shadow-md transform scale-105' 
        : 'btn-ghost opacity-60 hover:opacity-100'
    } gap-2`;

  return (
    <div class="flex flex-col items-center gap-2 mb-4">
      <p class="text-xs uppercase font-bold opacity-40 tracking-widest">
        Instrumentos Activos ({props.selected.length})
      </p>
      
      <div class="flex flex-wrap justify-center gap-2 p-3 bg-base-200/50 rounded-xl border border-base-content/5">
        <button class={btnClass('acoustic_grand_piano')} onClick={() => toggleInstrument('acoustic_grand_piano')}>
          🎹 Piano
        </button>
        <button class={btnClass('acoustic_guitar_nylon')} onClick={() => toggleInstrument('acoustic_guitar_nylon')}>
          🎸 Guitarra
        </button>
        <button class={btnClass('violin')} onClick={() => toggleInstrument('violin')}>
          🎻 Violín
        </button>
        <button class={btnClass('flute')} onClick={() => toggleInstrument('flute')}>
          🎼 Flauta
        </button>
        <button class={btnClass('choir_aahs')} onClick={() => toggleInstrument('choir_aahs')}>
          🗣️ Voz
        </button>
      </div>
      
      <p class="text-[10px] opacity-40">
        *El sistema alternará aleatoriamente entre los seleccionados.
      </p>
    </div>
  );
};
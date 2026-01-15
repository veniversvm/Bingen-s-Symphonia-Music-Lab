import { For } from "solid-js";
import type { InstrumentName } from "../../lib/audio";
import { useInstrumentI18n } from "./i18n";

interface Props {
  selected: InstrumentName[];
  onChange: (instruments: InstrumentName[]) => void;
}

export const InstrumentSelector = (props: Props) => {
  const t = useInstrumentI18n(); // Acceso a las traducciones locales

  const toggleInstrument = (name: InstrumentName) => {
    const current = props.selected;
    if (current.includes(name)) {
      if (current.length > 1) props.onChange(current.filter(i => i !== name));
    } else {
      props.onChange([...current, name]);
    }
  };

  const isSelected = (name: InstrumentName) => props.selected.includes(name);

  const btnClass = (name: InstrumentName) => 
    `btn btn-sm transition-all border-base-content/10 ${
      isSelected(name) 
        ? 'btn-primary shadow-md transform scale-105' 
        : 'btn-ghost opacity-60 hover:opacity-100'
    } gap-2`;

  // Mapeo interno para los botones
  const instrumentItems: { id: InstrumentName; emoji: string; labelKey: keyof ReturnType<typeof t> }[] = [
    { id: 'acoustic_grand_piano', emoji: '🎹', labelKey: 'piano' },
    { id: 'acoustic_guitar_nylon', emoji: '🎸', labelKey: 'guitar' },
    { id: 'violin', emoji: '🎻', labelKey: 'violin' },
    { id: 'flute', emoji: '🎼', labelKey: 'flute' },
    { id: 'trumpet', emoji: '🎺', labelKey: 'trumpet' },
    { id: 'lead_1_square', emoji: '👾', labelKey: 'synth' },
    { id: 'choir_aahs', emoji: '🗣️', labelKey: 'voice' },
  ];

  return (
    <div class="flex flex-col items-center gap-2 mb-4">
      <p class="text-xs uppercase font-black opacity-40 tracking-widest">
        {t().active} ({props.selected.length})
      </p>
      
      <div class="flex flex-wrap justify-center gap-2 p-3 bg-base-200/50 rounded-xl border border-base-content/5">
        <For each={instrumentItems}>{(inst) => (
          <button class={btnClass(inst.id)} onClick={() => toggleInstrument(inst.id)}>
            {inst.emoji} {t()[inst.labelKey]}
          </button>
        )}</For>
      </div>
      
      <p class="text-[10px] opacity-40 italic text-center">
        {t().random}
      </p>
    </div>
  );
};
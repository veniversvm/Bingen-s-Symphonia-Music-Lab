import { For, Show } from 'solid-js';
import { NoteUtils } from '@bingens/core';

interface Props {
  onNoteClick: (note: string) => void;
  selectedNotes: string[];
  preferredAccidental: 'sharp' | 'flat';
}

export const PianoInput = (props: Props) => {
  // Rango A3 a A5
  const keys = Array.from({ length: 81 - 57 + 1 }, (_, i) => {
    const midi = i + 57;
    const standardName = NoteUtils.fromMidi(midi);
    
    // Si el ejercicio prefiere bemoles (ej. Db Major), mostramos bemoles en las teclas
    let displayName = standardName;
    if (props.preferredAccidental === 'flat') {
      const flatName = NoteUtils.enharmonic(standardName);
      if (flatName.includes('b')) displayName = flatName;
    }

    return { name: displayName, isBlack: displayName.includes('#') || displayName.includes('b') };
  });

  return (
    <div class="flex w-full touch-none select-none h-32 bg-base-300 p-1 rounded-xl shadow-inner">
      <For each={keys}>{(k) => (
        <div 
          onPointerDown={(e) => { e.preventDefault(); props.onNoteClick(k.name); }}
          class={`relative flex-1 cursor-pointer transition-all border-x border-black/5
            ${k.isBlack ? 'bg-neutral h-[60%] -mx-[2.2%] z-10 rounded-b-md shadow-md' : 'bg-white h-full rounded-b-lg'}
            ${props.selectedNotes.includes(k.name) ? '!bg-primary' : ''}
          `}
        >
          {/* Label de la nota solo en teclas blancas para no saturar */}
          <Show when={!k.isBlack}>
            <span class="absolute bottom-1 w-full text-center text-[8px] font-black opacity-20 uppercase">
              {k.name.replace(/\d/, '')}
            </span>
          </Show>
        </div>
      )}</For>
    </div>
  );
};
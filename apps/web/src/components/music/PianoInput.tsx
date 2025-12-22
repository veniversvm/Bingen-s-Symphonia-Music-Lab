import { For, Show } from 'solid-js';
import { NoteUtils } from '@bingens/core';

interface Props {
  onNoteClick: (note: string) => void;
  selectedNotes: string[];
  preferredAccidental: 'sharp' | 'flat';
}

export const PianoInput = (props: Props) => {
  const keys = Array.from({ length: 80 - 60 + 1 }, (_, i) => {
    const midi = i + 60;
    const standardName = NoteUtils.fromMidi(midi);
    
    // Determinamos si es negra por su nombre estándar
    const isBlack = standardName.includes('#') || standardName.includes('b');
    
    return { name: standardName, midi, isBlack };
  });

  return (
    <div class="flex w-full h-32 bg-base-300 p-1 rounded-xl shadow-inner border border-base-content/10">
      <For each={keys}>{(k) => {
        // ¿Esta nota está seleccionada (independientemente del nombre enarmónico)?
        const isSelected = () => props.selectedNotes.some(n => NoteUtils.midi(n) === k.midi);

        return (
          <div 
            onPointerDown={(e) => { e.preventDefault(); props.onNoteClick(k.name); }}
            classList={{
              'relative flex-1 cursor-pointer transition-all border-x border-black/5': true,
              'bg-neutral h-[60%] -mx-[2.3%] z-10 rounded-b-md shadow-md': k.isBlack,
              'bg-white h-full rounded-b-lg': !k.isBlack,
              '!bg-primary !border-primary': isSelected() // Resaltar si el MIDI coincide
            }}
          >
            <Show when={!k.isBlack}>
              <span class="absolute bottom-1 w-full text-center text-[7px] font-black opacity-20 uppercase">
                {k.name.replace(/\d/, '')}
              </span>
            </Show>
          </div>
        );
      }}</For>
    </div>
  );
};
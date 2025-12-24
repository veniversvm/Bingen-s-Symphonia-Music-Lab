import { For, onMount, createSignal } from 'solid-js';

export type SpellingMode = 'mixed' | 'sharp' | 'flat';

interface Props {
  onNoteClick: (note: string) => void;
  selectedNotes: string[];
  mode: SpellingMode;
}

export const PianoInput = (props: Props) => {
  const range = Array.from({ length: 96 - 48 + 1 }, (_, i) => i + 48); // Do 3 a Do 7
  let scrollContainer: HTMLDivElement | undefined;
  const [scrollPos, setScrollPos] = createSignal(0);

  // Helper visual para mostrar glifos reales ♯ y ♭
  const beautify = (pc: string) => {
    return pc.replace('#', '♯').replace('b', '♭');
  };

  const handleScroll = () => {
    if (!scrollContainer) return;
    const max = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    if (max > 0) setScrollPos((scrollContainer.scrollLeft / max) * 100);
  };

  const onSliderInput = (e: any) => {
    if (!scrollContainer) return;
    const val = parseFloat(e.target.value);
    const max = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    scrollContainer.scrollLeft = (val / 100) * max;
  };

  onMount(() => {
    if (scrollContainer) {
      scrollContainer.scrollLeft = scrollContainer.scrollWidth * 0.3;
    }
  });

  const getNoteName = (midi: number, mode: SpellingMode) => {
    const pc = midi % 12;
    const oct = Math.floor(midi / 12) - 1;
    const map: any = {
      0: {mixed:"C", sharp:"C", flat:"C"}, 1: {mixed:"C#", sharp:"C#", flat:"Db"},
      2: {mixed:"D", sharp:"D", flat:"D"}, 3: {mixed:"Eb", sharp:"D#", flat:"Eb"},
      4: {mixed:"E", sharp:"E", flat:"E"}, 5: {mixed:"F", sharp:"F", flat:"F"},
      6: {mixed:"F#", sharp:"F#", flat:"Gb"}, 7: {mixed:"G", sharp:"G", flat:"G"},
      8: {mixed:"Ab", sharp:"G#", flat:"Ab"}, 9: {mixed:"A", sharp:"A", flat:"A"},
      10: {mixed:"Bb", sharp:"A#", flat:"Bb"}, 11: {mixed:"B", sharp:"B", flat:"B"}
    };
    let name = map[pc][mode];
    if (mode === 'sharp') {
      if (pc === 5) name = "E#"; if (pc === 0) name = "B#";
    } else if (mode === 'flat') {
      if (pc === 4) name = "Fb"; if (pc === 11) name = "Cb";
    }
    const finalOct = (mode === 'sharp' && pc === 0) ? oct - 1 : (mode === 'flat' && pc === 11) ? oct + 1 : oct;
    return `${name}${finalOct}`;
  };

  return (
    <div class="w-full bg-base-300 p-2 rounded-2xl shadow-inner border border-base-content/10 flex flex-col gap-2">
      <div 
        ref={scrollContainer}
        onScroll={handleScroll}
        class="w-full overflow-x-auto no-scrollbar rounded-xl bg-black/20"
      >
        <div class="flex min-w-max h-48 md:h-64 relative pb-4 px-10">
          <For each={range}>{(midi) => {
            const name = () => getNoteName(midi, props.mode);
            const isBlack = [1, 3, 6, 8, 10].includes(midi % 12);
            const isSelected = () => props.selectedNotes.includes(name());
            
            // Aplicamos beautify aquí para los glifos ♯ y ♭
            const pcDisplay = () => beautify(name().replace(/\d/g, ''));

            return (
              <div 
                onPointerDown={(e) => { 
                  e.preventDefault(); 
                  props.onNoteClick(name()); 
                }}
                class={`relative flex-1 cursor-pointer transition-all border-x border-black/5 flex flex-col items-center
                  ${isBlack 
                    ? 'bg-neutral h-[62%] w-10 md:w-12 -mx-5 md:-mx-6 z-10 rounded-b-md shadow-lg justify-start pt-4' 
                    : 'bg-white h-full w-14 md:w-18 rounded-b-xl shadow-md justify-end pb-8'
                  }
                  ${isSelected() ? '!bg-primary ring-2 ring-primary/40' : ''}
                `}
              >
                {/* Quitamos 'uppercase' para permitir que el glifo o la 'b' se vean bien */}
                <span class={`font-black pointer-events-none transition-all
                  ${isBlack 
                    ? 'text-[10px] md:text-xs ' + (isSelected() ? 'text-white' : 'text-white/40')
                    : 'text-sm md:text-lg ' + (isSelected() ? 'text-white scale-125' : 'text-black/40')
                  }
                `}>
                  {pcDisplay()}
                </span>
              </div>
            );
          }}</For>
        </div>
      </div>

      <div class="px-4 pb-2 flex items-center gap-3">
        <span class="text-[9px] font-black opacity-30 uppercase text-base-content">Grave</span>
        <input type="range" min="0" max="100" step="0.1" value={scrollPos()} onInput={onSliderInput} class="range range-xs range-primary opacity-50 hover:opacity-100" />
        <span class="text-[9px] font-black opacity-30 uppercase text-base-content">Agudo</span>
      </div>
    </div>
  );
};
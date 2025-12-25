// apps/web/src/components/music/PianoInput.tsx
import { For } from "solid-js";
import { NoteUtils } from "@bingens/core";

export type SpellingMode = "mixed" | "sharp" | "flat";

interface Props {
  onNoteClick: (note: string) => void;
  selectedNotes: string[];
  mode: SpellingMode;
}

export const PianoInput = (props: Props) => {
  // --- NUEVO RANGO: A3 (57) a A5 (81) ---
  const START_MIDI = 57; 
  const END_MIDI = 81;
  const range = Array.from(
    { length: END_MIDI - START_MIDI + 1 }, 
    (_, i) => i + START_MIDI
  );

  let scrollContainer: HTMLDivElement | undefined;

  const beautify = (name: string) => {
    return name
      .replace("##", "𝄪")
      .replace("#", "♯")
      .replace("bb", "𝄫")
      .replace("b", "♭");
  };

  const getNoteName = (midi: number, mode: SpellingMode) => {
    const pc = midi % 12;
    const oct = Math.floor(midi / 12) - 1;

    const map: any = {
      0: { mixed: "C", sharp: "B#", flat: "Dbb" },
      1: { mixed: "C#", sharp: "C#", flat: "Db" },
      2: { mixed: "D", sharp: "Cx", flat: "Ebb" },
      3: { mixed: "Eb", sharp: "D#", flat: "Eb" },
      4: { mixed: "E", sharp: "Dx", flat: "Fb" },
      5: { mixed: "F", sharp: "E#", flat: "Gbb" },
      6: { mixed: "F#", sharp: "F#", flat: "Gb" },
      7: { mixed: "G", sharp: "Fx", flat: "Abb" },
      8: { mixed: "Ab", sharp: "G#", flat: "Ab" },
      9: { mixed: "A", sharp: "Gx", flat: "Bbb" },
      10: { mixed: "Bb", sharp: "A#", flat: "Bb" },
      11: { mixed: "B", sharp: "Ax", flat: "Cb" },
    };

    let name = map[pc][mode];
    name = name.replace("x", "##");

    let finalOct = oct;
    if (mode === "sharp" && pc === 0) finalOct = oct - 1;
    if (mode === "flat" && pc === 11) finalOct = oct + 1;

    return `${name}${finalOct}`;
  };

  return (
    <div class="w-full bg-base-300 p-2 sm:p-3 rounded-2xl shadow-inner border border-base-content/10 flex flex-col gap-1">
      <div class="flex justify-between px-2 text-base-content/60 text-[9px] font-black uppercase tracking-widest">
        <span>A3 (Grave)</span>
        <span class="animate-pulse hidden sm:inline">Piano Interactivo</span>
        <span>A5 (Agudo)</span>
      </div>

      <div
        ref={scrollContainer}
        class="w-full overflow-x-auto overscroll-x-contain no-scrollbar rounded-xl bg-black/20 shadow-inner"
      >
        <div class="flex min-w-max relative px-4 sm:px-6 pb-2 h-[clamp(8rem,20vh,12rem)]">
          <For each={range}>
            {(midi) => {
              const name = () => getNoteName(midi, props.mode);
              const isBlack = [1, 3, 6, 8, 10].includes(midi % 12);
              const isSelected = () =>
                props.selectedNotes.some((n) => NoteUtils.midi(n) === midi);
              const pcOnly = () => name().replace(/\d/g, "");

              return (
                <div
                  onPointerDown={(e) => {
                    e.preventDefault();
                    props.onNoteClick(name());
                  }}
                  class={`
                  relative cursor-pointer transition-all border-x border-black/5 flex flex-col items-center select-none
                  ${isBlack
                      ? `bg-neutral h-[60%] w-[clamp(1.2rem,2vw,2.2rem)] -mx-[clamp(0.6rem,1vw,1.1rem)] z-10 rounded-b-sm shadow-2xl justify-start pt-2 sm:pt-4`
                      : `bg-white h-full w-[clamp(2.2rem,4vw,3.5rem)] rounded-b-lg shadow-md justify-end pb-4 sm:pb-6`
                  }
                  ${isSelected() ? "!bg-primary ring-2 ring-primary/30" : ""}
                `}
                >
                  <span class={`font-black pointer-events-none
                    ${isBlack
                        ? `text-[9px] sm:text-[10px] ${isSelected() ? "text-white" : "text-white/40"}`
                        : `text-xs sm:text-sm ${isSelected() ? "text-white scale-110" : "text-black/40"}`
                    }
                  `}>
                    {beautify(pcOnly())}
                  </span>
                </div>
              );
            }}
          </For>
        </div>
      </div>

      {/* Solo mostrar el slider si el contenido desborda (opcional) */}
      <div class="px-4 sm:px-6 py-0">
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          class="range range-primary range-xs h-2 opacity-20 hover:opacity-100 transition-opacity"
          onInput={(e) => {
            const max = scrollContainer!.scrollWidth - scrollContainer!.clientWidth;
            scrollContainer!.scrollLeft = (parseFloat(e.currentTarget.value) / 100) * max;
          }}
        />
      </div>
    </div>
  );
};
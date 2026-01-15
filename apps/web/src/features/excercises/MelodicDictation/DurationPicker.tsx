// apps/web/src/features/excercises/MelodicDictation/components/DurationPicker.tsx
import { For } from "solid-js";

export const DurationPicker = (props: { selected: string, onSelect: (d: string) => void }) => {
  const durations = [
    { id: "w", label: "𝅝", name: "Redonda" },
    { id: "h", label: "𝅗𝅥", name: "Blanca" },
    { id: "q", label: "𝅘𝅥", name: "Negra" },
  ];

  return (
    <div class="flex gap-2 bg-base-200 p-2 rounded-2xl border border-base-content/10">
      <For each={durations}>{(d) => (
        <button 
          onClick={() => props.onSelect(d.id)}
          class={`btn btn-lg flex-1 flex flex-col gap-0 ${props.selected === d.id ? 'btn-primary' : 'btn-ghost'}`}
        >
          <span class="text-2xl leading-none">{d.label}</span>
          <span class="text-[8px] uppercase font-black opacity-50">{d.name}</span>
        </button>
      )}</For>
    </div>
  );
};
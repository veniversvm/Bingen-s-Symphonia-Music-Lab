import { Volume2, VolumeX, Volume1 } from "lucide-solid";
import { globalVolume, updateGlobalVolume } from "../../store/audioStore";
import { Show } from "solid-js";

export const VolumeControl = () => {
  return (
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-ghost btn-circle btn-sm">
        <Show when={globalVolume() > 0} fallback={<VolumeX size={18} class="text-error" />}>
          <Show when={globalVolume() > 0.5} fallback={<Volume1 size={18} />}>
            <Volume2 size={18} class="text-primary" />
          </Show>
        </Show>
      </label>
      
      <div tabindex="0" class="dropdown-content z-[100] card card-compact w-48 p-4 shadow-2xl bg-base-100 border border-base-content/10 mt-2">
        <div class="flex flex-col gap-3">
          <div class="flex justify-between items-center">
            <span class="text-[10px] font-black uppercase opacity-40">Volumen</span>
            <span class="text-[10px] font-mono font-bold">{Math.round(globalVolume() * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={globalVolume()} 
            onInput={(e) => updateGlobalVolume(parseFloat(e.currentTarget.value))}
            class="range range-xs range-primary" 
          />
        </div>
      </div>
    </div>
  );
};
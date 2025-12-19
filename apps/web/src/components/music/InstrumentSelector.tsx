import { createSignal } from "solid-js";
import { audioEngine, type InstrumentName } from "../../lib/audio";

export const InstrumentSelector = () => {
  const [active, setActive] = createSignal<InstrumentName>('acoustic_grand_piano');
  const [loading, setLoading] = createSignal(false);

  const changeInstrument = async (name: InstrumentName) => {
    setLoading(true);
    setActive(name);
    // Como ahora hay descarga (aunque rápida), usamos async
    await audioEngine.setInstrument(name);
    setLoading(false);
  };

  const btnClass = (name: InstrumentName) => 
    `btn btn-sm ${active() === name ? 'btn-primary' : 'btn-ghost'} gap-2 transition-all`;

  return (
    <div class="flex flex-wrap justify-center gap-2 mb-4 p-2 bg-base-200/50 rounded-lg border border-base-content/5">
      <button class={btnClass('acoustic_grand_piano')} onClick={() => changeInstrument('acoustic_grand_piano')}>
        🎹 Piano
      </button>
      <button class={btnClass('acoustic_guitar_nylon')} onClick={() => changeInstrument('acoustic_guitar_nylon')}>
        🎸 Guitarra
      </button>
      <button class={btnClass('violin')} onClick={() => changeInstrument('violin')}>
        🎻 Violín
      </button>
      <button class={btnClass('flute')} onClick={() => changeInstrument('flute')}>
        🎼 Flauta
      </button>
      <button class={btnClass('choir_aahs')} onClick={() => changeInstrument('choir_aahs')}>
        🗣️ Voz
      </button>

      {/* Indicador de carga pequeño */}
      {loading() && <span class="loading loading-spinner loading-xs text-primary"></span>}
    </div>
  );
};
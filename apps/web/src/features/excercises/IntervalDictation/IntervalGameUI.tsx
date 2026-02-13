import { For, Show } from "solid-js";
import {
  Music,
  LogOut,
  ChevronRight,
  CircleCheck, 
  CircleX,
} from "lucide-solid";
import { useIntervalI18n } from "./i18n";
import { currentLang } from "../../../i18n"; 

interface Props {
  levelName: string;
  subLevelName: string;
  instrumentName: string;
  streak: number;
  feedback: "correct" | "wrong" | null;
  intervalName: string;
  options: string[];
  isLoading: boolean;
  onPlay: () => void;
  onAnswer: (interval: string) => void;
  onNext: () => void;
  onExit: () => void;
  onCompare: (interval: string) => void;
}

export const IntervalGameUI = (props: Props) => {
  const [t] = useIntervalI18n();

  // 1. Lógica de formateo musical (3m -> 3ª m / m3)
  const formatInterval = (raw: string, lang: string) => {
    if (!raw) return "";
    const num = raw.slice(0, -1);
    const quality = raw.slice(-1);
    let formattedQuality = quality;

    if (lang === "es") {
      if (quality === "P") formattedQuality = "J";
      return `${num}ª ${formattedQuality}`;
    } else {
      return `${quality}${num}`;
    }
  };

  const renderName = (val: string) => formatInterval(val, currentLang());

  return (
    <div class="w-full max-w-5xl mx-auto h-[calc(100dvh-120px)] flex flex-col gap-4 overflow-hidden px-2">
      
      {/* 1. TOP TOOLBAR */}
      <div class="flex items-center justify-between bg-base-100 p-4 rounded-2xl shadow-lg border border-base-content/10 shrink-0">
        <button
          onClick={props.onExit}
          class="btn btn-ghost btn-sm text-error font-black uppercase tracking-tighter"
        >
          <LogOut size={16} />{" "}
          <span class="hidden sm:inline">
            {t("summary.exit" as any) || "Terminar"}
          </span>
        </button>

        <div class="flex gap-4 items-center">
          <div class="text-right hidden sm:block">
            <p class="text-[10px] font-black uppercase opacity-40 italic leading-none mb-1">Set</p>
            <p class="text-sm font-bold text-primary leading-none">{props.levelName}</p>
          </div>

          <div class="text-right">
            <p class="text-[10px] font-black uppercase opacity-40 italic leading-none mb-1">Modo</p>
            <p class="text-xs font-bold text-secondary tracking-widest uppercase leading-none">
              {props.subLevelName}
            </p>
          </div>

          <div class="flex gap-1 bg-base-200 p-1.5 rounded-full shadow-inner">
            <For each={[0, 1, 2]}>
              {(i) => (
                <div
                  class={`w-3 h-3 rounded-full transition-all duration-500 ${props.streak > i ? "bg-accent shadow-[0_0_8px_var(--accent)]" : "bg-base-300"}`}
                />
              )}
            </For>
          </div>
        </div>
      </div>

      {/* 2. ÁREA DE AUDIO Y FEEDBACK CENTRAL */}
      <div
        class="flex-grow flex flex-col items-center justify-center bg-base-100 rounded-3xl border border-base-content/10 shadow-2xl relative overflow-hidden transition-colors duration-500"
        classList={{
          "bg-base-100": !props.feedback,
          "bg-success/5 border-success/30": props.feedback === "correct",
          "bg-error/5 border-error/30": props.feedback === "wrong",
        }}
      >
        <div class="absolute inset-0 bg-primary/5 pointer-events-none opacity-50"></div>

        <button
          onClick={props.onPlay}
          class="btn btn-circle btn-primary btn-xl w-32 h-32 shadow-2xl hover:scale-105 transition-transform border-8 border-base-100 z-10"
        >
          <Music size={48} class="fill-current" />
        </button>

        <div class="mt-8 flex flex-col items-center gap-2 h-24 justify-center z-10">
          <Show
            when={props.feedback}
            fallback={
              <div class="flex flex-col items-center">
                <span class="badge badge-outline opacity-50 uppercase font-black text-[10px] mb-1">
                  {props.instrumentName}
                </span>
                <span class="text-lg font-serif italic text-primary font-bold animate-pulse">
                  Escucha con atención...
                </span>
              </div>
            }
          >
            {/* VISTA DE RESULTADO */}
            <div class="flex flex-col items-center animate-in zoom-in slide-in-from-bottom-4">
              <div class={`flex items-center gap-3 text-3xl font-black ${props.feedback === "correct" ? "text-success" : "text-error"}`}>
                {props.feedback === "correct" ? <CircleCheck size={32} /> : <CircleX size={32} />}
                <span>{renderName(props.intervalName)}</span>
              </div>

              {/* TEXTO DE COMPARACIÓN (Indica que los botones siguen activos) */}
              <div class="flex flex-col items-center gap-1 mt-2">
                <span class="badge badge-sm font-bold opacity-60 uppercase tracking-tighter">
                  {t(("game." + props.feedback) as any) as string}
                </span>
                <p class="text-[9px] uppercase font-black opacity-30 animate-pulse mt-1 tracking-widest text-center">
                  Toca los intervalos para comparar sonidos
                </p>
              </div>
            </div>
          </Show>
        </div>
      </div>

      {/* 3. BOTONERA DE RESPUESTA / COMPARACIÓN */}
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 shrink-0 pb-4 px-2">
        <For each={props.options}>
          {(interval) => (
            <button
              class="btn btn-md md:btn-lg btn-outline font-black text-xl transition-all relative no-animation h-14"
              classList={{
                // Botón Correcto: Verde siempre
                "btn-success !text-white scale-105 shadow-lg border-success":
                  !!props.feedback && interval === props.intervalName,
                // Botón Incorrecto pulsado: Rojo
                "btn-error opacity-70 border-error":
                  props.feedback === "wrong" && interval !== props.intervalName,
                // Otros botones tras responder: Atenuados pero clickeables para comparar
                "btn-ghost opacity-40":
                  props.feedback === "correct" && interval !== props.intervalName,
                "hover:scale-105 active:scale-95": !!props.feedback 
              }}
              // LÓGICA DE CLIC DUAL: Responder o Comparar
              onClick={() => {
                if (props.feedback) {
                    props.onCompare(interval);
                } else {
                    props.onAnswer(interval);
                }
              }}
            >
              {renderName(interval)}
            </button>
          )}
        </For>

        {/* BOTÓN DE AVANCE */}
        <Show when={props.feedback}>
          <button
            class="btn btn-neutral col-span-full btn-lg animate-in zoom-in font-black uppercase tracking-widest shadow-2xl mt-2 h-14"
            onClick={props.onNext}
          >
            {(t("common.next" as any) as string) || "Siguiente"}{" "}
            <ChevronRight size={20} />
          </button>
        </Show>
      </div>
    </div>
  );
};
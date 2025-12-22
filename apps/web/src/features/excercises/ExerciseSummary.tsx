import { createMemo } from "solid-js";
import { Dynamic } from "solid-js/web"; // <--- IMPORTAR ESTO
import { Trophy, Star, CircleAlert, RotateCcw, Home } from "lucide-solid";
import { useChordI18n } from "./ChordDictation/i18n";

interface Props {
  score: number;
  total: number;
  onRetry: () => void;
  onExit: () => void;
}

export const ExerciseSummary = (props: Props) => {
  const [t] = useChordI18n();

  const percentage = createMemo(() => {
    // Si el total es 0 o negativo, el porcentaje es 0 para evitar divisiones por cero
    if (!props.total || props.total <= 0) return 0;

    const calculated = Math.round((props.score / props.total) * 100);

    // Verificamos que sea un número finito (por si acaso)
    return isFinite(calculated) ? calculated : 0;
  });

  const resultState = createMemo(() => {
    const p = percentage();
    if (p >= 80)
      return {
        color: "text-success",
        bg: "bg-success/10",
        border: "border-success",
        icon: Trophy,
        label: t("summary.perfect") as string,
      };
    if (p >= 60)
      return {
        color: "text-warning",
        bg: "bg-warning/10",
        border: "border-warning",
        icon: Star,
        label: t("summary.improve") as string,
      };
    return {
      color: "text-error",
      bg: "bg-error/10",
      border: "border-error",
      icon: CircleAlert,
      label: t("summary.review") as string,
    };
  });

  return (
    <div class="w-full max-w-md md:max-w-2xl mx-auto animate-fade-in p-4">
      <div
        class={`card bg-base-100 shadow-2xl border-2 ${resultState().border} overflow-hidden`}
      >
        {/* HEADER CON COLOR DINÁMICO */}
        <div
          class={`${resultState().bg} ${resultState().color} p-8 flex flex-col items-center gap-4`}
        >
          <div class="p-4 bg-base-100 rounded-full shadow-lg">
            <Dynamic component={resultState().icon} size={48} />
          </div>
          <h2 class="text-2xl md:text-3xl font-serif font-bold text-center">
            {resultState().label}
          </h2>
        </div>

        <div class="card-body items-center p-6 md:p-10">
          {/* STATS GRID */}
          <div class="grid grid-cols-3 w-full gap-4 mb-8">
            <div class="flex flex-col items-center">
              <span class="text-[10px] uppercase font-black opacity-40">
                {t("summary.correct") as string}
              </span>
              <span class="text-2xl font-bold">{props.score}</span>
            </div>
            <div class="flex flex-col items-center border-x border-base-content/10">
              <span class="text-[10px] uppercase font-black opacity-40">
                {t("summary.percentage") as string}
              </span>
              <span class={`text-2xl font-black ${resultState().color}`}>
                {percentage()}%
              </span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-[10px] uppercase font-black opacity-40">
                {t("summary.total") as string}
              </span>
              <span class="text-2xl font-bold">{props.total}</span>
            </div>
          </div>

          {/* PROGRESS BAR GRANDE */}
          <div class="w-full space-y-2 mb-10">
            <div class="flex justify-between text-xs font-bold opacity-50 uppercase tracking-widest">
              <span>0%</span>
              <span>100%</span>
            </div>
            <progress
              class={`progress w-full h-4 shadow-inner ${
                percentage() >= 80
                  ? "progress-success"
                  : percentage() >= 60
                    ? "progress-warning"
                    : "progress-error"
              }`}
              // Usamos Number() para asegurar que siempre pasamos un valor numérico al DOM
              value={Number(percentage())}
              max="100"
            ></progress>
          </div>

          {/* ACTIONS */}
          <div class="flex flex-col sm:flex-row w-full gap-4 mt-4">
            <button
              class="btn btn-outline btn-lg flex-1 gap-3 font-bold"
              onClick={props.onRetry}
            >
              <RotateCcw size={20} />
              {t("summary.retry") as string}
            </button>
            <button
              class="btn btn-primary btn-lg flex-1 gap-3 font-black shadow-xl"
              onClick={props.onExit}
            >
              <Home size={20} />
              {t("summary.exit") as string}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

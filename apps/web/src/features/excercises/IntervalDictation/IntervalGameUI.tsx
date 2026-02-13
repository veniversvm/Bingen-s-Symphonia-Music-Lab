import { For, Show } from "solid-js";
import { Music, LogOut, ChevronRight, CheckCircle2, XCircle } from "lucide-solid";
import { useIntervalI18n } from "./i18n";

interface Props {
  // Datos de Estado
  levelName: string;      // Ej: "Nivel 2das" o "Personalizado"
  subLevelName: string;   // Ej: "Melódico Ascendente"
  instrumentName: string; // Ej: "Piano"
  streak: number;         // 0, 1, 2, 3
  feedback: 'correct' | 'wrong' | null;
  intervalName: string;   // El nombre del intervalo actual (para mostrar en feedback)
  options: string[];      // Lista de botones a mostrar
  isLoading: boolean;
  
  // Eventos
  onPlay: () => void;
  onAnswer: (interval: string) => void;
  onNext: () => void;
  onExit: () => void;
}

export const IntervalGameUI = (props: Props) => {
  const [t] = useIntervalI18n();

  return (
    <div class="w-full max-w-5xl mx-auto h-[calc(100dvh-120px)] flex flex-col gap-4 overflow-hidden px-2">
      
      {/* 1. TOP TOOLBAR */}
      <div class="flex items-center justify-between bg-base-100 p-4 rounded-2xl shadow-lg border border-base-content/10 shrink-0">
        <button onClick={props.onExit} class="btn btn-ghost btn-sm text-error font-black uppercase tracking-tighter">
          <LogOut size={16}/> <span class="hidden sm:inline">{t('summary.exit' as any) || 'Terminar'}</span>
        </button>
        
        <div class="flex gap-4 items-center">
          <div class="text-right hidden sm:block">
            <p class="text-[10px] font-black uppercase opacity-40 italic">Nivel / Set</p>
            <p class="text-sm font-bold text-primary">{props.levelName}</p>
          </div>
          
          <div class="text-right">
            <p class="text-[10px] font-black uppercase opacity-40 italic">Modo</p>
            <p class="text-xs font-bold text-secondary uppercase tracking-widest">
               {props.subLevelName}
            </p>
          </div>

          {/* Racha (Solo se muestra si es mayor a 0 o si estamos en modo maestría) */}
          <div class="flex gap-1 bg-base-200 p-1 rounded-full">
            <For each={[0, 1, 2]}>{(i) => (
              <div class={`w-3 h-3 rounded-full transition-all duration-500 ${props.streak > i ? 'bg-accent shadow-[0_0_8px_var(--accent)]' : 'bg-base-300'}`} />
            )}</For>
          </div>
        </div>
      </div>

      {/* 2. ÁREA DE AUDIO PRINCIPAL + FEEDBACK */}
      <div class="flex-grow flex flex-col items-center justify-center bg-base-100 rounded-3xl border border-base-content/10 shadow-2xl relative overflow-hidden transition-colors duration-500"
           classList={{
             'bg-base-100': !props.feedback,
             'bg-success/5 border-success/30': props.feedback === 'correct',
             'bg-error/5 border-error/30': props.feedback === 'wrong'
           }}>
         
         <div class="absolute inset-0 bg-primary/5 pointer-events-none opacity-50"></div>
         
         <button 
           onClick={props.onPlay}
           class="btn btn-circle btn-primary btn-xl w-32 h-32 shadow-2xl hover:scale-105 transition-transform border-8 border-base-100 z-10"
         >
           <Music size={48} class="fill-current" />
         </button>
         
         <div class="mt-8 flex flex-col items-center gap-2 h-16 justify-center">
            <Show when={props.feedback} fallback={
                <div class="flex flex-col items-center">
                   <span class="badge badge-outline opacity-50 uppercase font-black text-[10px] mb-1">{props.instrumentName}</span>
                   <span class="text-lg font-serif italic text-primary font-bold animate-pulse">
                      {props.isLoading ? t('common.loading' as any) : 'Escucha con atención...'}
                   </span>
                </div>
            }>
                <div class="flex flex-col items-center animate-in zoom-in slide-in-from-bottom-4">
                    <div class={`flex items-center gap-2 text-xl font-black uppercase tracking-widest ${props.feedback === 'correct' ? 'text-success' : 'text-error'}`}>
                        {props.feedback === 'correct' ? <CheckCircle2 /> : <XCircle />}
                        <span>{props.intervalName}</span>
                    </div>
                    <span class="text-xs opacity-60 font-mono mt-1">
                        {props.feedback === 'correct' ? t('game.correct' as any) : t('game.wrong' as any)}
                    </span>
                </div>
            </Show>
         </div>
      </div>

      {/* 3. BOTONERA DE RESPUESTA */}
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 shrink-0 pb-4">
        <For each={props.options}>{(interval) => (
          <button 
            class="btn btn-md md:btn-lg btn-outline font-black text-xl hover:btn-primary transition-all relative"
            classList={{ 
              'btn-success !text-white scale-105 shadow-lg border-success': !!props.feedback && interval === props.intervalName,
              'btn-error opacity-40 border-error': props.feedback === 'wrong' && interval !== props.intervalName,
              'btn-ghost opacity-20': props.feedback === 'correct' && interval !== props.intervalName
            }}
            onClick={() => props.onAnswer(interval)}
            disabled={!!props.feedback}
          >
            {interval}
          </button>
        )}</For>
        
        <Show when={props.feedback}>
          <button class="btn btn-neutral col-span-full btn-lg animate-in zoom-in font-black uppercase tracking-widest shadow-2xl mt-2" onClick={props.onNext}>
            {(t('game.nextLevel' as any) as string) || "Siguiente"} <ChevronRight size={20} />
          </button>
        </Show>
      </div>
    </div>
  );
};
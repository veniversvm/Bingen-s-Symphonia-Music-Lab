import { For, Show } from "solid-js";
import { useAboutI18n } from "./i18n";
import { 
  CheckCircle2, Circle, Layout, Users, 
  BookOpen, Smartphone, ShieldCheck, Info 
} from "lucide-solid";

export const ProjectRoadmap = () => {
  const [t] = useAboutI18n();

  const phases = [
    { id: "one", icon: Layout, color: "border-secondary", status: "current" },
    { id: "two", icon: Users, color: "border-primary", status: "next" },
    { id: "three", icon: BookOpen, color: "border-primary", status: "next" },
    { id: "four", icon: Smartphone, color: "border-base-content/10", status: "future" },
  ];

  return (
    <div class="w-full space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* 1. VERSION BADGE & HEADER */}
      <div class="text-center space-y-4">
        <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-warning/10 text-warning border border-warning/20">
          <Info size={14} />
          <span class="text-[10px] font-black uppercase tracking-[0.2em]">{t('roadmap.versionNote') as string}</span>
        </div>
        <h2 class="text-4xl md:text-5xl font-serif font-black text-primary uppercase tracking-tighter">
          {t('roadmap.title') as string}
        </h2>
        <p class="text-lg opacity-50 font-serif italic max-w-2xl mx-auto leading-tight">
          {t('roadmap.subtitle') as string}
        </p>
      </div>

      {/* 2. GRID DE FASES */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <For each={phases}>{(phase) => (
          <div class={`card bg-base-100 shadow-xl border-l-8 ${phase.color} transition-all hover:shadow-2xl group`}>
            <div class="card-body p-6 md:p-8">
              <div class="flex justify-between items-start mb-4">
                <div class="flex flex-col">
                  <span class="text-[10px] font-black uppercase opacity-40 tracking-widest">
                    {t(`roadmap.phases.${phase.id}.tag` as any) as string}
                  </span>
                  <div class="mt-1">
                    <Show when={phase.status === 'current'} fallback={
                      <span class="text-[9px] font-bold opacity-30 italic">{t(`roadmap.phases.${phase.id}.status` as any) as string}</span>
                    }>
                      <span class="badge badge-secondary badge-sm font-bold animate-pulse text-[9px]">
                        {t(`roadmap.phases.${phase.id}.status` as any) as string}
                      </span>
                    </Show>
                  </div>
                </div>
                <div class="p-3 rounded-2xl bg-base-200 group-hover:bg-primary group-hover:text-primary-content transition-colors">
                  <phase.icon size={22} />
                </div>
              </div>

              <h3 class="card-title font-serif text-xl md:text-2xl leading-tight">
                {t(`roadmap.phases.${phase.id}.title` as any) as string}
              </h3>
              <p class="text-sm opacity-60 mt-2 leading-relaxed h-12 overflow-hidden text-ellipsis">
                {t(`roadmap.phases.${phase.id}.goal` as any) as string}
              </p>

              <div class="divider opacity-5"></div>

              <ul class="space-y-3">
                <For each={t(`roadmap.phases.${phase.id}.items` as any) as unknown as string[]}>{(item) => (
                  <li class="flex items-start gap-3 group/item">
                    <div class="mt-1">
                      <Show when={phase.status === 'current'} fallback={<Circle size={10} class="opacity-20" />}>
                        <CheckCircle2 size={14} class="text-secondary" />
                      </Show>
                    </div>
                    <span class="text-xs md:text-sm opacity-80 group-hover/item:text-primary transition-colors cursor-default">
                      {item}
                    </span>
                  </li>
                )}</For>
              </ul>
            </div>
          </div>
        )}</For>
      </div>

      {/* 3. TRANSPARENCY NOTICE (THE 1.0 PROMISE) */}
      <div class="card bg-base-300/50 border border-base-content/10 p-8 md:p-12 rounded-[3rem] shadow-inner text-center overflow-hidden relative">
        <div class="relative z-10 flex flex-col items-center gap-6">
          <div class="p-4 bg-primary/10 text-primary rounded-full shadow-inner">
             <ShieldCheck size={40} />
          </div>
          <div class="max-w-2xl space-y-4">
            <h3 class="text-2xl font-serif font-black uppercase tracking-widest text-primary">
              {t('roadmap.fundingNotice.title') as string}
            </h3>
            <p class="opacity-70 text-base leading-relaxed italic font-serif">
              {t('roadmap.fundingNotice.content') as string}
            </p>
          </div>
          <div class="pt-4">
            <button class="btn btn-outline btn-primary btn-lg px-12 rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform">
               Follow our progress
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
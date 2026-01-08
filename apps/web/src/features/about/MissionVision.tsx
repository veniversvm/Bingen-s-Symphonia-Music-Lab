
import { For } from "solid-js";
import { useAboutI18n } from "./i18n"; // Tu conector local
import { Target, Eye, ShieldCheck, Zap, Users, Globe, Sparkles } from "lucide-solid";

export const MissionVision = () => {
  const [t] = useAboutI18n();

  const valueIcons = {
    excellence: ShieldCheck,
    autonomy: Globe,
    innovation: Zap,
    community: Users,
    accessibility: Sparkles
  };

  return (
    <div class="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* SECCIÓN MISIÓN Y VISIÓN */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Misión */}
        <div class="card bg-base-100 shadow-2xl border-t-4 border-success overflow-hidden group">
          <div class="card-body p-8">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-success/10 text-success rounded-2xl group-hover:scale-110 transition-transform">
                <Target size={32} />
              </div>
              <div>
                <h2 class="text-3xl font-serif font-black text-success lowercase italic leading-none">
                  {t('mission.title') as string}
                </h2>
                <p class="text-[10px] uppercase font-black opacity-40 tracking-widest">{t('mission.subtitle') as string}</p>
              </div>
            </div>
            <p class="text-lg leading-relaxed opacity-80">{t('mission.content') as string}</p>
          </div>
        </div>

        {/* Visión */}
        <div class="card bg-base-100 shadow-2xl border-t-4 border-primary overflow-hidden group">
          <div class="card-body p-8">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                <Eye size={32} />
              </div>
              <div>
                <h2 class="text-3xl font-serif font-black text-primary lowercase italic leading-none">
                  {t('vision.title') as string}
                </h2>
                <p class="text-[10px] uppercase font-black opacity-40 tracking-widest">{t('vision.subtitle') as string}</p>
              </div>
            </div>
            <p class="text-lg leading-relaxed opacity-80">{t('vision.content') as string}</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN VALORES CORE */}
      <div class="space-y-8">
        <div class="text-center">
          <h2 class="text-3xl font-serif font-black text-base-content">{t('values.title') as string}</h2>
          <p class="text-xs uppercase font-black opacity-30 tracking-[0.3em] mt-2">{t('values.subtitle') as string}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <For each={Object.keys(valueIcons)}>{(key) => (
            <div class="card bg-base-100/50 border border-base-content/5 hover:border-primary/30 transition-all hover:shadow-xl group">
              <div class="card-body p-6 items-center text-center">
                <div class="p-4 bg-base-200 rounded-2xl text-primary group-hover:bg-primary group-hover:text-primary-content transition-all mb-2">
                  {/* @ts-ignore - Acceso dinámico al icono */}
                  <Dynamic component={valueIcons[key]} size={24} />
                </div>
                <h3 class="font-bold text-lg">{t(`values.items.${key}.title` as any) as string}</h3>
                <p class="text-sm opacity-60 leading-snug">{t(`values.items.${key}.description` as any) as string}</p>
              </div>
            </div>
          )}</For>
        </div>
      </div>
      
    </div>
  );
};
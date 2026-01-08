import { useAboutI18n } from "./i18n";
import hildegardImg from "../../assets/500px-Hildegard_von_Bingen._Line_engraving_by_W._Marshall._Wellcome_V0002761.avif";
import { ExternalLink, ScrollText, GraduationCap, Microscope, Quote } from "lucide-solid";

export const WhyBingen = () => {
  const [t] = useAboutI18n();

  return (
    <div class="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <div class="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* COLUMNA IZQUIERDA: Identidad Visual y Espiritual */}
        <div class="lg:w-1/3 space-y-8 sticky top-24">
          <div class="relative group">
            <div class="absolute -inset-2 bg-gradient-to-b from-primary/30 to-secondary/30 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition duration-1000"></div>
            <img 
              src={hildegardImg} 
              class="relative rounded-2xl shadow-2xl sepia-[.2] grayscale-[.2] border-4 border-base-100 transition-all duration-700 group-hover:sepia-0 group-hover:grayscale-0 w-full" 
              alt="Hildegard von Bingen" 
            />
          </div>

          {/* CITA UBICADA DEBAJO DE LA FOTO */}
          <div class="relative p-6 bg-base-100 rounded-2xl border border-base-content/5 shadow-inner italic">
            <Quote size={32} class="absolute -top-3 -left-2 text-primary opacity-20" />
            <p class="text-lg font-serif text-base-content/90 leading-relaxed relative z-10">
              "{t('whyBingen.quote') as string}"
            </p>
            <footer class="mt-4 text-[10px] uppercase font-black tracking-widest text-primary opacity-60">
              — Hildegard von Bingen
            </footer>
          </div>
          
          <a 
            href={t('whyBingen.wikiLink') as string} 
            target="_blank" 
            rel="noopener noreferrer"
            class="btn btn-primary w-full gap-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <ExternalLink size={18} />
            <span class="text-xs uppercase font-black tracking-tighter">
              {t('whyBingen.wikiLabel') as string}
            </span>
          </a>
        </div>

        {/* COLUMNA DERECHA: La Narrativa Expandida */}
        <div class="lg:w-2/3 space-y-10">
          <header class="space-y-6">
            <h2 class="text-4xl md:text-6xl font-serif font-black text-primary italic leading-tight">
              {t('whyBingen.title') as string}
            </h2>
            <p class="text-xl leading-relaxed font-serif text-base-content/80 text-justify">
              {t('whyBingen.intro') as string}
            </p>
          </header>

          <div class="divider opacity-10"></div>

          {/* Secciones de Contenido */}
          <div class="space-y-12">
            
            {/* Razón 1 */}
            <section class="flex flex-col md:flex-row gap-6 group">
              <div class="shrink-0 w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-content transition-all duration-500 shadow-lg">
                <ScrollText size={28} />
              </div>
              <div class="space-y-3">
                <h3 class="text-2xl font-bold font-serif text-primary">
                  {t('whyBingen.reasons.one.title') as string}
                </h3>
                <p class="text-lg text-base-content/70 leading-relaxed text-justify">
                  {t('whyBingen.reasons.one.content') as string}
                </p>
              </div>
            </section>

            {/* Razón 2 */}
            <section class="flex flex-col md:flex-row gap-6 group">
              <div class="shrink-0 w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-secondary-content transition-all duration-500 shadow-lg">
                <GraduationCap size={28} />
              </div>
              <div class="space-y-4">
                <h3 class="text-2xl font-bold font-serif text-secondary">
                  {t('whyBingen.reasons.two.title') as string}
                </h3>
                <p class="text-lg text-base-content/70 leading-relaxed text-justify">
                  {t('whyBingen.reasons.two.content') as string}
                </p>
                <div class="p-4 bg-base-300/50 rounded-xl border-l-4 border-secondary/30">
                  <p class="text-xs font-mono opacity-60 uppercase tracking-tighter leading-snug">
                    {t('whyBingen.reasons.two.note') as string}
                  </p>
                </div>
              </div>
            </section>

            {/* Razón 3 */}
            <section class="flex flex-col md:flex-row gap-6 group pb-10">
              <div class="shrink-0 w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-content transition-all duration-500 shadow-lg">
                <Microscope size={28} />
              </div>
              <div class="space-y-3">
                <h3 class="text-2xl font-bold font-serif text-accent">
                  {t('whyBingen.reasons.three.title') as string}
                </h3>
                <p class="text-lg text-base-content/70 leading-relaxed text-justify">
                  {t('whyBingen.reasons.three.content') as string}
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

import { onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { useI18n } from '../i18n';
import hildegardImg from '../assets/500px-Hildegard_von_Bingen._Line_engraving_by_W._Marshall._Wellcome_V0002761.avif';

const MainPage = () => {
  const [t] = useI18n();

  onMount(() => {
    // ESTRATEGIA DE PRE-CARGA (PREFETCHING)
    setTimeout(() => {
      console.log("⚡ Pre-cargando módulos pesados...");
      import('../components/music/VexStaff');
      import('../lib/audio');
      import('./ExercisesPage');
      import('../features/excercises/ExercisesHome');
    }, 1500);
  });

  return (
    <main class="hero min-h-[90vh] bg-base-200 animate-fade-in px-4 py-8 lg:py-0">
      <div class="hero-content flex-col lg:flex-row-reverse gap-8 lg:gap-16 max-w-7xl">
        
        {/* SECCIÓN DE IMAGEN: Mobile First */}
        <div class="relative group w-full max-w-[280px] sm:max-w-sm aspect-[384/500] bg-base-300 rounded-2xl overflow-hidden shadow-2xl">
          <div class="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-20 group-hover:opacity-60 transition duration-1000"></div>
          
          <img 
            src={hildegardImg} 
            class="relative w-full h-full object-cover sepia-[.3] grayscale-[.5] hover:sepia-0 hover:grayscale-0 transition-all duration-700" 
            alt="Hildegard von Bingen"
            loading="eager"
            // @ts-ignore
            fetchpriority="high"
            width="384"
            height="500"
          />
          
          {/* Caption discreto */}
          <div class="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
             <p class="text-[9px] text-white text-center font-serif italic">
               Hildegardis a Virgin Prophetess & Music Master
             </p>
          </div>
        </div>

        {/* SECCIÓN DE TEXTO: Tipografía Responsiva */}
        <div class="text-center lg:text-left flex flex-col items-center lg:items-start max-w-xl">
          <div class="badge badge-primary badge-outline mb-6 font-bold tracking-widest text-xs">
            v1.0.0 ALPHA
          </div>
          
          {/* Título escala de 3xl en móvil a 5xl/6xl en desktop */}
          <h1 class="text-3xl sm:text-4xl lg:text-6xl font-black font-serif leading-[1.1] text-base-content">
            {t('common.appName')}
          </h1>
          
          <div class="w-20 h-1.5 bg-primary my-6 rounded-full opacity-50"></div>
          
          <p class="text-base sm:text-lg lg:text-xl opacity-70 leading-relaxed mb-10 max-w-md lg:max-w-none">
            {t('home.subtitle')}
          </p>
          
          {/* BOTONES: Full width en móvil, auto en desktop */}
          <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <A 
              href="/exercises" 
              class="btn btn-primary btn-lg px-8 shadow-xl shadow-primary/20 font-black uppercase tracking-wider text-sm sm:text-base"
            >
              {t('home.start')}
            </A>
            <A 
              href="/theory" 
              class="btn btn-outline btn-lg px-8 border-base-content/20 hover:bg-base-content/5 font-bold uppercase tracking-wider text-sm sm:text-base"
            >
              {t('nav.theory')}
            </A>
          </div>

          {/* CITA ADICIONAL: Solo visible en pantallas más grandes para no saturar el móvil */}
          <div class="mt-12 hidden sm:block border-l-2 border-primary/30 pl-6 italic opacity-40 text-sm font-serif">
            "Liberi mentes, musica fluit."
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainPage;
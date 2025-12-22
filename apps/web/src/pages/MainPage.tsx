import { onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { useI18n } from '../i18n';
import hildegardImg from '../assets/Hildegard_von_Bingen._Line_engraving_by_W._Marshall.avif';

const MainPage = () => {
  const [t] = useI18n();

  // ESTRATEGIA DE PRE-CARGA (PREFETCHING)
  onMount(() => {
    // Esperamos 1.5 segundos a que la Home esté totalmente pintada y el usuario tranquilo
    setTimeout(() => {
      console.log("⚡ Pre-cargando módulos pesados en segundo plano...");
      
      // 1. Descargar el motor de VexFlow (Visualización)
      import('../components/music/VexStaff');
      
      // 2. Descargar el motor de Audio (Soundfont Player)
      import('../lib/audio');
      
      // 3. Descargar las vistas de ejercicios
      import('./ExercisesPage');
      import('../features/excercises/ExercisesHome');
      
    }, 1500);
  });

  return (
    <div class="hero min-h-[80vh] bg-base-200 animate-fade-in">
      <div class="hero-content flex-col lg:flex-row-reverse gap-12">
        
      <div class="relative group aspect-[384/500] bg-base-300 rounded-lg overflow-hidden">
          <div class="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          
          <img 
            src={hildegardImg} 
            class="relative max-w-sm rounded-lg shadow-2xl sepia-[.3] grayscale-[.5] hover:sepia-0 hover:grayscale-0 transition-all duration-700" 
            alt="Hildegard von Bingen"
            // OPTIMIZACIÓN LCP (Largest Contentful Paint)
            loading="eager"       // Cargar inmediatamente
            // @ts-ignore (Propiedad nueva de navegadores modernos)
            fetchpriority="high"  // Prioridad máxima sobre otros recursos
            width="384"           // Evita saltos de layout (CLS)
            height="500"
          />
          <p class="text-[10px] text-center mt-2 opacity-50 font-serif italic">
            Hildegardis a Virgin Prophetess & Music Master
          </p>
        </div>

        <div class="text-center lg:text-left max-w-lg">
          <div class="badge badge-primary badge-outline mb-4">v1.0.0 Alpha</div>
          <h1 class="text-5xl font-bold font-serif leading-tight">
            {t('common.appName')}
          </h1>
          <p class="py-6 text-lg opacity-80 leading-relaxed">
            {t('home.subtitle')}
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            {/* El link ya apuntará a un módulo que se está descargando en background */}
            <A href="/exercises" class="btn btn-primary btn-lg shadow-lg">
              {t('home.start')}
            </A>
            <A href="/theory" class="btn btn-ghost btn-lg border border-base-content/10">
              {t('nav.theory')}
            </A>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
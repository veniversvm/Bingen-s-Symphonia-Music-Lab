import { A } from '@solidjs/router';
import { useI18n } from '../../i18n';

export default function ExercisesHome() {
  const [t] = useI18n(); // Hook reactivo

  return (
    <div class="space-y-6">
      <div class="prose max-w-none">
        <h1 class="font-serif text-3xl">{t('home.title')}</h1>
        <p class="text-base-content/70">{t('home.subtitle')}</p>
      </div>

      {/* GRID MOBILE FIRST: 
          grid-cols-1 (Móvil: Una columna, tarjetas grandes)
          md:grid-cols-2 (Tablet/PC: Dos columnas)
      */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* TARJETA 1: ACORDES */}
        <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all border-l-4 border-secondary">
          <div class="card-body">
            <h3 class="card-title font-serif">{t('home.chordConstruction')}</h3>
            <p class="text-sm opacity-70">{t('home.chordConstructionDesc')}</p>
            
            <div class="card-actions justify-end mt-4">
              <A 
                href="/exercises/chord-construction" 
                class="btn btn-sm btn-secondary text-secondary-content"
              >
                {t('home.start')}
              </A>
            </div>
          </div>
        </div>

        {/* TARJETA 2: DICTADO */}
        <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all border-l-4 border-primary">
          <div class="card-body">
            <h3 class="card-title font-serif">{t('home.chordDictation')}</h3>
            <p class="text-sm opacity-70">{t('home.chordDictationDesc')}</p>
            <div class="card-actions justify-end mt-4">
              <A href="/exercises/chord-dictation" class="btn btn-sm btn-primary">
                {t('home.train')}
              </A>
            </div>
          </div>
        </div>

        {/* TARJETA 3: PLACEHOLDER */}
        <div class="card bg-base-100/50 border border-dashed border-base-content/20">
          <div class="card-body items-center justify-center text-center opacity-50">
            <p>{t('home.comingSoon')}: Dictado Melódico</p>
          </div>
        </div>

      </div>
    </div>
  );
}
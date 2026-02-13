import { A } from '@solidjs/router';
import { useI18n } from '../../i18n';

export default function ExercisesHome() {
  const [t] = useI18n();

  return (
    <div class="space-y-6 animate-fade-in">
      <div class="prose max-w-none text-center md:text-left">
        <h1 class="font-serif text-3xl md:text-4xl font-bold text-primary">
          {t('home.title') as string}
        </h1>
        <p class="text-base-content/70">{t('home.subtitle') as string}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. RECONOCIMIENTO DE NOTAS (Accent - Cian) */}
        <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all border-l-4 border-accent group">
          <div class="card-body">
            <div class="flex justify-between items-start">
              <h3 class="card-title font-serif text-xl group-hover:text-accent transition-colors">
                {t('home.noteRecognition') as string}
              </h3>
            </div>
            <p class="text-sm opacity-70">{t('home.noteRecognitionDesc') as string}</p>
            
            <div class="card-actions justify-end mt-4">
              <A 
                href="/exercises/note-recognition" 
                class="btn btn-sm btn-accent text-accent-content font-bold"
              >
                {t('home.start') as string}
              </A>
            </div>
          </div>
        </div>

        {/* TARJETA 2: DICTADO DE INTERVALOS (Warning - Ámbar) */}
        <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all border-l-4 border-warning group">
          <div class="card-body">
            <h3 class="card-title font-serif text-xl group-hover:text-warning transition-colors">
              {t('home.intervalDictation') as string}
            </h3>
            <p class="text-sm opacity-70">
              {t('home.intervalDictationDesc') as string}
            </p>
            <div class="card-actions justify-end mt-4">
              <A href="/exercises/interval-dictation" class="btn btn-sm btn-warning text-warning-content font-bold">
                {t('home.train') as string}
              </A>
            </div>
          </div>
        </div>

        {/* 3. CONSTRUCCIÓN DE ACORDES (Secondary - Verde) */}
        <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all border-l-4 border-secondary group">
          <div class="card-body">
            <h3 class="card-title font-serif text-xl group-hover:text-secondary transition-colors">
              {t('home.chordConstruction') as string}
            </h3>
            <p class="text-sm opacity-70">{t('home.chordConstructionDesc') as string}</p>
            
            <div class="card-actions justify-end mt-4">
              <A 
                href="/exercises/chord-construction" 
                class="btn btn-sm btn-secondary text-secondary-content font-bold"
              >
                {t('home.start') as string}
              </A>
            </div>
          </div>
        </div>

        {/* 4. DICTADO DE ACORDES (Primary - Azul) */}
        <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all border-l-4 border-primary group">
          <div class="card-body">
            <h3 class="card-title font-serif text-xl group-hover:text-primary transition-colors">
              {t('home.chordDictation') as string}
            </h3>
            <p class="text-sm opacity-70">{t('home.chordDictationDesc') as string}</p>
            <div class="card-actions justify-end mt-4">
              <A href="/exercises/chord-dictation" class="btn btn-sm btn-primary font-bold">
                {t('home.train') as string}
              </A>
            </div>
          </div>
        </div>

        {/* 5. PRÓXIMAMENTE: Dictado Melódico */}
        {/* <div class="card bg-base-100/30 border border-dashed border-base-content/20 flex flex-col justify-center items-center p-8 opacity-60">
            <p class="font-serif italic text-sm text-center">
              {t('home.comingSoon' as any)}: <br/>
              <span class="font-bold not-italic">Dictado Melódico</span>
            </p>
        </div> */}

      </div>
    </div>
  );
}
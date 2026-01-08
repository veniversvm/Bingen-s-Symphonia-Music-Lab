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
        
        {/* TARJETA 1: RECONOCIMIENTO DE NOTAS */}
        <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all border-l-4 border-accent group">
          <div class="card-body">
            <div class="flex justify-between items-start">
              <h3 class="card-title font-serif text-xl group-hover:text-accent transition-colors">
                {t('home.noteRecognition') as string}
              </h3>
              {/* Este enlace lleva a la vista que gestiona Config/Juego de notas */}
              {/* <div class="badge badge-accent badge-outline text-[10px] font-bold">NIVEL PROGRESIVO</div> */}
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

        {/* TARJETA 2: CONSTRUCCIÓN DE ACORDES */}
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

        {/* TARJETA 3: DICTADO DE ACORDES */}
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

        {/* TARJETA 4: DICTADO MELÓDICO (ACTIVO) */}
        <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all border-l-4 border-warning group">
          <div class="card-body">
            <h3 class="card-title font-serif text-xl group-hover:text-warning transition-colors">
              {t('home.melodicDictation' as any) || "Dictado Melódico"}
            </h3>
            <p class="text-sm opacity-70">
              {t('home.melodicDictationDesc' as any) || "Entrena polifonía a 2, 3 y 4 voces."}
            </p>
            <div class="card-actions justify-end mt-4">
              <A href="/exercises/melodic-dictation" class="btn btn-sm btn-warning text-warning-content font-bold">
                {t('home.train') as string}
              </A>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

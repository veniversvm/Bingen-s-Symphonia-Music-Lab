import { createSignal } from 'solid-js';
// import { A } from '@solidjs/router';
import { ChordDictationConfig, type ChordDictationSettings } from '../ChordDictation/ChordDictationConfig';
import { ChordConstructionGame } from './ChordConstructionGame';
// import { useChordConstructionI18n } from './i18n';

export default function ChordConstructionView() {
  // const [t] = useChordConstructionI18n();
  const [step, setStep] = createSignal<'config' | 'game'>('config');
  const [gameSettings, setGameSettings] = createSignal<ChordDictationSettings | null>(null);

  const startGame = (settings: ChordDictationSettings) => {
    setGameSettings(settings);
    setStep('game');
  };

  const exitGame = () => {
    setStep('config');
    setGameSettings(null);
  };

  return (
    <div class="space-y-6 animate-fade-in">
      {/* Breadcrumbs dinámicos */}
      {/* <div class="flex items-center gap-2 text-xs md:text-sm opacity-70 px-2">
        <A href="/exercises" class="hover:underline italic uppercase font-bold tracking-widest text-primary">
          {t('nav.practice' as any)}
        </A> 
        <span class="opacity-30">/</span>
        <button onClick={exitGame} class="hover:underline uppercase font-bold tracking-widest">
           {t('config.title') as string}
        </button>
        {step() === 'game' && (
          <>
            <span class="opacity-30">/</span>
            <span class="uppercase font-bold tracking-widest text-secondary">En curso</span>
          </>
        )}
      </div> */}

      {step() === 'config' ? (
        <ChordDictationConfig onStart={startGame} />
      ) : (
        gameSettings() && <ChordConstructionGame settings={gameSettings()!} onExit={exitGame} />
      )}
    </div>
  );
}
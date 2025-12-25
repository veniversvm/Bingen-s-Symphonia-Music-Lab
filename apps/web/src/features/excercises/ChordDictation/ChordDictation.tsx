import { createSignal } from 'solid-js';
// import { A } from '@solidjs/router';
import { ChordDictationConfig, type ChordDictationSettings } from './ChordDictationConfig';
import { ChordDictationGame } from './ChordDictationGame';

export default function ChordDictationView() {
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
      {/* Header Común */}
      {/* <div class="flex items-center gap-2 text-sm opacity-70">
        <A href="/exercises" class="hover:underline">Ejercicios</A> 
        <span>/</span>
        <button onClick={exitGame} class="hover:underline">Dictado</button>
        {step() === 'game' && <span>/ En curso</span>}
      </div> */}

      {step() === 'config' ? (
        <ChordDictationConfig onStart={startGame} />
      ) : (
        gameSettings() && <ChordDictationGame settings={gameSettings()!} onExit={exitGame} />
      )}
    </div>
  );
}
import { createSignal, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { IntervalDictationConfig, type IntervalSettings } from './IntervalDictationConfig';
import { useIntervalI18n } from './i18n';
import { IntervalDictationGame } from './IntervalDictationGame';

export default function IntervalDictationView() {
  const [t] = useIntervalI18n();
  const [step, setStep] = createSignal<'config' | 'game'>('config');
  const [settings, setSettings] = createSignal<IntervalSettings | null>(null);

  const startGame = (s: IntervalSettings) => {
    setSettings(s);
    setStep('game');
  };

  const exitGame = () => {
    setStep('config');
    setSettings(null);
  };

  return (
    <div class="space-y-6 animate-fade-in">
      {/* Breadcrumbs */}
      <div class="flex items-center gap-2 text-xs md:text-sm opacity-70 px-2 uppercase font-bold tracking-widest">
        <A href="/exercises" class="hover:underline text-primary">
          {t('nav.practice' as any)}
        </A> 
        <span class="opacity-30">/</span>
        <button onClick={exitGame} class="hover:underline">
           {t('title') as string}
        </button>
      </div>

      <Show 
        when={step() === 'game' && settings()} 
        fallback={<IntervalDictationConfig onStart={startGame} />}
      >
        <IntervalDictationGame settings={settings()!} onExit={exitGame} />
      </Show>
    </div>
  );
}
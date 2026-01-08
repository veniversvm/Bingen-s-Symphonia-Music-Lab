import { createSignal, Show } from "solid-js";
import { NoteRecognitionConfig, type NoteConfigSettings } from "./NoteRecognitionConfig";
import { NoteRecognitionGame } from "./NoteRecognitionGame";

export default function NoteRecognitionView() {
  const [view, setView] = createSignal<'config' | 'game'>('config');
  const [settings, setSettings] = createSignal<NoteConfigSettings | null>(null);

  const handleStart = (s: NoteConfigSettings) => {
    setSettings(s);
    setView('game');
  };

  return (
    <div class="animate-fade-in">
      <Show when={view() === 'config'} fallback={
        <NoteRecognitionGame 
          settings={settings()!} 
          onExit={() => setView('config')} 
        />
      }>
        <NoteRecognitionConfig onStart={handleStart} />
      </Show>
    </div>
  );
}
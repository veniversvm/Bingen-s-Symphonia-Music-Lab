import { createSignal, onMount, Show, For, createMemo } from "solid-js";
import {
  NoteRecognitionGenerator,
  type NoteChallenge,
  NoteUtils,
} from "@bingens/core";

import { PianoInput } from "../../../components/music/PianoInput";
import { useNoteI18n } from "./i18n";
import { audioEngine, type InstrumentName } from "../../../lib/audio";
import {
  Ear,
  ChevronRight,
  Sparkles,
  Trophy,
} from "lucide-solid";
import type { NoteConfigSettings } from "./NoteRecognitionConfig";
import { NoteStaff } from "../../../components/music/NotesStaff";

interface Props {
  settings: NoteConfigSettings;
  onExit: () => void;
}

export const NoteRecognitionGame = (props: Props) => {
  const [t] = useNoteI18n();

  // ─────────────────────────────────────────
  // ESTADO DE PROGRESIÓN
  // ─────────────────────────────────────────
  const [unlockedCount, setUnlockedCount] = createSignal(2);
  const [streak, setStreak] = createSignal(0);
  const [isMasteryPhase, setIsMasteryPhase] = createSignal(false);
  const [noteHistory, setNoteHistory] = createSignal<string[]>([]);

  const currentLevel = createMemo(() => unlockedCount() - 1);

  // ─────────────────────────────────────────
  // ESTADO DEL JUEGO
  // ─────────────────────────────────────────
  const [challenge, setChallenge] = createSignal<NoteChallenge | null>(null);
  const [feedback, setFeedback] = createSignal<null | "correct" | "wrong">(null);
  const [isRevealed, setIsRevealed] = createSignal(false);
  const [inputType] =
    createSignal<"piano" | "buttons">("piano");

  // ─────────────────────────────────────────
  // AUDIO / INSTRUMENTOS
  // ─────────────────────────────────────────
  const [currentInst, setCurrentInst] =
    createSignal<InstrumentName>("acoustic_grand_piano");

  const masteryInstruments: InstrumentName[] = [
    "acoustic_guitar_nylon",
    "violin",
    "flute",
    "choir_aahs",
  ];

  // ─────────────────────────────────────────
  // BOTONES (ENARMONÍA)
  // ─────────────────────────────────────────
  const pitchClasses = [
    "C", "C#", "Db", "D", "D#", "Eb", "E",
    "F", "F#", "Gb", "G", "G#", "Ab",
    "A", "A#", "Bb", "B"
  ];

  // const preferredAccidental = () =>
    challenge()?.note.includes("b") ? "flat" : "sharp";

  // ─────────────────────────────────────────
  // NUEVO RETO (FIX INSTRUMENTO)
  // ─────────────────────────────────────────
  const nextChallenge = async () => {
    setIsRevealed(false);
    setFeedback(null);

    const pool =
      props.settings.mode === "custom"
        ? props.settings.customNotes
        : undefined;

    const next = NoteRecognitionGenerator.generate(
      unlockedCount(),
      noteHistory(),
      pool
    );

    setNoteHistory((prev) => [...prev, next.note].slice(-2));
    setChallenge(next);

    let instrument: InstrumentName = "acoustic_grand_piano";

    if (props.settings.mode === "custom") {
      const insts = props.settings.instruments;
      instrument = insts[Math.floor(Math.random() * insts.length)];
    } else if (isMasteryPhase()) {
      instrument =
        masteryInstruments[
          Math.floor(Math.random() * masteryInstruments.length)
        ];
    }

    setCurrentInst(instrument);
    await audioEngine.setInstrument(instrument);
    audioEngine.play([next.note]);
  };

  // ─────────────────────────────────────────
  // RESPUESTA DEL USUARIO
  // ─────────────────────────────────────────
  const handleResponse = (inputPC: string) => {
    if (isRevealed() || !challenge()) return;

    const userPC = inputPC
      .replace("♯", "#")
      .replace("♭", "b")
      .replace(/\d/g, "");

    const correctPC = challenge()!.pitchClass;

    const isCorrect =
      NoteUtils.get(userPC).chroma ===
      NoteUtils.get(correctPC).chroma;

    setIsRevealed(true);

    if (isCorrect) {
      setFeedback("correct");
      const newStreak = streak() + 1;
      setStreak(newStreak);

      if (props.settings.mode === "default") {
        if (newStreak >= 5) {
          if (!isMasteryPhase()) {
            // ENTRAR EN MASTERY
            setIsMasteryPhase(true);
            setStreak(0);
          } else {
            // SALIR DE MASTERY + DESBLOQUEAR
            setUnlockedCount((c) => c + 1);
            setIsMasteryPhase(false);
            setStreak(0);
            setNoteHistory([]); // 🔑 clave
          }
        }
      }
    } else {
      setFeedback("wrong");
      setStreak(0);
      if (props.settings.mode === "default") {
        setIsMasteryPhase(false);
      }
    }
  };

  onMount(nextChallenge);

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────
  return (
    <div class="max-w-2xl mx-auto p-4 space-y-4 animate-fade-in pb-20">

      {/* HUD */}
      <div class="flex justify-between items-center bg-base-100 p-4 rounded-2xl shadow-lg border border-base-content/5 relative overflow-hidden">
        <div class="absolute -left-2 -bottom-4 text-7xl font-black opacity-5 italic">
          L{currentLevel()}
        </div>

        <div class="flex flex-col gap-1 w-2/3 z-10">
          <span class="text-[10px] uppercase font-black opacity-40 flex gap-2">
            {t("game.streak")}
            <Show when={isMasteryPhase()}>
              <span class="text-secondary flex gap-1 animate-pulse">
                <Sparkles size={12} /> {t("game.mastery") as string}
              </span>
            </Show>
          </span>

          <div class="flex gap-2">
            <For each={[0, 1, 2, 3, 4]}>
              {(i) => (
                <div
                  class={`h-2 flex-1 rounded-full transition-all ${
                    streak() > i
                      ? isMasteryPhase()
                        ? "bg-secondary shadow-[0_0_10px_var(--secondary)]"
                        : "bg-primary"
                      : "bg-base-300"
                  }`}
                />
              )}
            </For>
          </div>
        </div>

        <div class="text-right z-10">
          <span class="text-[9px] uppercase font-black opacity-30 block mb-1">
            {props.settings.mode === "custom"
              ? "MODO CUSTOM"
              : "Próxima nota"}
          </span>

          <p class="text-xl font-serif font-bold text-primary flex justify-end gap-2">
            <Show
              when={props.settings.mode === "default"}
              fallback={
                <button
                  onClick={props.onExit}
                  class="btn btn-ghost btn-xs text-error font-black"
                >
                  EXIT
                </button>
              }
            >
              <Trophy
                size={16}
                class={isMasteryPhase() ? "text-secondary" : "opacity-20"}
              />
              {NoteRecognitionGenerator.getNextNoteToUnlock(unlockedCount()) ||
                "MAX"}
            </Show>
          </p>
        </div>
      </div>

      {/* PENTAGRAMA */}
      <div class="card bg-base-100 shadow-xl border border-base-content/10 overflow-hidden">
        <div class="h-10 flex items-center justify-between px-4 bg-base-200/50">
          <span class="text-[9px] uppercase font-black opacity-50">
            {currentInst().replace(/_/g, " ")}
          </span>

          <Show when={!isRevealed()}>
            <button
              onClick={() => audioEngine.play([challenge()!.note])}
              class="btn btn-ghost btn-xs gap-2"
            >
              <Ear size={14} /> {t("game.repeat") as string}
            </button>
          </Show>
        </div>

        <div class="p-8 min-h-[180px] flex items-center justify-center">
          <Show
            when={isRevealed()}
            fallback={
              <div class="opacity-10 animate-pulse text-primary">
                <Ear size={64} />
              </div>
            }
          >
            <NoteStaff
              note={challenge()!.note}
              clef={challenge()!.clef}
            />
          </Show>
        </div>

        <Show when={isRevealed()}>
          <div
            class={`py-2 text-center text-xs font-black uppercase tracking-widest ${
              feedback() === "correct" ? "bg-success" : "bg-error"
            }`}
          >
            {feedback() === "correct"
              ? t("game.correct")
              : `${t("game.wrong")} • ${challenge()?.pitchClass}`}
          </div>
        </Show>
      </div>

      {/* INPUT */}
      <div class="space-y-4">
        <Show
          when={!isRevealed()}
          fallback={
            <button
              class="btn btn-primary btn-lg w-full gap-3 animate-bounce font-black"
              onClick={nextChallenge}
            >
              {t("common.next") as string}
              <ChevronRight size={24} />
            </button>
          }
        >
          <Show
            when={inputType() === "piano"}
            fallback={
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                <For each={pitchClasses}>
                  {(pc) => (
                    <button
                      class="btn btn-outline btn-md font-bold"
                      onClick={() => handleResponse(pc)}
                    >
                      {pc.replace("#", "♯").replace("b", "♭")}
                    </button>
                  )}
                </For>
              </div>
            }
          >
            <div class="bg-base-100 p-2 rounded-2xl shadow-lg">
              <PianoInput
  mode="mixed"
  startMidi={59}   // B3
  endMidi={74}     // D5 (Do → Do pedagógico)
  selectedNotes={[]}
  onNoteClick={(name) =>
    handleResponse(name.replace(/\d/g, ""))
  }
/>

            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
};

export default NoteRecognitionGame;

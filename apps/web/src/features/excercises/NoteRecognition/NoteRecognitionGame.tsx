import { createSignal, onMount, Show, For } from "solid-js";
import { NoteRecognitionGenerator, type NoteChallenge } from "@bingens/core";
import { NoteStaff } from "../../../components/music/NotesStaff";
import { PianoInput } from "../../../components/music/PianoInput";
import { useNoteI18n } from "./i18n";
import { audioEngine, type InstrumentName } from "../../../lib/audio";
import { Ear, ChevronRight, CircleCheck, CircleX } from "lucide-solid";

export const NoteRecognitionGame = () => {
  const [t] = useNoteI18n();

  // ─────────────────────────────────────────
  // ESTADO DE PROGRESIÓN
  // ─────────────────────────────────────────
  const [unlockedCount, setUnlockedCount] = createSignal(2); // Do, Re
  const [streak, setStreak] = createSignal(0);
  const [isMasteryPhase, setIsMasteryPhase] = createSignal(false);

  // ─────────────────────────────────────────
  // ESTADO DEL JUEGO
  // ─────────────────────────────────────────
  const [challenge, setChallenge] = createSignal<NoteChallenge | null>(null);
  const [feedback, setFeedback] = createSignal<null | "correct" | "wrong">(null);
  const [isRevealed, setIsRevealed] = createSignal(false);
  const [inputType, setInputType] =
    createSignal<"piano" | "buttons">("piano");

  // ─────────────────────────────────────────
  // AUDIO / INSTRUMENTOS
  // ─────────────────────────────────────────
  const [currentInst, setCurrentInst] =
    createSignal<InstrumentName>("acoustic_grand_piano");

  const instruments: InstrumentName[] = [
    "acoustic_guitar_nylon",
    "violin",
    "flute",
    "choir_aahs",
  ];

  // ─────────────────────────────────────────
  // BOTONES (fallback)
  // ─────────────────────────────────────────
  const pitchClasses = [
    "C",
    "C#",
    "D",
    "Eb",
    "E",
    "F",
    "F#",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ];

  // ─────────────────────────────────────────
  // NUEVO RETO
  // ─────────────────────────────────────────
  const nextChallenge = async () => {
    setIsRevealed(false);
    setFeedback(null);

    const next = NoteRecognitionGenerator.generate(unlockedCount());
    setChallenge(next);

    // Instrumento según fase
    if (isMasteryPhase()) {
      const randomInst =
        instruments[Math.floor(Math.random() * instruments.length)];
      setCurrentInst(randomInst);
    } else {
      setCurrentInst("acoustic_grand_piano");
    }

    await audioEngine.setInstrument(currentInst());
    playNote();
  };

  // ─────────────────────────────────────────
  // REPRODUCIR NOTA
  // ─────────────────────────────────────────
  const playNote = () => {
    const note = challenge()?.note;
    if (note) audioEngine.play([note]);
  };

  // ─────────────────────────────────────────
  // RESPUESTA DEL USUARIO (LÓGICA 5 + 5)
  // ─────────────────────────────────────────
  const handleResponse = (pc: string) => {
    if (isRevealed()) return;

    const userPC = pc.replace("♯", "#").replace("♭", "b");
    const correctPC = challenge()?.pitchClass;
    const isCorrect = userPC === correctPC;

    setIsRevealed(true);

    if (isCorrect) {
      setFeedback("correct");

      const newStreak = streak() + 1;
      setStreak(newStreak);

      // ── LÓGICA DE PROGRESIÓN ──
      if (newStreak >= 5) {
        if (!isMasteryPhase()) {
          // Entrar en mastery
          setIsMasteryPhase(true);
          setStreak(0);
        } else {
          // Salir de mastery y desbloquear nota
          setUnlockedCount((c) => c + 1);
          setIsMasteryPhase(false);
          setStreak(0);
        }
      }
    } else {
      setFeedback("wrong");
      setStreak(0);
      setIsMasteryPhase(false);
    }
  };

  onMount(nextChallenge);

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────
  return (
    <div class="max-w-2xl mx-auto p-4 space-y-4 animate-fade-in">
      {/* HUD DE PROGRESO */}
      <div class="flex justify-between items-center bg-base-100 p-4 rounded-2xl shadow-md border border-base-content/5">
        <div class="flex flex-col gap-1">
          <span class="text-[10px] uppercase font-black opacity-40 tracking-widest">
            {t("game.streak")}
            <Show when={isMasteryPhase()}>
              <span class="ml-2 text-secondary font-black">MASTER</span>
            </Show>
          </span>
          <div class="flex gap-1">
            <For each={[1, 2, 3, 4, 5]}>
              {(i) => (
                <div
                  class={`w-6 h-2 rounded-full transition-all duration-300 ${
                    streak() >= i ? "bg-primary" : "bg-base-300"
                  }`}
                />
              )}
            </For>
          </div>
        </div>

        <div class="text-right">
          <span class="text-[10px] uppercase font-black opacity-40 tracking-widest">
            {currentInst().replace(/_/g, " ")}
          </span>
          <p class="text-lg font-serif font-bold text-secondary">
            {NoteRecognitionGenerator.getNextNoteToUnlock(unlockedCount()) ||
              "MAX"}
          </p>
        </div>
      </div>

      {/* ÁREA DE ESCUCHA / PENTAGRAMA */}
      <div class="card bg-base-100 shadow-xl border border-base-content/10 overflow-hidden">
        <div
          class="h-10 flex items-center justify-center transition-colors"
          classList={{
            "bg-success/20 text-success": feedback() === "correct",
            "bg-error/20 text-error": feedback() === "wrong",
            "bg-base-200": !feedback(),
          }}
        >
          <Show
            when={isRevealed()}
            fallback={
              <button
                onClick={playNote}
                class="btn btn-ghost btn-xs gap-2 opacity-50 hover:opacity-100"
              >
                <Ear size={14} /> {t("game.repeat") || "Repetir"}
              </button>
            }
          >
            <div class="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
              <Show
                when={feedback() === "correct"}
                fallback={<CircleX size={16} />}
              >
                <CircleCheck size={16} />
              </Show>
              {feedback() === "correct"
                ? t("game.correct")
                : `${t("game.wrong")} (${challenge()?.pitchClass})`}
            </div>
          </Show>
        </div>

        <div class="p-8 min-h-[200px] flex items-center justify-center bg-base-100">
          <Show
            when={isRevealed()}
            fallback={
              <div class="flex flex-col items-center gap-4 opacity-10 animate-pulse">
                <Ear size={64} />
                <p class="font-serif italic text-sm">Escucha con atención…</p>
              </div>
            }
          >
            <NoteStaff note={challenge()!.note} clef={challenge()!.clef} />
          </Show>
        </div>
      </div>

      {/* INPUTS */}
      <div class="space-y-4">
        <div class="flex justify-center join border border-base-content/10 shadow-sm">
          <button
            class={`join-item btn btn-xs px-4 ${
              inputType() === "piano" ? "btn-active" : ""
            }`}
            onClick={() => setInputType("piano")}
          >
            {t("game.inputPiano")}
          </button>
          <button
            class={`join-item btn btn-xs px-4 ${
              inputType() === "buttons" ? "btn-active" : ""
            }`}
            onClick={() => setInputType("buttons")}
          >
            {t("game.inputButtons")}
          </button>
        </div>

        <Show
          when={!isRevealed()}
          fallback={
            <button
              class="btn btn-primary btn-lg w-full gap-3 shadow-xl animate-bounce"
              onClick={nextChallenge}
            >
              {t("common.next") || "Siguiente"}{" "}
              <ChevronRight size={20} />
            </button>
          }
        >
          <Show
            when={inputType() === "piano"}
            fallback={
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <For each={pitchClasses}>
                  {(pc) => (
                    <button
                      class="btn btn-outline btn-lg font-bold text-xl"
                      onClick={() => handleResponse(pc)}
                    >
                      {pc.replace("#", "♯")}
                    </button>
                  )}
                </For>
              </div>
            }
          >
            <div class="bg-base-100 p-2 rounded-2xl shadow-lg border border-base-content/5">
              <PianoInput
                mode="mixed"
                startMidi={59}
                endMidi={74}
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

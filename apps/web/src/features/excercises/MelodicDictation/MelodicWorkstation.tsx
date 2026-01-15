import { createSignal, Show } from "solid-js";
import { audioEngine } from "../../../lib/audio";
import type { MelodicExercise } from "@bingens/core"; 
import { Play, Undo2, CheckCircle2, ChevronDown, X, Trophy } from "lucide-solid";
import { VexGrandStaff } from "../../../components/music/VexGrandStaff";
import { useMelodicI18n } from "./i18n";
import MelodicInputStaff from "./MelodicInputStaff";
import { DurationPicker } from "./DurationPicker";

interface MelodicSettings {
  maxRepeats: number;
  measuresPerBlock: number;
  targetKey: string;
  transpose: number;
}

const MelodicWorkstation = (props: { 
  exercise: MelodicExercise, 
  settings: MelodicSettings, 
  onExit: () => void 
}) => {
  const [t] = useMelodicI18n();
  const [currentBlock, setCurrentBlock] = createSignal(1);
  const [repeatsLeft, setRepeatsLeft] = createSignal(props.settings.maxRepeats);
  const [isWait, setIsWait] = createSignal(false);
  
  const [userInput, setUserInput] = createSignal<{ pitch: string, duration: string }[]>([]);
  const [selectedDuration, setSelectedDuration] = createSignal("q");
  const [showSolution, setShowSolution] = createSignal(false);

  // --- LÓGICA DE NAVEGACIÓN ---
  const handleBlockChange = (direction: number) => {
    const next = currentBlock() + direction;
    const maxBlocks = Math.ceil(props.exercise.totalMeasures / props.settings.measuresPerBlock);
    
    if (next >= 1 && next <= maxBlocks) {
      setCurrentBlock(next);
      setRepeatsLeft(props.settings.maxRepeats); // Reiniciamos intentos al cambiar bloque
      audioEngine.stopAll(); // Detenemos audio previo
    }
  };

  const playCurrentSegment = async () => {
    if (repeatsLeft() <= 0 || isWait()) return;
    setIsWait(true);

    if (currentBlock() === 1 && repeatsLeft() === props.settings.maxRepeats) {
      await audioEngine.playTonalReference(props.settings.targetKey, props.exercise.mode);
    }

    const now = audioEngine.currentTime;
    audioEngine.playMetronome(1, props.exercise.timeSignature, props.exercise.bpm, now);

    const startM = ((currentBlock() - 1) * props.settings.measuresPerBlock) + 1;
    const beatsInMeasure = parseInt(props.exercise.timeSignature.split('/')[0]);
    const waitTime = (60 / props.exercise.bpm) * beatsInMeasure;
    
    setTimeout(() => {
      audioEngine.playMidiSection(
        props.exercise.midiPath!, 
        startM, 
        props.settings.measuresPerBlock, 
        props.exercise.timeSignature, 
        props.exercise.bpm, 
        props.settings.transpose
      );
      setIsWait(false);
    }, waitTime * 1000);

    setRepeatsLeft(r => r - 1);
  };

  const addNote = (pitch: string) => {
    if (showSolution()) return;
    setUserInput([...userInput(), { pitch, duration: selectedDuration() }]);
    audioEngine.play([pitch]);
  };

  // --- LÓGICA DE VALIDACIÓN (Simple) ---
  const calculateSuccess = () => {
    const totalExpected = props.exercise.steps.length;
    const totalUser = userInput().length;
    if (totalExpected === 0) return 0;
    return Math.round((Math.min(totalUser, totalExpected) / totalExpected) * 100);
  };

  return (
    <div class="w-full h-[calc(100dvh-120px)] flex flex-col gap-2 overflow-hidden animate-fade-in pb-2">
      <div class="flex flex-col lg:flex-row gap-2 flex-grow overflow-hidden">
        
        {/* PANEL IZQUIERDO: ÁREA DE TRABAJO */}
        <div class="flex flex-col flex-[2] bg-base-100 rounded-2xl shadow-xl border border-base-content/10 overflow-hidden">
          <div class="flex items-center justify-between px-3 py-1.5 bg-base-200/50 border-b border-base-content/5">
            <span class="text-[10px] font-black uppercase opacity-40 tracking-widest">
              {t('workstation.editorTitle') as string}
            </span>
            <button 
              onClick={() => setUserInput(userInput().slice(0, -1))} 
              class="btn btn-ghost btn-xs text-error gap-1"
              disabled={userInput().length === 0 || showSolution()}
            >
              <Undo2 size={12} /> {t('workstation.undo') as string}
            </button>
          </div>

          <div class="flex-grow flex items-center justify-center p-2 min-h-0 bg-base-100 overflow-hidden">
            <MelodicInputStaff 
              notes={userInput()} 
              onStaffClick={addNote} 
              clef={props.exercise.numVoices > 2 ? 'treble' : 'treble'} 
            />
          </div>

          {/* REPRODUCTOR DE BLOQUES */}
          <div class="grid grid-cols-2 border-t border-base-content/10 bg-base-200/30 h-12">
            <button 
              class="btn btn-ghost h-full rounded-none border-r border-base-content/5 gap-2" 
              onClick={playCurrentSegment} 
              disabled={repeatsLeft() <= 0 || isWait() || showSolution()}
            >
              <Show when={!isWait()} fallback={<span class="loading loading-spinner loading-xs"></span>}>
                <Play size={16} fill="currentColor" /> 
                <span class="text-[10px] uppercase font-black">
                  {t('workstation.listenBlock') as string} ({repeatsLeft()})
                </span>
              </Show>
            </button>
            <div class="flex items-center justify-center gap-4 px-2">
               <button class="btn btn-ghost btn-xs" onClick={() => handleBlockChange(-1)}>
                 <ChevronDown size={18} class="rotate-90" />
               </button>
               <span class="text-[10px] font-mono font-bold uppercase tracking-tighter">
                 {t('workstation.block') as string} {currentBlock()}
               </span>
               <button class="btn btn-ghost btn-xs" onClick={() => handleBlockChange(1)}>
                 <ChevronDown size={18} class="-rotate-90" />
               </button>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: HERRAMIENTAS */}
        <div class="flex flex-col flex-1 gap-2 min-h-0">
          <div class="card bg-base-100 shadow-xl border border-base-content/5 flex-grow overflow-hidden">
            <div class="card-body p-4 justify-between">
              <div class="space-y-4">
                <h3 class="text-[10px] font-black uppercase opacity-30 tracking-widest text-center">
                  {t('workstation.figures') as string}
                </h3>
                <DurationPicker selected={selectedDuration()} onSelect={setSelectedDuration} />
              </div>
              <div class="space-y-2 mt-auto">
                <button 
                  class="btn btn-primary btn-md w-full gap-2 font-black uppercase text-xs shadow-lg" 
                  onClick={() => { setShowSolution(true); audioEngine.stopAll(); }}
                  disabled={userInput().length === 0}
                >
                  <CheckCircle2 size={18} /> {t('workstation.check') as string}
                </button>
                <button class="btn btn-ghost btn-sm w-full text-[10px] uppercase opacity-50 font-bold" onClick={props.onExit}>
                  {t('workstation.exit') as string}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY DE SOLUCIÓN */}
      <Show when={showSolution()}>
        <div class="absolute inset-0 z-50 bg-neutral/95 backdrop-blur-sm p-4 flex flex-col animate-in zoom-in duration-300 text-white">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-4">
              <h2 class="text-xl font-serif font-bold italic">{t('workstation.masterSolution') as string}</h2>
              <div class="badge badge-secondary gap-2 p-3 font-black">
                <Trophy size={14}/> {calculateSuccess()}% Precision
              </div>
            </div>
            <button class="btn btn-circle btn-sm btn-ghost" onClick={() => setShowSolution(false)}>
              <X size={20}/>
            </button>
          </div>
          <div class="flex-grow bg-white rounded-3xl p-4 md:p-8 flex items-center justify-center overflow-hidden text-black shadow-2xl">
             <VexGrandStaff exercise={props.exercise} />
          </div>
        </div>
      </Show>
    </div>
  );
};

export default MelodicWorkstation;
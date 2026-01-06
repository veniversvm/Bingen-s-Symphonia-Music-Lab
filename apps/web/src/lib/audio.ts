import * as Soundfont from 'soundfont-player';
import { globalVolume } from '../store/audioStore'; // Importar el signal
import { createEffect } from 'solid-js';

// Nombres oficiales de General MIDI
export type InstrumentName =
  | "acoustic_grand_piano"
  | "acoustic_guitar_nylon"
  | "violin"
  | "flute"
  | "choir_aahs"; // Voz

class AudioEngine {
  private ctx: AudioContext;
  private currentInstrument: Soundfont.Player | null = null;
  private currentName: InstrumentName = "acoustic_grand_piano";
  private isLoading = false;
  private masterGain: GainNode;

  constructor() {
    // Inicializamos el contexto de audio del navegador
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Cargar piano por defecto
    //this.setInstrument("acoustic_grand_piano");
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    
    // 2. Establecer volumen inicial
    this.masterGain.gain.value = globalVolume();

    // 3. REACTIVIDAD: Cuando el signal global cambie, el audio cambia al instante
    createEffect(() => {
      const vol = globalVolume();
      // Usamos setTargetAtTime para evitar "clicks" al mover el slider
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    });
  }

  public async setInstrument(name: InstrumentName) {
    if (this.currentName === name && this.currentInstrument) return;

    this.isLoading = true;
    this.currentName = name;

    try {
        // Optimizacion: Si el contexto está suspendido (regla de Chrome), lo reanudamos al cargar
        if (this.ctx.state === 'suspended') await this.ctx.resume();
  
        this.currentInstrument = await Soundfont.instrument(this.ctx, name, {
          destination: this.masterGain // <--- IMPORTANTE
        });
      } catch (e) {
        console.error("Error cargando instrumento MIDI:", e);
      } finally {
        this.isLoading = false;
      }
  }

  public async play(notes: string[]) {
    // Si intentan tocar sin haber cargado nada, cargamos el piano por defecto
    if (!this.currentInstrument && !this.isLoading) {
       await this.setInstrument('acoustic_grand_piano');
    }

    this.playSequence(notes, 0);
  }

  
  public arpeggiate(notes: string[]) {
    // Tocar notas con 300ms de separación
    this.playSequence(notes, 0.3);
  }

  // Método privado unificado
  private playSequence(notes: string[], gapSeconds: number) {
    if (this.ctx.state === "suspended") this.ctx.resume();

    if (this.currentInstrument && !this.isLoading) {
      this.currentInstrument.stop();

      notes.forEach((note, index) => {
        // Si gapSeconds es 0, todos suenan en currentTime (Acorde)
        // Si gapSeconds es 0.3, suenan en 0, 0.3, 0.6... (Arpegio)
        const time = this.ctx.currentTime + index * gapSeconds;

        this.currentInstrument?.play(note, time, {
          duration: 2.5,
          gain: 1,
        });
      });
    }
  }
  public getIsLoading() {
    return this.isLoading;
  }
}

export const audioEngine = new AudioEngine();

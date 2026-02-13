import * as Soundfont from 'soundfont-player';
import { globalVolume } from '../store/audioStore';
import { createEffect } from 'solid-js';

export type InstrumentName =
  | "acoustic_grand_piano"
  | "acoustic_guitar_nylon"
  | "violin"
  | "flute"
  | "choir_aahs"
  | "lead_1_square"
  | "trumpet";

class AudioEngine {
  private ctx: AudioContext;
  private currentInstrument: Soundfont.Player | null = null;
  private currentName: InstrumentName | null = null;
  private isLoading = false;
  private masterGain: GainNode;
  private limiter: DynamicsCompressorNode;
  
  // --- NUEVA PROPIEDAD: Lista de notas que están sonando actualmente ---
  private activeNotes: any[] = []; 

  constructor() {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.limiter = this.ctx.createDynamicsCompressor();
    
    // Configuración de Limitador para evitar distorsión con el boost
    this.limiter.threshold.setValueAtTime(-3, this.ctx.currentTime);
    this.limiter.knee.setValueAtTime(0, this.ctx.currentTime);
    this.limiter.ratio.setValueAtTime(20, this.ctx.currentTime);
    this.limiter.attack.setValueAtTime(0.005, this.ctx.currentTime);
    this.limiter.release.setValueAtTime(0.05, this.ctx.currentTime);

    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.ctx.destination);
    
    // BOOST x4 para compensar samples bajos
    this.masterGain.gain.value = globalVolume() * 4;

    createEffect(() => {
      const vol = globalVolume();
      this.masterGain.gain.setTargetAtTime(vol * 4, this.ctx.currentTime, 0.05);
    });
  }

  // --- MÉTODO CORREGIDO: Detener todo el audio inmediatamente ---
  public stopAll() {
    // 1. Detener cada nota individualmente (limpia osciladores de violin/voz)
    this.activeNotes.forEach(note => {
      try {
        if (note && note.stop) note.stop();
      } catch (e) {
        // Ignorar si la nota ya se había detenido sola
      }
    });
    this.activeNotes = [];

    // 2. Parada de emergencia de la librería (limpia la cola de mensajes)
    if (this.currentInstrument) {
      this.currentInstrument.stop();
    }
  }

  public async setInstrument(name: InstrumentName) {
    if (this.currentName === name && this.currentInstrument) return;

    // Limpiamos audio antes de cambiar instrumento
    this.stopAll();

    this.isLoading = true;
    this.currentName = name;

    try {
      if (this.ctx.state === 'suspended') await this.ctx.resume();

      this.currentInstrument = await Soundfont.instrument(this.ctx, name, {
        destination: this.masterGain,
        gain: (name === "lead_1_square" || name === "trumpet") ? 1.5 : 3 
      });
    } catch (e) {
      console.error("Error cargando instrumento:", e);
    } finally {
      this.isLoading = false;
    }
  }

  public async play(notes: string[]) {
    if (!this.currentInstrument && !this.isLoading) {
       await this.setInstrument('acoustic_grand_piano');
    }
    // Para acordes (bloque), también limpiamos antes
    this.playSequence(notes, 0);
  }

  public arpeggiate(notes: string[]) {
    this.playSequence(notes, 0.3);
  }

  // --- MÉTODO CORE: Control de secuencia con limpieza ---
  public playSequence(notes: string[], gapSeconds: number) {
    if (this.ctx.state === "suspended") this.ctx.resume();

    // LIMPIEZA PREVIA: Mata cualquier sonido anterior antes de empezar el nuevo
    this.stopAll();

    if (this.currentInstrument && !this.isLoading) {
      notes.forEach((note, index) => {
        const time = this.ctx.currentTime + (index * gapSeconds);

        // Guardamos la referencia de la nota en nuestro array activeNotes
        const audioNode = this.currentInstrument?.play(note, time, {
          duration: 3,
          gain: 4, 
        });

        if (audioNode) {
          this.activeNotes.push(audioNode);
        }
      });
    }
  }

  public getIsLoading() {
    return this.isLoading;
  }
}

export const audioEngine = new AudioEngine();
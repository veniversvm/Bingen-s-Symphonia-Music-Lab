import * as Soundfont from 'soundfont-player';
import { globalVolume } from '../store/audioStore';
import { createEffect } from 'solid-js';

export type InstrumentName =
  | "acoustic_grand_piano"
  | "acoustic_guitar_nylon"
  | "violin"
  | "flute"
  | "choir_aahs";

class AudioEngine {
  private ctx: AudioContext;
  private currentInstrument: Soundfont.Player | null = null;
  private currentName: InstrumentName | null = null;
  private isLoading = false;
  private masterGain: GainNode;
  private limiter: DynamicsCompressorNode; 

  constructor() {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // 1. Master Gain con etapa de potencia alta
    this.masterGain = this.ctx.createGain();
    
    // 2. Configuración de Limitador (para evitar que el sonido se rompa al subirlo tanto)
    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.setValueAtTime(-3, this.ctx.currentTime); // Límite casi al máximo
    this.limiter.knee.setValueAtTime(0, this.ctx.currentTime);
    this.limiter.ratio.setValueAtTime(20, this.ctx.currentTime); // Ratio de limitador
    this.limiter.attack.setValueAtTime(0.005, this.ctx.currentTime);
    this.limiter.release.setValueAtTime(0.05, this.ctx.currentTime);

    // Conexión: Instrumento -> masterGain -> limiter -> Salida
    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.ctx.destination);
    
    // BOOST: Multiplicamos el volumen por 4.0 para compensar el bajo nivel de los samples
    this.masterGain.gain.value = globalVolume() * 4;

    createEffect(() => {
      const vol = globalVolume();
      // El factor 4.0 hará que el 50% del slider suene como el 200% original
      this.masterGain.gain.setTargetAtTime(vol * 4, this.ctx.currentTime, 0.05);
    });
  }

  public async setInstrument(name: InstrumentName) {
    if (this.currentName === name && this.currentInstrument) return;
    this.isLoading = true;
    this.currentName = name;

    try {
      if (this.ctx.state === 'suspended') await this.ctx.resume();

      this.currentInstrument = await Soundfont.instrument(this.ctx, name, {
        destination: this.masterGain,
        // Algunos instrumentos necesitan un boost interno adicional
        gain: 3 
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
    this.playSequence(notes, 0);
  }

  public arpeggiate(notes: string[]) {
    this.playSequence(notes, 0.3);
  }

  private playSequence(notes: string[], gapSeconds: number) {
    if (this.ctx.state === "suspended") this.ctx.resume();

    if (this.currentInstrument && !this.isLoading) {
      // Importante no usar .stop() agresivo si queremos que las colas de sonido se mantengan
      // pero si el volumen es un problema, esto limpia el buffer anterior.
      this.currentInstrument.stop();

      notes.forEach((note, index) => {
        const time = this.ctx.currentTime + index * gapSeconds;

        this.currentInstrument?.play(note, time, {
          duration: 3,
          gain: 4, // Etapa de ganancia final por nota
        });
      });
    }
  }

  public getIsLoading() {
    return this.isLoading;
  }
}

export const audioEngine = new AudioEngine();
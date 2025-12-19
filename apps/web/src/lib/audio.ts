import Soundfont from "soundfont-player";

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

  constructor() {
    // Inicializamos el contexto de audio del navegador
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Cargar piano por defecto
    //this.setInstrument("acoustic_grand_piano");
  }

  public async setInstrument(name: InstrumentName) {
    if (this.currentName === name && this.currentInstrument) return;

    this.isLoading = true;
    this.currentName = name;

    try {
        // Optimizacion: Si el contexto está suspendido (regla de Chrome), lo reanudamos al cargar
        if (this.ctx.state === 'suspended') await this.ctx.resume();
  
        this.currentInstrument = await Soundfont.instrument(this.ctx, name);
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

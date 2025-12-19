import Soundfont from 'soundfont-player';

// Nombres oficiales de General MIDI
export type InstrumentName = 
  | 'acoustic_grand_piano' 
  | 'acoustic_guitar_nylon' 
  | 'violin' 
  | 'flute' 
  | 'choir_aahs'; // Voz

class AudioEngine {
  private ctx: AudioContext;
  private currentInstrument: Soundfont.Player | null = null;
  private currentName: InstrumentName = 'acoustic_grand_piano';
  private isLoading = false;

  constructor() {
    // Inicializamos el contexto de audio del navegador
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Cargar piano por defecto
    this.setInstrument('acoustic_grand_piano');
  }

  public async setInstrument(name: InstrumentName) {
    if (this.currentName === name && this.currentInstrument) return;
    
    this.isLoading = true;
    this.currentName = name;

    try {
      // Carga el SoundFont desde internet
      this.currentInstrument = await Soundfont.instrument(this.ctx, name);
    } catch (e) {
      console.error("Error cargando instrumento MIDI:", e);
    } finally {
      this.isLoading = false;
    }
  }

  public play(notes: string[]) {
    // Regla de navegadores: Reanudar AudioContext si está suspendido
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.currentInstrument && !this.isLoading) {
      // Detenemos notas anteriores para limpiar el sonido
      this.currentInstrument.stop();
      
      // Reproducir cada nota
      notes.forEach(note => {
        this.currentInstrument?.play(note, this.ctx.currentTime, { 
          duration: 2, // Duración en segundos
          gain: 1      // Volumen
        });
      });
    }
  }

  public getIsLoading() {
    return this.isLoading;
  }
}

export const audioEngine = new AudioEngine();
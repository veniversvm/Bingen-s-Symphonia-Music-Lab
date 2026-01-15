import * as Soundfont from 'soundfont-player';
import { globalVolume } from '../store/audioStore';
import { createEffect } from 'solid-js';
import { Midi } from '@tonejs/midi';
import { NoteUtils, transpose, distance } from '@bingens/core'; 

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

  constructor() {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    
    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.setValueAtTime(-3, this.ctx.currentTime); 
    this.limiter.knee.setValueAtTime(0, this.ctx.currentTime);
    this.limiter.ratio.setValueAtTime(20, this.ctx.currentTime); 
    this.limiter.attack.setValueAtTime(0.005, this.ctx.currentTime);
    this.limiter.release.setValueAtTime(0.05, this.ctx.currentTime);

    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.ctx.destination);
    
    this.masterGain.gain.value = globalVolume() * 4;

    createEffect(() => {
      const vol = globalVolume();
      this.masterGain.gain.setTargetAtTime(vol * 4, this.ctx.currentTime, 0.05);
    });
  }

  /**
   * Helper para resolver URLs de archivos (especialmente para GitHub Pages)
   */
  private resolveUrl(url: string): string {
    const baseUrl = import.meta.env.VITE_BASE_PATH || "/";
    return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  }

  public async setInstrument(name: InstrumentName) {
    if (this.currentName === name && this.currentInstrument) return;
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

  // --- REPRODUCCIÓN BÁSICA ---

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
      this.currentInstrument.stop();
      notes.forEach((note, index) => {
        const time = this.ctx.currentTime + index * gapSeconds;
        this.currentInstrument?.play(note, time, {
          duration: 2.5,
          gain: 4, 
        });
      });
    }
  }

  // --- LÓGICA DE DICTADO MELÓDICO ---

  /**
   * Toca la cadencia II-V-I para situar la tonalidad
   */
  public async playTonalReference(key: string, mode: 'major' | 'minor') {
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    
    const progression = mode === 'major' 
      ? [["D3", "F3", "A3", "C4"], ["G2", "F3", "B3", "D4"], ["C3", "E3", "G3", "C4"]]
      : [["D3", "F3", "Ab3", "C4"], ["G2", "F3", "Ab3", "B3"], ["C3", "Eb3", "G3", "C4"]];

    const intervalDist = distance("C", key);
    const notesToPlay = progression.map(chord => chord.map(note => transpose(note, intervalDist)));

    let time = this.ctx.currentTime + 0.1;
    notesToPlay.forEach((chord, i) => {
      chord.forEach(note => {
        this.currentInstrument?.play(note, time + i * 1.2, { duration: 1.1, gain: 1.5 });
      });
    });

    return 3.6; 
  }

  /**
   * Toca el metrónomo de cortesía
   */
  public playMetronome(measures: number, signature: string, bpm: number, startTime: number) {
    const [beatsPerMeasure] = signature.split('/').map(Number);
    const secondsPerBeat = 60 / bpm;
    const totalBeats = measures * beatsPerMeasure;

    for (let i = 0; i < totalBeats; i++) {
      const isDownbeat = i % beatsPerMeasure === 0;
      const time = startTime + (i * secondsPerBeat);
      this.currentInstrument?.play(isDownbeat ? "C6" : "C5", time, { duration: 0.1, gain: isDownbeat ? 1.5 : 0.5 });
    }
  }


  public async playMidiSection(
    url: string, 
    startMeasure: number, 
    numMeasures: number, 
    signature: string,
    bpm: number,
    transposeSemitones: number = 0
  ) {
    try {
      // 1. Asegurar que el contexto de audio esté vivo
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      
      // 2. Cargar Piano si no hay nada cargado
      if (!this.currentInstrument) await this.setInstrument('acoustic_grand_piano');

      const fullUrl = this.resolveUrl(url);
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error("MIDI no encontrado");
      
      const midi = new Midi(await response.arrayBuffer());
      const [beatsPerMeasure] = signature.split('/').map(Number);
      const secondsPerBeat = 60 / bpm;

      const sectionStartTime = (startMeasure - 1) * beatsPerMeasure * secondsPerBeat;
      const sectionDuration = numMeasures * beatsPerMeasure * secondsPerBeat;

      // Un pequeño delay de seguridad para que el navegador procese el buffer
      const now = this.ctx.currentTime + 0.1;

      midi.tracks.forEach(track => {
        track.notes.forEach(note => {
          if (note.time >= sectionStartTime && note.time < (sectionStartTime + sectionDuration)) {
            const relativeTime = note.time - sectionStartTime;
            const noteName = NoteUtils.fromMidi(note.midi + transposeSemitones);

            this.currentInstrument?.play(noteName, now + relativeTime, {
              duration: note.duration,
              gain: note.velocity * 4 // Boost de volumen
            });
          }
        });
      });
    } catch (e) {
      console.error("Error en AudioEngine:", e);
    }
  }

  public stopAll() {
    if (this.currentInstrument) {
      this.currentInstrument.stop();
    }
  }

  public get currentTimer(): number {
    return this.ctx.currentTime;
  }

  // --- GETTERS ---
  public get currentTime(): number { return this.ctx.currentTime; }
  public getIsLoading() { return this.isLoading; }
}

export const audioEngine = new AudioEngine();
// apps/web/src/features/excercises/MelodicDictation/components/MelodicInputStaff.tsx
import { createEffect, onMount, onCleanup, createSignal } from 'solid-js';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';

interface Props {
  notes: { pitch: string, duration: string }[];
  onStaffClick: (pitch: string) => void;
  clef: 'treble' | 'bass';
}

export const MelodicInputStaff = (props: Props) => {
  let containerRef: HTMLDivElement | undefined;
  const [width, setWidth] = createSignal(500);

  const PITCH_MAPS = {
    treble: ["C6", "B5", "A5", "G5", "F5", "E5", "D5", "C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4", "B3", "A3"],
    bass: ["E4", "D4", "C4", "B3", "A3", "G3", "F3", "E3", "D3", "C3", "B2", "A2", "G2", "F2", "E2", "D2", "C2"]
  };

  const handleResize = () => {
    if (containerRef) {
      const newWidth = containerRef.clientWidth;
      if (newWidth > 0) setWidth(newWidth);
    }
  };

  onMount(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  });
  
  onCleanup(() => window.removeEventListener('resize', handleResize));

  const getYToPitch = (y: number) => {
    const step = 5; 
    const offset = 25; 
    const pitches = PITCH_MAPS[props.clef];
    const index = Math.floor((y - offset) / step);
    if (index < 0) return pitches[0];
    if (index >= pitches.length) return pitches[pitches.length - 1];
    return pitches[index];
  };

  const draw = () => {
    if (!containerRef) return;
    containerRef.innerHTML = '';

    const renderer = new Renderer(containerRef, Renderer.Backends.SVG);
    const currentWidth = width();
    renderer.resize(currentWidth, 160);
    const context = renderer.getContext();
    context.setStrokeStyle("var(--color-staff)");
    context.setFillStyle("var(--color-staff)");

    const stave = new Stave(10, 30, currentWidth - 20);
    stave.addClef(props.clef).addTimeSignature("4/4").setContext(context).draw();

    if (props.notes.length === 0) return;

    const staveNotes = props.notes.map(n => {
      const key = `${n.pitch.slice(0, -1).toLowerCase()}/${n.pitch.slice(-1)}`;
      const sn = new StaveNote({
        keys: [key],
        duration: n.duration,
        clef: props.clef
      });
      const accMatch = n.pitch.match(/([b#]+)/);
      if (accMatch) sn.addModifier(new Accidental(accMatch[1]), 0);
      sn.setStyle({ fillStyle: "var(--primary)", strokeStyle: "var(--primary)" });
      return sn;
    });

    const totalBeats = props.notes.reduce((acc, n) => {
      if (n.duration === 'w') return acc + 4;
      if (n.duration === 'h') return acc + 2;
      return acc + 1;
    }, 0);

    const voice = new Voice({ numBeats: Math.max(totalBeats, 4), beatValue: 4 });
    voice.setStrict(false); 
    voice.addTickables(staveNotes);

    try {
      new Formatter().joinVoices([voice]).format([voice], currentWidth - 100);
      voice.draw(context, stave);
    } catch (e) {
      console.warn("VexFlow error:", e);
    }
  };

  const handleClick = (e: MouseEvent) => {
    const rect = containerRef?.getBoundingClientRect();
    if (!rect) return;
    props.onStaffClick(getYToPitch(e.clientY - rect.top));
  };

  // --- CORRECCIÓN DE LOS ERRORES DE TYPESCRIPT ---
  createEffect(() => {
    // Invocamos los signals y props para crear la dependencia reactiva
    // sin asignarlos a variables innecesarias.
    width();
    props.notes.length; 
    props.clef;
    
    requestAnimationFrame(draw);
  });

  return (
    <div class="flex flex-col gap-2 w-full">
      <div 
        ref={containerRef} 
        onMouseDown={handleClick}
        class="w-full bg-base-100/50 cursor-crosshair rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/50 transition-colors shadow-inner min-h-[160px]" 
      />
      <div class="flex justify-between px-2 text-[9px] uppercase font-black opacity-30 tracking-widest text-base-content">
        <span>Click para escribir</span>
        <span>4/4 • {props.clef === 'treble' ? 'Sol' : 'Fa'}</span>
      </div>
    </div>
  );
};

export default MelodicInputStaff;
import { createEffect, onMount, onCleanup, createSignal } from 'solid-js';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Annotation } from 'vexflow';

interface VexStaffProps {
  notes: string[];
  targetNotes?: string[]; // Notas correctas para comparar (opcional)
  clef?: string;
  width?: number;
}

export const VexStaff = (props: VexStaffProps) => {
  let containerRef: HTMLDivElement | undefined;
  const [containerWidth, setContainerWidth] = createSignal(300);

  const handleResize = () => {
    if (containerRef) setContainerWidth(containerRef.getBoundingClientRect().width);
  };

  onMount(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  });
  onCleanup(() => window.removeEventListener('resize', handleResize));

  const renderStaff = (userNotes: string[], targetNotes?: string[]) => {
    if (!containerRef) return;
    containerRef.innerHTML = '';

    const width = containerWidth();
    const renderer = new Renderer(containerRef, Renderer.Backends.SVG);
    renderer.resize(width, 180);
    const context = renderer.getContext();
    context.setFont("Arial", 10);
    context.setFillStyle("var(--color-staff)");
    context.setStrokeStyle("var(--color-staff)");

    const hasComparison = targetNotes && targetNotes.length > 0;
    const staveWidth = hasComparison ? (width / 2) - 10 : width - 20;

    // --- COMPÁS 1: USUARIO ---
    const stave1 = new Stave(10, 40, staveWidth);
    stave1.addClef(props.clef || 'treble').setContext(context).draw();
    
    if (userNotes.length > 0) {
      const userKeys = userNotes.map(n => `${n.slice(0, -1).toLowerCase()}/${n.slice(-1)}`);
      const userNote = new StaveNote({ keys: userKeys, duration: "w" });
      
      userNotes.forEach((n, i) => {
        const acc = n.match(/([b#]+)/)?.[1];
        if (acc) userNote.addModifier(new Accidental(acc), i);
      });

      userNote.addModifier(new Annotation(hasComparison ? "TUYO" : "").setVerticalJustification(Annotation.VerticalJustify.TOP), 0);
      userNote.setStyle({ fillStyle: "var(--primary)", strokeStyle: "var(--primary)" });

      const voice1 = new Voice({ numBeats: 4, beatValue: 4 });
      voice1.addTickables([userNote]);
      new Formatter().joinVoices([voice1]).format([voice1], staveWidth - 50);
      voice1.draw(context, stave1);
    }

    // --- COMPÁS 2: CORRECTO (Solo si existe targetNotes) ---
    if (hasComparison) {
      const stave2 = new Stave(stave1.getWidth() + 10, 40, staveWidth);
      stave2.setContext(context).draw();

      const targetKeys = targetNotes.map(n => `${n.slice(0, -1).toLowerCase()}/${n.slice(-1)}`);
      const targetNote = new StaveNote({ keys: targetKeys, duration: "w" });
      
      targetNotes.forEach((n, i) => {
        const acc = n.match(/([b#]+)/)?.[1];
        if (acc) targetNote.addModifier(new Accidental(acc), i);
      });

      targetNote.addModifier(new Annotation("CORRECTO").setVerticalJustification(Annotation.VerticalJustify.TOP), 0);
      targetNote.setStyle({ fillStyle: "#06D6A0", strokeStyle: "#06D6A0" }); // Verde esmeralda para el éxito

      const voice2 = new Voice({ numBeats: 4, beatValue: 4 });
      voice2.addTickables([targetNote]);
      new Formatter().joinVoices([voice2]).format([voice2], staveWidth - 50);
      voice2.draw(context, stave2);
    }
  };

  createEffect(() => renderStaff(props.notes, props.targetNotes));

  return <div ref={containerRef} class="w-full h-full flex items-center justify-center overflow-hidden" />;
};
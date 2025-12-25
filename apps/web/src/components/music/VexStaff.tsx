import { createEffect, onMount, onCleanup, createSignal } from 'solid-js';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';

interface VexStaffProps {
  notes: string[];
  targetNotes?: string[];
  clef?: string;
}

export const VexStaff = (props: VexStaffProps) => {
  let containerRef: HTMLDivElement | undefined;
  const [themeTick, setThemeTick] = createSignal(0);

  onMount(() => {
    const observer = new MutationObserver(() => setThemeTick(t => t + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });
    onCleanup(() => observer.disconnect());
  });

  const renderStaff = (userNotes: string[], targetNotes?: string[]) => {
    if (!containerRef) return;
    containerRef.innerHTML = '';
  
    const hasComparison = targetNotes && targetNotes.length > 0;
    const logicWidth = hasComparison ? 400 : 250; 
    const logicHeight = 120;
  
    const renderer = new Renderer(containerRef, Renderer.Backends.SVG);
    const svgElement = containerRef.querySelector('svg');
    if (svgElement) {
      svgElement.setAttribute('viewBox', `0 0 ${logicWidth} ${logicHeight}`);
      svgElement.setAttribute('width', '100%');
      svgElement.setAttribute('height', '100%');
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
  
    const context = renderer.getContext();

    // Detección de color del tema
    const computedStyle = getComputedStyle(document.documentElement);
    const mainColor = computedStyle.getPropertyValue('--bc').trim() 
      ? `oklch(${computedStyle.getPropertyValue('--bc')})` 
      : computedStyle.getPropertyValue('color').trim() || "#000000";

    context.setFillStyle(mainColor);
    context.setStrokeStyle(mainColor);
  
    // --- COMPÁS 1 (Usuario) ---
    const firstMeasureWidth = hasComparison ? 190 : 240;
    const stave1 = new Stave(5, 10, firstMeasureWidth);
    stave1.setStyle({ strokeStyle: mainColor, fillStyle: mainColor });
    stave1.addClef(props.clef || 'treble').setContext(context).draw();
  
    if (userNotes.length > 0) {
      const userKeys = userNotes.map(n => `${n.slice(0, -1).toLowerCase()}/${n.slice(-1)}`);
      const userNote = new StaveNote({ keys: userKeys, duration: "w" });
      
      userNotes.forEach((n, i) => {
        const acc = n.match(/([b#]+)/)?.[1];
        if (acc) userNote.addModifier(new Accidental(acc), i);
      });
  
      userNote.setStyle({ fillStyle: mainColor, strokeStyle: mainColor });
  
      const voice1 = new Voice({ numBeats: 4, beatValue: 4 });
      voice1.addTickables([userNote]);
      new Formatter().joinVoices([voice1]).format([voice1], firstMeasureWidth - 60);
      voice1.draw(context, stave1);
    }
  
    // --- COMPÁS 2 (Correcto/Comparación) ---
    if (hasComparison) {
      const stave2 = new Stave(stave1.getX() + stave1.getWidth(), 10, 190);
      stave2.setStyle({ strokeStyle: mainColor, fillStyle: mainColor });
      stave2.setContext(context).draw();
  
      const targetKeys = targetNotes.map(n => `${n.slice(0, -1).toLowerCase()}/${n.slice(-1)}`);
      const targetNote = new StaveNote({ keys: targetKeys, duration: "w" });
      
      targetNotes.forEach((n, i) => {
        const acc = n.match(/([b#]+)/)?.[1];
        if (acc) targetNote.addModifier(new Accidental(acc), i);
      });
  
      // Color verde para la corrección
      const successColor = "#10b981"; 
      targetNote.setStyle({ fillStyle: successColor, strokeStyle: successColor });
  
      const voice2 = new Voice({ numBeats: 4, beatValue: 4 });
      voice2.addTickables([targetNote]);
      new Formatter().joinVoices([voice2]).format([voice2], 130);
      voice2.draw(context, stave2);
    }
  };

  createEffect(() => {
    themeTick(); 
    renderStaff(props.notes, props.targetNotes);
  });

  return (
    <div 
      ref={containerRef} 
      class="w-full h-full flex items-center justify-center overflow-hidden bg-transparent" 
    />
  );
};
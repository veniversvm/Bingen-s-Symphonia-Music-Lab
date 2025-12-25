import { createEffect, onMount, onCleanup, createSignal } from 'solid-js';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Annotation } from 'vexflow';

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
      attributeFilter: ['data-theme']
    });
    onCleanup(() => observer.disconnect());
  });

  const renderStaff = (userNotes: string[], targetNotes?: string[]) => {
    if (!containerRef) return;
    containerRef.innerHTML = '';
  
    const hasComparison = targetNotes && targetNotes.length > 0;
    
    // --- EL TRUCO ESTÁ AQUÍ ---
    // Reducimos el ancho lógico de 500 a 350. 
    // Al ser el "lienzo" más pequeño, el "viewBox" estirará el dibujo 
    // para que encaje en el div, haciendo que se vea mucho más grande.
    const logicWidth = hasComparison ? 400 : 250; 
    const logicHeight = 120; // Altura ajustada para que no sobre espacio arriba/abajo
  
    const renderer = new Renderer(containerRef, Renderer.Backends.SVG);
    const svgElement = containerRef.querySelector('svg');
    if (svgElement) {
      // El viewBox ahora es más "apretado", lo que causa el efecto de zoom
      svgElement.setAttribute('viewBox', `0 0 ${logicWidth} ${logicHeight}`);
      svgElement.setAttribute('width', '100%');
      svgElement.setAttribute('height', '100%');
      // Mantiene la proporción pero llena el espacio
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
  
    const context = renderer.getContext();
    const lightColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-piano-white').trim() || "#fdfcf0";
  
    context.setFillStyle(lightColor);
    context.setStrokeStyle(lightColor);
  
    // --- COMPÁS 1 ---
    // Quitamos margen de la izquierda (de 10 a 5) para ganar espacio
    const firstMeasureWidth = hasComparison ? 190 : 240;
    const stave1 = new Stave(5, 10, firstMeasureWidth);
    
    stave1.setStyle({ strokeStyle: lightColor, fillStyle: lightColor });
    stave1.addClef(props.clef || 'treble').setContext(context).draw();
  
    if (userNotes.length > 0) {
      const userKeys = userNotes.map(n => `${n.slice(0, -1).toLowerCase()}/${n.slice(-1)}`);
      const userNote = new StaveNote({ keys: userKeys, duration: "w" });
      
      userNotes.forEach((n, i) => {
        const acc = n.match(/([b#]+)/)?.[1];
        if (acc) userNote.addModifier(new Accidental(acc), i);
      });
  
      userNote.addModifier(new Annotation("TUYO").setVerticalJustification(Annotation.VerticalJustify.TOP), 0);
      userNote.setStyle({ fillStyle: lightColor, strokeStyle: lightColor });
  
      const voice1 = new Voice({ numBeats: 4, beatValue: 4 });
      voice1.addTickables([userNote]);
      // Formateo más compacto para que la nota esté centrada
      new Formatter().joinVoices([voice1]).format([voice1], firstMeasureWidth - 60);
      voice1.draw(context, stave1);
    }
  
    // --- COMPÁS 2 ---
    if (hasComparison) {
      const stave2 = new Stave(stave1.getX() + stave1.getWidth(), 10, 190);
      stave2.setStyle({ strokeStyle: lightColor, fillStyle: lightColor });
      stave2.setContext(context).draw();
  
      const targetKeys = targetNotes.map(n => `${n.slice(0, -1).toLowerCase()}/${n.slice(-1)}`);
      const targetNote = new StaveNote({ keys: targetKeys, duration: "w" });
      
      targetNotes.forEach((n, i) => {
        const acc = n.match(/([b#]+)/)?.[1];
        if (acc) targetNote.addModifier(new Accidental(acc), i);
      });
  
      targetNote.addModifier(new Annotation("OK").setVerticalJustification(Annotation.VerticalJustify.TOP), 0);
      targetNote.setStyle({ fillStyle: "#10b981", strokeStyle: "#10b981" });
  
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
      class="w-full h-full flex items-center justify-center overflow-hidden" 
    />
  );
};

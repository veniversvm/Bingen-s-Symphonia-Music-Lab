import { createEffect } from 'solid-js';
import { 
  Renderer, 
  Stave, 
  StaveNote, 
  Voice, 
  Formatter,
  Accidental 
} from 'vexflow';

interface VexStaffProps {
  notes: string[]; // Ej: ["C4", "E4", "G4"]
  clef?: 'treble' | 'bass';
  width?: number;
}

export const VexStaff = (props: VexStaffProps) => {
    let containerRef: HTMLDivElement | undefined;
    
    const renderStaff = (currentNotes: string[]) => {
      if (!containerRef) return;
      
      containerRef.innerHTML = '';
      const width = props.width || containerRef.clientWidth || 300;
      const height = 150;
  
      const renderer = new Renderer(containerRef, Renderer.Backends.SVG);
      renderer.resize(width, height);
      const context = renderer.getContext();
      
      context.setFont("Arial", 10);
      context.setFillStyle("var(--color-staff)"); 
      context.setStrokeStyle("var(--color-staff)");
  
      const stave = new Stave(10, 40, width - 20);
      stave.addClef(props.clef || 'treble');
      stave.setContext(context).draw();
  
      if (currentNotes.length > 0) {
        // Mapeo de keys para VexFlow (c/4)
        const keys = currentNotes.map(n => {
          const letter = n.slice(0, -1).toLowerCase(); 
          const octave = n.slice(-1);
          return `${letter}/${octave}`;
        });
  
        const chordNote = new StaveNote({
          keys: keys,
          duration: "w",
          clef: props.clef || "treble"
        });
  
        // --- CORRECCIÓN VISUAL: AGREGAR ALTERACIONES (# / b) ---
        currentNotes.forEach((noteName, index) => {
          // Detectar si hay # o b en el nombre de la nota (ej: "Bb4", "F#4")
          const accidental = noteName.match(/([b#]+)/)?.[1]; 
          
          if (accidental) {
            // Si existe, le decimos a VexFlow que dibuje el símbolo en esa posición
            chordNote.addModifier(new Accidental(accidental), index);
          }
        });
        // -------------------------------------------------------
  
        const primaryColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--primary').trim() || '#355C7D';
        
        chordNote.setStyle({ 
          fillStyle: primaryColor, 
          strokeStyle: primaryColor 
        });
  
        const voice = new Voice({ numBeats: 4, beatValue: 4 });
        voice.addTickables([chordNote]);
        
        new Formatter().joinVoices([voice]).format([voice], width - 50);
        voice.draw(context, stave);
      }
    };
  
    createEffect(() => {
      const notesToRender = props.notes;
      requestAnimationFrame(() => renderStaff(notesToRender));
    });
  
    return (
      <div 
        ref={containerRef} 
        class="w-full h-[150px] flex items-center justify-center overflow-hidden vexflow-container select-none"
      />
    );
  };
import { createEffect } from 'solid-js';
import { 
  Renderer, 
  Stave, 
  StaveNote, 
  Voice, 
  Formatter 
} from 'vexflow';

interface VexStaffProps {
  notes: string[]; // Ej: ["C4", "E4", "G4"]
  clef?: 'treble' | 'bass';
  width?: number;
}

export const VexStaff = (props: VexStaffProps) => {
  let containerRef: HTMLDivElement | undefined;
  
  // Modificamos la función para que reciba las notas como argumento.
  // Esto hace el flujo de datos más explícito y limpio.
  const renderStaff = (currentNotes: string[]) => {
    if (!containerRef) return;
    
    // 1. Limpiar SVG previo para evitar duplicados
    containerRef.innerHTML = '';
    
    const width = props.width || containerRef.clientWidth || 300;
    const height = 150;

    // 2. Configurar Renderer
    const renderer = new Renderer(containerRef, Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();
    
    // Estilos CSS Variables para modo oscuro
    context.setFont("Arial", 10);
    context.setFillStyle("var(--color-staff)"); 
    context.setStrokeStyle("var(--color-staff)");

    // 3. Dibujar Pentagrama
    const stave = new Stave(10, 40, width - 20);
    stave.addClef(props.clef || 'treble');
    stave.setContext(context).draw();

    // 4. Dibujar Notas
    if (currentNotes.length > 0) {
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

      // Obtener color primario del CSS
      const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary').trim() || '#355C7D';
      
      chordNote.setStyle({ 
        fillStyle: primaryColor, 
        strokeStyle: primaryColor 
      });

      // 5. Voces y Formato
      // IMPORTANTE: En VexFlow 4 usa camelCase (numBeats, beatValue)
      const voice = new Voice({ numBeats: 4, beatValue: 4 });
      voice.addTickables([chordNote]);
      
      new Formatter().joinVoices([voice]).format([voice], width - 50);
      voice.draw(context, stave);
    }
  };

  // Reactividad Fina
  createEffect(() => {
    // 1. Leemos props.notes AQUÍ. Solid registra que este efecto depende de 'notes'.
    const notesToRender = props.notes;

    // 2. Usamos requestAnimationFrame para asegurar que el DOM esté listo
    requestAnimationFrame(() => {
      // 3. Pasamos la variable a la función. 
      // Al usar 'notesToRender', TypeScript ya no da error de "unused variable".
      renderStaff(notesToRender);
    });
  });

  return (
    <div 
      ref={containerRef} 
      class="w-full h-[150px] flex items-center justify-center overflow-hidden vexflow-container select-none"
    />
  );
};
import { createEffect, onMount, onCleanup, createSignal } from 'solid-js';
import { 
  Renderer, 
  Stave, 
  StaveNote, 
  Voice, 
  Formatter, 
  StaveConnector, 
  Accidental 
} from 'vexflow';
import { type MelodicExercise } from "@bingens/core";

export const VexGrandStaff = (props: { exercise: MelodicExercise }) => {
  let containerRef: HTMLDivElement | undefined;
  const [width, setWidth] = createSignal(800);

  const handleResize = () => {
    if (containerRef) setWidth(containerRef.clientWidth);
  };

  onMount(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  });
  
  onCleanup(() => window.removeEventListener('resize', handleResize));

  const renderScore = () => {
    if (!containerRef || !props.exercise) return;
    
    // Limpiar contenido previo
    containerRef.innerHTML = '';

    const renderer = new Renderer(containerRef, Renderer.Backends.SVG);
    const currentWidth = width();
    renderer.resize(currentWidth, 320);
    
    const context = renderer.getContext();
    context.setFillStyle("var(--color-staff)");
    context.setStrokeStyle("var(--color-staff)");

    // 1. Crear Pentagramas (Sistemas)
    const topStave = new Stave(40, 40, currentWidth - 60);
    const bottomStave = new Stave(40, 160, currentWidth - 60);

    // Sincronización con el Core: originalKey y timeSignature
    topStave.addClef("treble")
            .addKeySignature(props.exercise.originalKey)
            .addTimeSignature(props.exercise.timeSignature);
            
    bottomStave.addClef("bass")
               .addKeySignature(props.exercise.originalKey)
               .addTimeSignature(props.exercise.timeSignature);

    // Conector de llave (Brace) para unir los dos pentagramas
    const connector = new StaveConnector(topStave, bottomStave);
    connector.setType(StaveConnector.type.BRACE).setContext(context).draw();

    topStave.setContext(context).draw();
    bottomStave.setContext(context).draw();

    // 2. Preparar Voces
    // Sincronización con el Core: totalMeasures
    const totalBeats = props.exercise.totalMeasures * 4;
    const createVoice = () => new Voice({ numBeats: totalBeats, beatValue: 4 }).setStrict(false);

    const vSoprano = createVoice(); 
    const vAlto = createVoice();
    const vTenor = createVoice(); 
    const vBass = createVoice();

    // 3. Mapear Notas (Sincronizado con JSON: step.n y step.d)
    const numVoices = props.exercise.numVoices;

    props.exercise.steps.forEach(step => {
      // "1" -> w (redonda), "2" -> h (blanca)
      const duration = step.d === "1" ? "w" : "h";
      const notes = step.n;

      if (numVoices === 4) {
        vSoprano.addTickable(createStaveNote(notes[3], duration, 1));
        vAlto.addTickable(createStaveNote(notes[2], duration, -1));
        vTenor.addTickable(createStaveNote(notes[1], duration, 1));
        vBass.addTickable(createStaveNote(notes[0], duration, -1));
      } else if (numVoices === 3) {
        vSoprano.addTickable(createStaveNote(notes[2], duration, 1));
        vAlto.addTickable(createStaveNote(notes[1], duration, -1));
        vBass.addTickable(createStaveNote(notes[0], duration, -1));
      } else if (numVoices === 2) {
        vSoprano.addTickable(createStaveNote(notes[1], duration, 1));
        vBass.addTickable(createStaveNote(notes[0], duration, -1));
      }
    });

    // 4. Formatear y Unir voces
    const formatter = new Formatter();
    
    // Filtramos las voces que realmente tienen notas según numVoices
    const activeTopVoices = [vSoprano];
    if (numVoices >= 3) activeTopVoices.push(vAlto);
    
    const activeBottomVoices = [vBass];
    if (numVoices === 4) activeBottomVoices.push(vTenor);

    formatter.joinVoices(activeTopVoices)
             .joinVoices(activeBottomVoices)
             .format([...activeTopVoices, ...activeBottomVoices], currentWidth - 150);

    // 5. Dibujar en los pentagramas correspondientes
    vSoprano.draw(context, topStave);
    if (numVoices >= 3) vAlto.draw(context, topStave);
    if (numVoices === 4) vTenor.draw(context, bottomStave);
    vBass.draw(context, bottomStave);
  };

  // Helper para crear notas (Maneja el formato c/4 y alteraciones)
  const createStaveNote = (noteName: string, duration: string, stem: number) => {
    // Convertimos "C#4" a "c#/4"
    const key = `${noteName.slice(0, -1).toLowerCase()}/${noteName.slice(-1)}`;
    const sn = new StaveNote({ keys: [key], duration, stemDirection: stem });
    
    // Si la nota tiene # o b, añadimos el Accidental
    const accMatch = noteName.match(/([b#]+)/);
    if (accMatch) {
      sn.addModifier(new Accidental(accMatch[1]), 0);
    }
    
    return sn;
  };

  // Efecto reactivo para redibujar
  createEffect(() => {
    renderScore();
  });

  return (
    <div 
      ref={containerRef} 
      class="w-full h-full min-h-[320px] flex items-center justify-center bg-transparent" 
    />
  );
};

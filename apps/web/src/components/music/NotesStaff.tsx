import { createEffect } from "solid-js";
import {
  Renderer,
  Stave,
  StaveNote,
  Accidental,
  Voice,
  Formatter,
} from "vexflow";

export const NoteStaff = (props: { note: string; clef: "treble" | "bass" }) => {
  let containerRef: HTMLDivElement | undefined;

  const draw = () => {
    if (!containerRef || !props.note) return;
    containerRef.innerHTML = "";

    const renderer = new Renderer(containerRef, Renderer.Backends.SVG);
    renderer.resize(200, 150);
    const context = renderer.getContext();

    // Usamos las variables de tu paleta de colores
    context.setStrokeStyle("var(--color-staff)");
    context.setFillStyle("var(--color-staff)");

    const stave = new Stave(10, 20, 180);
    stave.addClef(props.clef).setContext(context).draw();

    // Vexflow espera "c/4" en lugar de "C4"
    const key = `${props.note.slice(0, -1).toLowerCase()}/${props.note.slice(-1)}`;
    const note = new StaveNote({
      keys: [key],
      duration: "q",
      clef: props.clef,
    });

    // Manejo de alteraciones (#, b)
    const accMatch = props.note.match(/[#b]+/);
    if (accMatch) {
      note.addModifier(new Accidental(accMatch[0]), 0);
    }

    // Color de la nota (Primario)
    note.setStyle({
      fillStyle: "var(--primary)",
      strokeStyle: "var(--primary)",
    });

    // --- CORRECCIÓN: Usar importaciones directas en lugar de require ---
    // Nota: Vexflow 5 usa camelCase (numBeats, beatValue)
    const voice = new Voice({ numBeats: 1, beatValue: 4 });
    voice.addTickables([note]);

    new Formatter().joinVoices([voice]).format([voice], 100);

    voice.draw(context, stave);
  };

  // Redibujar automáticamente cuando cambie la nota o la clave
  createEffect(() => {
    // Accedemos a las props para que Solid registre la dependencia
    // const _n = props.note;
    // const _c = props.clef;
    draw();
  });

  return (
    <div
      ref={containerRef}
      class="flex justify-center bg-base-100/50 rounded-xl border border-base-content/5"
    />
  );
};

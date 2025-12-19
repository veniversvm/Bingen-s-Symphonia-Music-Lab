import { createEffect, onMount, onCleanup, createSignal } from "solid-js";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Accidental,
} from "vexflow";

export const VexStaff = (props: { notes: string[]; clef?: string }) => {
  let containerRef: HTMLDivElement | undefined;
  const [width, setWidth] = createSignal(300);

  // Observador para redimensionar el pentagrama dinámicamente
  const handleResize = () => {
    if (containerRef) {
      // Tomamos el ancho real del div, restando padding
      const newWidth = containerRef.getBoundingClientRect().width;
      if (newWidth > 50) setWidth(newWidth);
    }
  };

  onMount(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
  });

  onCleanup(() => window.removeEventListener("resize", handleResize));

  const renderStaff = (currentNotes: string[], currentWidth: number) => {
    if (!containerRef) return;
    containerRef.innerHTML = "";

    const renderer = new Renderer(containerRef, Renderer.Backends.SVG);
    // Altura fija para que no salte el layout, ancho dinámico
    renderer.resize(currentWidth, 150);
    const context = renderer.getContext();

    // Escalar un poco el dibujo en pantallas grandes para legibilidad
    const scale = currentWidth > 600 ? 1.2 : 1.0;
    context.scale(scale, scale);

    context.setFont("Arial", 10);
    context.setFillStyle("var(--color-staff)");
    context.setStrokeStyle("var(--color-staff)");

    // Ajustar posición del Stave según la escala
    const staveWidth = currentWidth / scale - 20;
    const stave = new Stave(10, 20, staveWidth);
    stave.addClef(props.clef || "treble");
    stave.setContext(context).draw();

    if (currentNotes.length > 0) {
      const keys = currentNotes.map(
        (n) => `${n.slice(0, -1).toLowerCase()}/${n.slice(-1)}`
      );
      const chordNote = new StaveNote({
        keys,
        duration: "w",
        clef: props.clef || "treble",
      });

      currentNotes.forEach((noteName, index) => {
        const accidental = noteName.match(/([b#]+)/)?.[1];
        if (accidental)
          chordNote.addModifier(new Accidental(accidental), index);
      });

      const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim();
      chordNote.setStyle({
        fillStyle: primaryColor,
        strokeStyle: primaryColor,
      });

      const voice = new Voice({ numBeats: 4, beatValue: 4 });
      voice.addTickables([chordNote]);

      new Formatter().joinVoices([voice]).format([voice], staveWidth - 50);
      voice.draw(context, stave);
    }
  };

  createEffect(() => renderStaff(props.notes, width()));

  return (
    <div
      ref={containerRef}
      class="w-full h-[160px] flex items-center justify-center overflow-hidden transition-all"
    />
  );
};

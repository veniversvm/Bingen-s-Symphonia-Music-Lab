// apps/web/src/features/excercises/MelodicDictation/melodicLoader.ts
import type { MelodicExercise } from "@bingens/core";

export const fetchExerciseDirectory = async (measures: number): Promise<MelodicExercise[]> => {
  // En GitHub Pages, import.meta.env.VITE_BASE_PATH es "/Bingen-s-Symphonia-Music-Lab/"
  const baseUrl = import.meta.env.VITE_BASE_PATH || "/";
  const url = `${baseUrl}assets/midis/${measures}/directory.json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Archivo no encontrado");
    
    const data = await response.json();
    
    // Mapeamos para que la URL del MIDI sea completa
    return data.map((ex: MelodicExercise) => ({
      ...ex,
      // Construimos la ruta real al archivo .mid
      midiPath: `assets/midis/${measures}/${ex.filename}` 
    }));
  } catch (error) {
    console.error("Error cargando el directorio melódico:", error);
    return [];
  }
};
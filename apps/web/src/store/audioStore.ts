import { createSignal } from "solid-js";

// El volumen va de 0 a 1. El default es 0.7 (70%)
const savedVolume = localStorage.getItem("bsml_volume");
const initialVolume = savedVolume ? parseFloat(savedVolume) : 0.7;

export const [globalVolume, setGlobalVolume] = createSignal(initialVolume);

// Guardar en el almacenamiento local cuando cambie
export const updateGlobalVolume = (val: number) => {
  setGlobalVolume(val);
  localStorage.setItem("bsml_volume", val.toString());
};
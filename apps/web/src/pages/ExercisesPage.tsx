import type { ParentComponent } from 'solid-js';

// Este componente ahora es solo el CONTENEDOR de la sección
const ExercisesPage: ParentComponent = (props) => {
  return (
    <div class="exercises-layout w-full h-full">
      {/* 
        Aquí renderizamos la sub-ruta correspondiente:
        - Si la ruta es /exercises -> Renderiza ExercisesHome
        - Si es /exercises/chord-construction -> Renderiza el Juego
      */}
      {props.children}
    </div>
  );
};

export default ExercisesPage;
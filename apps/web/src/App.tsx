import { createSignal, createEffect } from 'solid-js';
import { APP_NAME } from '@bingens/core';

function App() {
  // Estado del tema
  const [isDark, setIsDark] = createSignal(false);

  // Efecto para cambiar el atributo en el HTML
  createEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark() ? 'dark' : 'light');
  });

  return (
    // Contenedor principal centrado
    <div class="min-h-screen flex flex-col items-center justify-center gap-8 p-4 transition-colors duration-300">
      
      {/* Título: Debería verse elegante (Merriweather) */}
      <div class="text-center space-y-2">
        <h1 class="text-5xl font-serif font-bold text-primary">
          {APP_NAME}
        </h1>
        <p class="text-lg opacity-80">Prueba de Sistema de Diseño</p>
      </div>

      {/* Tarjeta Simple de DaisyUI */}
      <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title font-serif text-2xl">Hola, Músico</h2>
          <p>Esta tarjeta prueba la superficie y el contraste del texto.</p>
          
          {/* Muestrario de Colores de la Paleta */}
          <div class="my-4 space-y-2">
            <p class="text-xs uppercase font-bold opacity-50">Paleta Actual:</p>
            <div class="flex gap-4">
              <div class="flex flex-col items-center gap-1">
                <div class="w-10 h-10 rounded-full bg-primary shadow-sm"></div>
                <span class="text-xs">Prim</span>
              </div>
              <div class="flex flex-col items-center gap-1">
                <div class="w-10 h-10 rounded-full bg-secondary shadow-sm"></div>
                <span class="text-xs">Sec</span>
              </div>
              <div class="flex flex-col items-center gap-1">
                <div class="w-10 h-10 rounded-full bg-accent shadow-sm"></div>
                <span class="text-xs">Accent</span>
              </div>
              <div class="flex flex-col items-center gap-1">
                <div class="w-10 h-10 rounded-full bg-neutral shadow-sm"></div>
                <span class="text-xs">Neut</span>
              </div>
            </div>
          </div>

          <div class="card-actions justify-end mt-2">
            <button class="btn btn-primary">Botón Acción</button>
            <button class="btn btn-ghost">Cancelar</button>
          </div>
        </div>
      </div>

      {/* Botón Toggle Manual */}
      <button 
        class="btn btn-outline gap-2"
        onClick={() => setIsDark(!isDark())}
      >
        {isDark() ? '☀️ Cambiar a Modo Claro' : '🌙 Cambiar a Modo Oscuro'}
      </button>

    </div>
  );
}

export default App;
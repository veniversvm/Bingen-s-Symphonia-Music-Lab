import { A } from '@solidjs/router'; // <--- IMPORTANTE

export default function ExercisesHome() {
  return (
    <div class="space-y-6">
      <div class="prose">
        <h1 class="font-serif text-3xl">Sala de Práctica</h1>
        <p class="text-base-content/70">Selecciona un reto para comenzar a entrenar tu oído.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* TARJETA DE ACORDES */}
        <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all border-l-4 border-secondary">
          <div class="card-body">
            <h3 class="card-title font-serif">Dictado de Acordes</h3>
            <p class="text-sm opacity-70">Mayor, Menor, Aumentado y Disminuido.</p>
            
            <div class="card-actions justify-end mt-4">
              {/* USAR <A> EN LUGAR DE <BUTTON> */}
              <A 
                href="/exercises/chord-construction" 
                class="btn btn-sm btn-secondary text-secondary-content"
              >
                Iniciar
              </A>
            </div>
          </div>
        </div>

        {/* MÁS TARJETAS (Futuras) */}
        <div class="card bg-base-100/50 border border-dashed border-base-content/20">
          <div class="card-body items-center justify-center text-center opacity-50">
            <p>Próximamente: Dictado Melódico</p>
          </div>
        </div>

      </div>
    </div>
  );
}
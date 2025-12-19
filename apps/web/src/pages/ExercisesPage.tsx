export default function ExercisesHome() {
    return (
      <div class="space-y-6">
        <div class="prose">
          <h1 class="font-serif">Sala de Práctica</h1>
          <p>Selecciona un reto para comenzar a entrenar tu oído.</p>
        </div>
  
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Placeholder Card */}
          <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all cursor-pointer border-l-4 border-secondary">
            <div class="card-body">
              <h3 class="card-title font-serif">Construcción de Acordes</h3>
              <p class="text-sm opacity-70">Mayor, Menor, Aumentado y Disminuido.</p>
              <div class="card-actions justify-end mt-2">
                <button class="btn btn-sm btn-secondary">Iniciar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
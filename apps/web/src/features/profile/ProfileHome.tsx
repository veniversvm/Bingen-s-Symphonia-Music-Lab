export default function ProfileHome() {
    return (
      <div class="space-y-6">
        <div class="flex items-center gap-4">
          <div class="avatar placeholder">
            <div class="bg-neutral text-neutral-content rounded-full w-16">
              <span class="text-xl">ME</span>
            </div>
          </div>
          <div>
            <h2 class="text-2xl font-serif font-bold">Estudiante</h2>
            <div class="badge badge-primary">Nivel 1</div>
          </div>
        </div>
  
        <div class="stats shadow w-full bg-base-100">
          <div class="stat">
            <div class="stat-title">Ejercicios</div>
            <div class="stat-value text-primary">0</div>
            <div class="stat-desc">Completados hoy</div>
          </div>
          <div class="stat">
            <div class="stat-title">ELO</div>
            <div class="stat-value text-secondary">800</div>
            <div class="stat-desc">Principiante</div>
          </div>
        </div>
      </div>
    );
  }
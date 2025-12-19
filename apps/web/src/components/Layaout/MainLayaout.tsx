import type { ParentComponent } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { Music, BookOpen, User } from 'lucide-solid';
import { APP_NAME } from '@bingens/core';

export const MainLayout: ParentComponent = (props) => {
  return (
    <div class="flex flex-col min-h-screen bg-base-200 transition-colors duration-300">
      
      {/* 1. TOP NAVBAR (Marca y Config) */}
      <header class="navbar bg-base-100 shadow-sm z-10 sticky top-0 px-4">
        <div class="flex-1">
          <span class="font-serif text-xl font-bold text-primary tracking-wide">
            {APP_NAME}
          </span>
        </div>
        <div class="flex-none">
          {/* Aquí irá el Toggle de Tema luego */}
          <button class="btn btn-ghost btn-circle btn-sm">
             <div class="w-5 h-5 bg-primary rounded-full"></div> 
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTENT (Scrollable) */}
      <main class="flex-grow p-4 pb-24 max-w-5xl w-full mx-auto">
        {props.children}
      </main>

      {/* 3. BOTTOM NAVIGATION (Mobile First) */}
      <nav class="btm-nav btm-nav-md bg-base-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 md:hidden">
        <NavButton href="/exercises" icon={Music} label="Práctica" />
        <NavButton href="/theory" icon={BookOpen} label="Teoría" />
        <NavButton href="/profile" icon={User} label="Perfil" />
      </nav>

      {/* SIDEBAR NAVIGATION (Desktop Only - Opcional para luego) */}
      {/* En desktop podríamos ocultar el bottom nav y mostrar un sidebar */}
    </div>
  );
};

// Componente auxiliar para los botones de navegación
const NavButton = (props: { href: string; icon: any; label: string }) => {
  const location = useLocation();
  // Verificamos si la ruta actual empieza con el href
  const isActive = () => location.pathname.startsWith(props.href) || (props.href === '/exercises' && location.pathname === '/');

  return (
    <A 
      href={props.href} 
      class={`${isActive() ? 'active text-primary bg-primary/10' : 'text-base-content/60'} transition-all`}
    >
      <props.icon size={24} />
      <span class="text-xs font-semibold">{props.label}</span>
    </A>
  );
};
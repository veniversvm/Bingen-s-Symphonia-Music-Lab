import { createSignal, createEffect, type ParentComponent, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { 
  Music, 
  BookOpen, 
  User, 
  Languages, 
  Sun, 
  Moon, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Home,
  Info,
} from "lucide-solid";
import { useI18n, setLanguage, currentLang } from "../../i18n";
import { VolumeControl } from "../ui/VolumenControl";

export const MainLayout: ParentComponent = (props) => {
  const [t] = useI18n();
  // const location = useLocation();
  
  // --- ESTADO DE TEMA Y SIDEBAR ---
  const [theme, setTheme] = createSignal(localStorage.getItem("theme") || "dark");
  const [isCollapsed, setIsCollapsed] = createSignal(false);

  // Sincronizar tema con el HTML y LocalStorage
  createEffect(() => {
    document.documentElement.setAttribute("data-theme", theme());
    localStorage.setItem("theme", theme());
  });

  // Lista de navegación centralizada
  const navLinks = () => [
    { href: "/exercises", label: t("nav.practice"), icon: Music },
    { href: "/theory", label: t("nav.theory"), icon: BookOpen },
    { href: "/about", label: t("nav.about"), icon: Info },
    { href: "/profile", label: t("nav.profile"), icon: User },
  ];

  return (
    // 'md:drawer-open' mantiene el sidebar visible en pantallas grandes (>768px)
    <div class="drawer md:drawer-open">
      <input id="my-drawer" type="checkbox" class="drawer-toggle" />
      
      <div class="drawer-content flex flex-col min-h-screen bg-base-200 transition-colors duration-300">
        
        {/* --- 1. HEADER MÓVIL (Solo visible < 768px) --- */}
        <header class="navbar bg-base-100 border-b border-base-content/5 md:hidden sticky top-0 z-30 px-4 shadow-sm">
          <div class="flex-none">
            <label for="my-drawer" class="btn btn-ghost btn-circle drawer-button">
              <Menu size={24} />
            </label>
          </div>
          <div class="flex-1 px-2 font-serif font-black text-primary uppercase tracking-tighter text-lg">
            B's Symphonia
          </div>
          <div class="flex-none">
            <VolumeControl />
          </div>
        </header>

        {/* --- 2. ÁREA DE CONTENIDO PRINCIPAL (EL FIX DEL SCROLL) --- */}
        <main 
          class="flex-1 flex flex-col min-w-0 overflow-x-auto no-scrollbar"
        >
          {/* 
              Contenedor de ancho máximo para el monitor de 24". 
              'p-4 md:p-10' da el aire necesario.
          */}
          <div class="flex-1 w-full max-w-7xl mx-auto p-4 md:p-10 animate-fade-in">
            {props.children}
          </div>
        </main>

        {/* --- 3. BOTTOM NAV (Solo Móvil para acceso rápido) --- */}
        <nav class="btm-nav btm-nav-sm md:hidden bg-base-100 border-t border-base-content/10 z-20">
          <For each={navLinks().slice(0,3)}>{(link) => (
            <A href={link.href} activeClass="active text-primary bg-primary/5">
              <link.icon size={20} />
            </A>
          )}</For>
        </nav>
      </div> 

      {/* --- 4. SIDEBAR / DRAWER SIDE --- */}
      <div class="drawer-side z-40">
        <label for="my-drawer" class="drawer-overlay"></label>
        
        <aside 
          class="bg-base-100 min-h-full flex flex-col border-r border-base-content/10 transition-all duration-300 ease-in-out relative"
          style={{ width: isCollapsed() ? "80px" : "280px" }}
        >
          {/* Botón de Colapso (Solo Desktop) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed())}
            class="hidden md:flex btn btn-circle btn-xs absolute -right-3 top-10 z-50 border border-base-content/10 bg-base-100 hover:bg-primary hover:text-primary-content transition-transform active:scale-90"
          >
            {isCollapsed() ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* ÁREA DEL LOGO */}
          <div class="mb-10 p-6 overflow-hidden">
            <A href="/" class="flex items-center gap-3 no-underline group">
              <div class="bg-primary text-primary-content p-2 rounded-xl shadow-lg group-hover:rotate-12 transition-transform shrink-0">
                <Home size={24} />
              </div>
              {!isCollapsed() && (
                <div class="flex flex-col animate-in fade-in duration-500 overflow-hidden">
                  <span class="font-serif font-black text-xl text-base-content leading-none whitespace-nowrap">Bingen's</span>
                  <span class="text-secondary italic text-sm leading-none mt-1">Symphonia</span>
                </div>
              )}
            </A>
          </div>

          {/* NAVEGACIÓN PRINCIPAL */}
          <nav class="flex-grow px-4">
            <ul class="menu p-0 gap-2 font-serif">
              <For each={navLinks()}>{(item) => (
                <li>
                  <A href={item.href} 
                     class="flex gap-4 p-4 rounded-2xl font-bold transition-all items-center hover:bg-base-200"
                     activeClass="bg-primary text-primary-content shadow-lg shadow-primary/20"
                     classList={{ "justify-center": isCollapsed() }}
                     onClick={() => {
                        // Cerrar drawer al hacer click en móviles
                        if (window.innerWidth < 768) {
                          const drawer = document.getElementById("my-drawer") as HTMLInputElement;
                          if (drawer) drawer.checked = false;
                        }
                     }}
                  >
                    <item.icon size={22} class="shrink-0" />
                    {!isCollapsed() && (
                      <span class="text-base overflow-hidden text-ellipsis whitespace-nowrap animate-in slide-in-from-left-2">
                        {item.label as string}
                      </span>
                    )}
                  </A>
                </li>
              )}</For>
            </ul>
          </nav>

          {/* FOOTER DEL SIDEBAR: Controles Globales */}
          <div class="p-4 mt-auto">
            <div 
              class="flex bg-base-200/50 rounded-2xl border border-base-content/5 transition-all duration-300"
              classList={{
                "flex-col items-center gap-4 py-4": isCollapsed(),
                "flex-row justify-between p-2": !isCollapsed()
              }}
            >
              {/* Toggle de Tema */}
              <button 
                class="btn btn-ghost btn-circle btn-sm" 
                onClick={() => setTheme(theme() === "light" ? "dark" : "light")}
              >
                {theme() === "light" ? <Moon size={18} /> : <Sun size={18} class="text-yellow-400" />}
              </button>

              {/* Volumen (Oculto si está colapsado) */}
              <Show when={!isCollapsed()}>
                <VolumeControl />
              </Show>

              {/* Selector de Idioma */}
              <button 
                class="btn btn-ghost btn-sm gap-2 font-bold px-2" 
                onClick={() => setLanguage(currentLang() === "es" ? "en" : "es")}
              >
                <Languages size={18} />
                {!isCollapsed() && <span class="uppercase text-xs font-black">{currentLang()}</span>}
              </button>
            </div>
            
            {/* Volumen centralizado si está colapsado */}
            <Show when={isCollapsed()}>
              <div class="flex justify-center mt-4 animate-in fade-in">
                 <VolumeControl />
              </div>
            </Show>
          </div>
        </aside>
      </div>
    </div>
  );
};
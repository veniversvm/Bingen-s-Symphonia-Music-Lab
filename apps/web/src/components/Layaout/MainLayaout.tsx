import { createSignal, createEffect, type ParentComponent, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { Music, BookOpen, User, Languages, Sun, Moon, Menu, ChevronLeft, ChevronRight, Home } from "lucide-solid";
import { useI18n, setLanguage, currentLang } from "../../i18n";
import { VolumeControl } from "../ui/VolumenControl";

export const MainLayout: ParentComponent = (props) => {
  const [t] = useI18n();
  // const location = useLocation();
  const [theme, setTheme] = createSignal(localStorage.getItem("theme") || "dark");
  const [isCollapsed, setIsCollapsed] = createSignal(false);

  createEffect(() => {
    document.documentElement.setAttribute("data-theme", theme());
    localStorage.setItem("theme", theme());
  });

  const navLinks = () => [
    { href: "/exercises", label: t("nav.practice"), icon: Music },
    { href: "/theory", label: t("nav.theory"), icon: BookOpen },
    { href: "/profile", label: t("nav.profile"), icon: User },
  ];

  return (
    <div class="drawer md:drawer-open">
      <input id="my-drawer" type="checkbox" class="drawer-toggle" />
      
      <div class="drawer-content flex flex-col bg-base-200 min-h-screen transition-all duration-300">
        
        {/* --- HEADER MÓVIL --- */}
        <header class="navbar bg-base-100 border-b border-base-content/5 md:hidden sticky top-0 z-10 px-4">
          <div class="flex-none">
            <label for="my-drawer" class="btn btn-ghost btn-circle drawer-button">
              <Menu size={24} />
            </label>
          </div>
          <div class="flex-1 px-2 font-serif font-black text-primary uppercase tracking-tighter">
            B's Symphonia
          </div>
          <div class="flex-none">
            <VolumeControl />
          </div>
        </header>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <main class="p-4 md:p-10 max-w-7xl w-full mx-auto animate-fade-in">
          {props.children}
        </main>
      </div> 

      {/* --- SIDEBAR (Escritorio) / DRAWER (Móvil) --- */}
      <div class="drawer-side z-30">
        <label for="my-drawer" class="drawer-overlay"></label>
        
        <aside 
          class="bg-base-100 min-h-full flex flex-col border-r border-base-content/10 transition-all duration-300 ease-in-out relative"
          style={{ width: isCollapsed() ? "80px" : "280px" }}
        >
          {/* Botón para colapsar (Solo visible en escritorio) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed())}
            class="hidden md:flex btn btn-circle btn-xs absolute -right-3 top-10 z-30 border border-base-content/10 bg-base-100 hover:bg-primary hover:text-primary-content transition-transform active:scale-90"
          >
            {isCollapsed() ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* LOGO AREA */}
          <div class="mb-10 p-6 overflow-hidden">
            <A href="/" class="flex items-center gap-3 no-underline group">
              <div class="bg-primary text-primary-content p-2 rounded-xl shadow-lg group-hover:rotate-12 transition-transform">
                <Home size={24} />
              </div>
              {!isCollapsed() && (
                <div class="flex flex-col animate-in fade-in duration-500">
                  <span class="font-serif font-black text-xl text-base-content leading-none">Bingen's</span>
                  <span class="text-secondary italic text-sm">Symphonia</span>
                </div>
              )}
            </A>
          </div>

          {/* NAVEGACIÓN PRINCIPAL */}
          <nav class="flex-grow px-4">
            <ul class="menu p-0 gap-2">
              <For each={navLinks()}>{(item) => (
                <li>
                  <A href={item.href} 
                     class="flex gap-4 p-4 rounded-2xl font-bold transition-all items-center hover:bg-base-200"
                     activeClass="bg-primary text-primary-content shadow-lg shadow-primary/20"
                     classList={{ "justify-center": isCollapsed() }}
                     onClick={() => {
                        if (window.innerWidth < 768) {
                          (document.getElementById("my-drawer") as HTMLInputElement).checked = false;
                        }
                     }}
                  >
                    <item.icon size={22} class="shrink-0" />
                    {!isCollapsed() && (
                      <span class="text-lg overflow-hidden text-ellipsis whitespace-nowrap animate-in slide-in-from-left-2">
                        {item.label as string}
                      </span>
                    )}
                  </A>
                </li>
              )}</For>
            </ul>
          </nav>

          {/* FOOTER DEL SIDEBAR: Tema, Idioma y Volumen */}
          <div class="p-4 mt-auto">
            <div 
              class="flex bg-base-200/50 rounded-2xl border border-base-content/5 transition-all duration-300"
              classList={{
                "flex-col items-center gap-4 py-4": isCollapsed(),
                "flex-row justify-between p-2": !isCollapsed()
              }}
            >
              <button 
                class="btn btn-ghost btn-circle btn-sm" 
                onClick={() => setTheme(theme() === "light" ? "dark" : "light")}
                title={theme() === "light" ? "Modo Oscuro" : "Modo Claro"}
              >
                {theme() === "light" ? <Moon size={18} /> : <Sun size={18} class="text-yellow-400" />}
              </button>

              <Show when={!isCollapsed()}>
                <VolumeControl />
              </Show>

              <button 
                class="btn btn-ghost btn-sm gap-2 font-bold px-2" 
                onClick={() => setLanguage(currentLang() === "es" ? "en" : "es")}
              >
                <Languages size={18} />
                {!isCollapsed() && <span class="uppercase text-xs">{currentLang()}</span>}
              </button>
            </div>
            
            {isCollapsed() && (
              <div class="flex justify-center mt-4">
                 <VolumeControl />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
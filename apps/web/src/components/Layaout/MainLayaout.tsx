import { createSignal, createEffect, type ParentComponent, For } from "solid-js";
import { A } from "@solidjs/router";
import { Music, BookOpen, User, Languages, Sun, Moon, Menu, ChevronLeft, ChevronRight } from "lucide-solid";
import { useI18n, setLanguage, currentLang } from "../../i18n";

export const MainLayout: ParentComponent = (props) => {
  const [t] = useI18n();
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
      
      <div class="drawer-content flex flex-col bg-base-200 min-h-screen">
        <header class="navbar bg-base-100 border-b border-base-content/5 md:hidden sticky top-0 z-10">
          <div class="flex-none">
            <label for="my-drawer" class="btn btn-ghost drawer-button">
              <Menu size={24} />
            </label>
          </div>
          <div class="flex-1 px-2 font-serif font-black text-primary uppercase tracking-tighter">B's Symphonia</div>
        </header>

        <main class="p-4 md:p-10 max-w-5xl w-full mx-auto">
          {props.children}
        </main>
      </div> 

      <div class="drawer-side z-20">
        <label for="my-drawer" class="drawer-overlay"></label>
        
        {/* CORRECCIÓN: Un solo atributo 'class' combinado */}
        <aside 
          class={`bg-base-100 min-h-full flex flex-col border-r border-base-content/10 transition-all duration-300 ease-in-out relative ${
            isCollapsed() ? "w-20 p-4" : "w-72 p-6"
          }`}
        >
          <button 
            onClick={() => setIsCollapsed(!isCollapsed())}
            class="hidden md:flex btn btn-circle btn-xs absolute -right-3 top-10 z-30 border border-base-content/10 bg-base-100 hover:bg-primary hover:text-primary-content transition-transform active:scale-90"
          >
            {isCollapsed() ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div class="mb-10 px-2 overflow-hidden whitespace-nowrap">
            <A href="/" class="font-serif font-black text-primary leading-tight no-underline block">
              <span class="text-2xl">B</span>
              {!isCollapsed() && <span>ingen's<br/><span class="text-secondary italic">Symphonia</span></span>}
            </A>
          </div>

          <nav class="flex-grow">
            <ul class="menu p-0 gap-3">
              <For each={navLinks()}>{(item) => (
                <li>
                  <A href={item.href} 
                     class={`flex gap-4 p-4 rounded-2xl font-bold transition-all items-center ${isCollapsed() ? "justify-center" : ""}`}
                     activeClass="bg-primary text-primary-content shadow-lg shadow-primary/20"
                     onClick={() => {
                        if (window.innerWidth < 768) {
                          (document.getElementById("my-drawer") as HTMLInputElement).checked = false;
                        }
                     }}
                  >
                    <item.icon size={22} class="shrink-0" />
                    {!isCollapsed() && <span class="text-lg overflow-hidden text-ellipsis whitespace-nowrap">{item.label as string}</span>}
                  </A>
                </li>
              )}</For>
            </ul>
          </nav>

          {/* CORRECCIÓN: Un solo atributo 'class' combinado en el footer */}
          <div 
            class={`flex bg-base-200/50 rounded-2xl border border-base-content/5 mt-auto transition-all ${
              isCollapsed() ? "flex-col items-center gap-2 p-2" : "flex-row justify-between p-2"
            }`}
          >
            <button class="btn btn-ghost btn-circle btn-sm" onClick={() => setTheme(theme() === "light" ? "dark" : "light")}>
              {theme() === "light" ? <Moon size={18} /> : <Sun size={18} class="text-yellow-400" />}
            </button>
            <button class="btn btn-ghost btn-sm gap-2 font-bold" onClick={() => setLanguage(currentLang() === "es" ? "en" : "es")}>
              <Languages size={18} />
              {!isCollapsed() && <span class="uppercase text-xs">{currentLang()}</span>}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
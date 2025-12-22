import { type ParentComponent } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { Music, BookOpen, User, Languages } from "lucide-solid";
import { useI18n, setLanguage, currentLang } from "../../i18n"; // Importar i18n

export const MainLayout: ParentComponent = (props) => {
  const [t] = useI18n(); // Hook de traducción

  const toggleLang = () => {
    setLanguage(currentLang() === "es" ? "en" : "es");
  };

  return (
    <div class="flex flex-col min-h-screen bg-base-200 transition-colors duration-300">
      {/* 1. TOP HEADER (Adaptive) */}
      <header class="navbar bg-base-100 shadow-sm z-20 sticky top-0 px-4">
        <div class="flex-1 min-w-0">
          <A
            href="/"
            class="font-serif font-bold text-primary tracking-wide hover:opacity-80 transition-all active:scale-95 no-underline whitespace-nowrap overflow-hidden text-ellipsis block text-base sm:text-lg md:text-xl"
          >
            {t("common.appName")}
          </A>
        </div>
                {/* DESKTOP NAV (Oculto en móvil 'hidden', visible en md 'md:flex') */}
        <div class="hidden md:flex flex-none gap-2 mr-4">
          <DesktopNavLink href="/exercises" label={t("nav.practice")} />
          <DesktopNavLink href="/theory" label={t("nav.theory")} />
          <DesktopNavLink href="/profile" label={t("nav.profile")} />
        </div>

        {/* SETTINGS AREA */}
        <div class="flex-none gap-2">
          {/* Botón Idioma */}
          <button class="btn btn-ghost btn-circle btn-sm" onClick={toggleLang}>
            <Languages size={20} />
            <span class="text-xs font-bold uppercase">{currentLang()}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      {/* pb-24 asegura que el contenido no quede tapado por la barra inferior en móvil */}
      <main class="flex-grow p-4 pb-24 md:pb-4 max-w-5xl w-full mx-auto animate-fade-in">
        {props.children}
      </main>

      {/* 3. BOTTOM NAVIGATION (Mobile Only) */}
      {/* Visible en móvil, oculto en md ('md:hidden') */}
      <nav class="btm-nav btm-nav-md bg-base-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 md:hidden">
        <MobileNavButton
          href="/exercises"
          icon={Music}
          label={t("nav.practice")}
        />
        <MobileNavButton
          href="/theory"
          icon={BookOpen}
          label={t("nav.theory")}
        />
        <MobileNavButton href="/profile" icon={User} label={t("nav.profile")} />
      </nav>
    </div>
  );
};

// Componente Auxiliar para Móvil
const MobileNavButton = (props: { href: string; icon: any; label: string }) => {
  const location = useLocation();
  const isActive = () =>
    location.pathname.startsWith(props.href) ||
    (props.href === "/exercises" && location.pathname === "/");

  return (
    <A
      href={props.href}
      class={`${isActive() ? "active text-primary bg-primary/10" : "text-base-content/60"} transition-all`}
    >
      <props.icon size={24} />
      <span class="text-xs font-semibold">{props.label}</span>
    </A>
  );
};

// Componente Auxiliar para Desktop
const DesktopNavLink = (props: { href: string; label: string }) => {
  const location = useLocation();
  const isActive = () => location.pathname.startsWith(props.href);

  return (
    <A
      href={props.href}
      class={`btn btn-sm btn-ghost ${isActive() ? "text-primary bg-base-200" : ""}`}
    >
      {props.label}
    </A>
  );
};

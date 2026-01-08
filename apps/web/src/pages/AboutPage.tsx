import { createSignal, Switch, Match, For } from "solid-js";
import { Info, Target, History, Milestone } from "lucide-solid";
import { useAboutI18n } from "../features/about/i18n"; // Importamos el hook local
import { HeroDescription } from "../features/about/HeroDescription";
import { MissionVision } from "../features/about/MissionVision";
import { WhyBingen } from "../features/about/WhyBingen";
import { ProjectRoadmap } from "../features/about/ProjectRoadmap";

const AboutPage = () => {
  const [t] = useAboutI18n(); // Inicializamos el traductor
  
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = createSignal("overview");

  // Definición de las pestañas con sus llaves de traducción
  const sections = [
    { id: "overview", labelKey: "tabs.overview", icon: Info },
    { id: "mission", labelKey: "tabs.mission", icon: Target },
    { id: "history", labelKey: "tabs.history", icon: History },
    { id: "roadmap", labelKey: "tabs.roadmap", icon: Milestone },
  ];

  return (
    <main class="min-h-screen animate-fade-in pb-20">
      <div class="max-w-5xl mx-auto px-4 md:px-8 pt-6">
        
        {/* NAVEGACIÓN INTERNA (TABS) */}
        <div class="flex justify-center mb-10">
          <div class="tabs tabs-boxed bg-base-100 p-1.5 shadow-xl border border-base-content/5 overflow-x-auto flex-nowrap max-w-full">
            <For each={sections}>{(section) => (
              <button
                onClick={() => setActiveTab(section.id)}
                class="tab gap-2 font-bold transition-all duration-300 h-12 px-6"
                classList={{
                  "tab-active !bg-primary !text-primary-content shadow-md": activeTab() === section.id,
                  "hover:bg-base-200": activeTab() !== section.id
                }}
              >
                <section.icon size={18} />
                <span class="hidden sm:inline uppercase text-[11px] tracking-widest">
                  {/* Llamamos a t() con la llave correspondiente de forma reactiva */}
                  {t(section.labelKey as any) as string}
                </span>
              </button>
            )}</For>
          </div>
        </div>

        {/* CONTENEDOR DINÁMICO */}
        <div class="relative min-h-[500px]">
          <Switch>
            <Match when={activeTab() === "overview"}>
              <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <HeroDescription />
              </div>
            </Match>
            
            <Match when={activeTab() === "mission"}>
              <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <MissionVision />
              </div>
            </Match>
            
            <Match when={activeTab() === "history"}>
              <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <WhyBingen />
              </div>
            </Match>
            
            <Match when={activeTab() === "roadmap"}>
              <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProjectRoadmap />
              </div>
            </Match>
          </Switch>
        </div>
        
        <footer class="text-center pt-20 opacity-20 text-[10px] font-mono uppercase tracking-[0.5em]">
          Bingen's Symphonia Music Lab — AD 2025
        </footer>
      </div>
    </main>
  );
};

export default AboutPage;
import { A } from "@solidjs/router";
import { Music2, Home } from "lucide-solid";
import { useI18n } from "../i18n";

const NotFoundPage = () => {
  const [t] = useI18n();

  return (
    <main class="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <div class="relative mb-8">
        <div class="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
        
        <div class="relative bg-base-100 p-8 rounded-full shadow-2xl border border-base-content/5">
          <Music2 size={80} class="text-primary opacity-20" />
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-4xl font-serif font-black text-primary">404</span>
          </div>
        </div>
      </div>

      <div class="max-w-md space-y-6 relative z-10">
        <h1 class="text-3xl md:text-4xl font-serif font-black text-primary italic">
          {/* Usamos 'as any' para saltar la validación estricta de tsc */}
          {t("notFound.title" as any) as string}
        </h1>
        <p class="text-lg opacity-60 font-serif leading-relaxed">
          {t("notFound.text" as any) as string}
        </p>
        
        <div class="pt-6">
          <A 
            href="/" 
            class="btn btn-primary btn-lg gap-3 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-sm"
          >
            <Home size={20} />
            {t("notFound.button" as any) as string}
          </A>
        </div>
      </div>

      <div class="mt-20 opacity-5 font-serif italic text-6xl md:text-8xl select-none pointer-events-none uppercase tracking-tighter">
        Invisibilia Per Visibilia
      </div>
    </main>
  );
};

export default NotFoundPage;
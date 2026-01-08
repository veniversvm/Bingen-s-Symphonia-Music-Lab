import { Mail } from "lucide-solid";
import { useAboutI18n } from "./i18n";

export const HeroDescription = () => {
  const [t] = useAboutI18n();
  const myEmail = "franhsabt@gmail.com"; // Reemplaza con tu correo real

  return (
    <section class="text-center space-y-8 max-w-4xl mx-auto py-16 px-4 animate-in fade-in duration-700">
      {/* Badge institucional */}
      <div class="inline-block badge badge-outline border-primary/30 text-primary font-bold tracking-[0.2em] px-4 py-3 h-auto">
        {t('hero.badge') as string}
      </div>

      {/* Titular responsivo */}
      <h1 class="text-4xl md:text-7xl font-serif font-black text-primary leading-none tracking-tight">
        {t('hero.title.part1') as string}
        <span class="italic text-secondary">{t('hero.title.part2') as string}</span> <br />
        {t('hero.title.part3') as string}
        <span class="underline decoration-secondary/40 decoration-4 underline-offset-4">
          {t('hero.title.part4') as string}
        </span>
      </h1>

      {/* Descripción con soporte de estilo */}
      <p class="text-lg md:text-2xl opacity-80 leading-relaxed font-serif max-w-2xl mx-auto text-base-content/80">
        {/* Aquí renderizamos el texto. Si necesitas negritas dinámicas, podrías usar innerHTML, 
            pero por seguridad lo dejamos como texto plano o lo dividimos */}
        {t('hero.description') as string}
      </p>

      {/* Tags de funcionalidades */}
      <div class="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 pt-4 text-[10px] md:text-sm font-black opacity-40 uppercase tracking-[0.2em]">
        <span>{t('hero.tags.theory') as string}</span>
        <span class="text-secondary text-lg leading-none">•</span>
        <span>{t('hero.tags.dictations') as string}</span>
        <span class="text-secondary text-lg leading-none">•</span>
        <span>{t('hero.tags.paths') as string}</span>
      </div>

      {/* SECCIÓN DE CONTACTO / COLABORACIÓN */}
      <div class="pt-10 flex flex-col items-center gap-4">
        <p class="text-sm font-serif italic opacity-60">
          {t('hero.contact.label') as string}
        </p>
        <a 
          href={`mailto:${myEmail}`}
          class="group flex items-center gap-3 px-6 py-3 bg-base-100 border border-primary/20 rounded-full hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <div class="p-2 bg-primary/10 text-primary rounded-full group-hover:bg-primary group-hover:text-primary-content transition-colors">
            <Mail size={18} />
          </div>
          <span class="font-bold text-sm tracking-tight text-primary">
            {myEmail}
          </span>
        </a>
      </div>
    </section>
  );
};
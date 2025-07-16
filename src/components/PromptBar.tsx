import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { usePosterStore } from "@/store/usePosterStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
// shadcn/ui components
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronRight } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface TemplateMeta {
  name: string;
  description: string;
  thumbnail: string;
}

const templates: Record<number, TemplateMeta> = {
  1: {
    name: "City",
    description: `Illustration au trait monochrome façon affiche rétro-vintage mêlant esthétique manga et voyage…`,
    thumbnail: "/images/poster6.png",
  },
  2: {
    name: "Vintage",
    description: `Illustration vectorielle minimaliste au style rétro, inspirée des affiches touristiques vintage. La scène représente un paysage naturel épuré, avec de larges aplats de couleurs chaudes et douces (sable, ocre, orange, verts doux ou teintes adaptées au thème), sans contours ni détails superflus. Perspective simple avec un horizon visible (ex. : plage et mer sous un soleil couchant). 
      
      Les personnages, s’ils sont présents, sont stylisés de manière minimaliste mais colorée : pas de silhouettes sombres ou noires, mais des corps représentés avec des aplats de couleurs variées et harmonieuses. Ils n’ont PAS de traits du visage, mais des postures expressives et naturelles. Les vêtements et accessoires sont également représentés sans ombres ni textures, avec des couleurs unies. L’objectif est de garder un style vivant mais épuré, sans tomber dans un effet “ombre chinoise”.

      La composition est équilibrée, avec un titre centré en haut de l’image, écrit en lettres majuscules, utilisant une typographie sans-serif épaisse, arrondie et bien espacée, dans une couleur qui contraste agréablement avec le fond.`,
    thumbnail: "/images/poster2.jpg",
  },
  3: {
    name: "Affiche de Film",
    description: "New version • Bold geometric shapes, gradient backgrounds and sleek sans-serif headlines.",
    thumbnail: "/images/poster3.png",
  },
  4: {
    name: "Abstract",
    description: "Vibrant contrasting colours with free-form geometric or organic patterns.",
    thumbnail: "/images/poster4.png",
  },
  5: {
    name: "Painting Vintage",
    description: "Vibrant contrasting colours with free-form geometric or organic patterns.",
    thumbnail: "/images/poster7.png",
  },
};

const getTemplate = (id: number | null) =>
  id && templates[id] ? templates[id] : { name: "Unknown", description: "", thumbnail: "" };

/* -------------------------------------------------------------------------- */
/*                         TemplateDropdown (mobile + desktop)                 */
/* -------------------------------------------------------------------------- */

const TemplateDropdown = () => {
  const { selectedTemplate, setSelectedTemplate } = usePosterStore();
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [atEnd, setAtEnd] = useState(false);

  const PREVIEW_WIDTH = "w-32"; // 128 px – back to larger size

  const handleSelect = (id: number) => {
    setSelectedTemplate(id);
    setOpen(false);
  };

  // hide arrow when scrolled to the end (mobile only)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 10);
    };
    onScroll();
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          aria-label="Changer le template"
          className="inline-flex items-center justify-center rounded-md p-1 hover:bg-indigo-100/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          <ChevronDown size={20} className="text-indigo-600" />
        </button>
      </PopoverTrigger>

      {/* Mobile : 90vw ; Desktop : auto width */}
      <PopoverContent
        align="center"
        sideOffset={8}
        className="p-4 bg-white/90 backdrop-blur-sm shadow-xl rounded-xl w-[90vw] sm:w-auto sm:max-w-[48rem]"
      >
        <div className="relative">
          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-scroll md:overflow-visible md:justify-center px-2 md:px-0"
            style={{ touchAction: "pan-x" }}
          >
            {Object.entries(templates).map(([id, tpl]) => {
              const tplId = Number(id);
              const active = tplId === selectedTemplate;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelect(tplId)}
                  className={`${PREVIEW_WIDTH} aspect-[2/3] shrink-0 relative group overflow-hidden rounded-2xl shadow-md transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none ${active ? "ring-2 ring-indigo-500" : "ring-1 ring-transparent hover:ring-indigo-300"
                    }`}
                >
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.name}
                    className="object-contain w-full h-full"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-indigo-700/80 text-white text-[0.65rem] font-medium py-1 text-center tracking-wide">
                    {tpl.name}
                  </div>
                  {active && (
                    <Check size={16} className="absolute top-1 right-1 text-white bg-indigo-600 rounded-full p-px shadow" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Arrow hint – only mobile, hide when at end */}
          {!atEnd && (
            <div className="sm:hidden pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 bg-gradient-to-l from-white/90 via-white/60 to-transparent rounded-r-xl">
              <ChevronRight className="text-indigo-500 animate-pulse" size={20} />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

/* -------------------------------------------------------------------------- */
/*                               PromptBar                                    */
/* -------------------------------------------------------------------------- */

const PromptBar = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedTemplate, setGeneratedUrls } = usePosterStore();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Saisissez un prompt", description: "Décrivez le poster.", variant: "destructive" });
      return;
    }
    if (!selectedTemplate) {
      toast({ title: "Choisissez un template", description: "Sélectionnez un style.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { name: templateName, description: templateDescription } = getTemplate(selectedTemplate);
      setGeneratedUrls([]);
      const { data, error } = await supabase.functions.invoke("generate-posters", {
        body: { prompt: prompt.trim(), templateName, templateDescription, hasImage: false },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Generation failed");
      const urls = Array.isArray(data.imageUrls) ? data.imageUrls : Array.isArray(data.poster?.image_urls) ? data.poster.image_urls : [];
      setGeneratedUrls(urls);
      toast({ title: "Posters générés !", description: "Vos posters sont prêts." });
      setPrompt("");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "La génération a échoué.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const currentTemplate = getTemplate(selectedTemplate);

  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-6">
      <h2
        className="
          relative z-20
          text-2xl sm:text-3xl md:text-4xl font-extrabold
          text-white
          drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]
          text-center mb-6
        "
      >
        Describe your poster idea
      </h2>

      <div className="max-w-full sm:max-w-lg md:max-w-2xl mx-auto">
        <div className="bg-white/60 backdrop-blur rounded-2xl ring-1 ring-[#c8d9f2] p-4 sm:p-6">
          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Décrivez votre idée… (ex. : Une citation motivante avec fond de montagne)"
              className="w-full p-3 sm:p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none transition-all text-base"
              rows={3}
              disabled={isGenerating}
            />

            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3">
              <div className="flex items-center gap-1 text-sm text-gray-800">
                {selectedTemplate ? (
                  <>
                    Template : <strong className="font-semibold text-gray-900">{currentTemplate.name}</strong>
                  </>
                ) : (
                  <span className="text-orange-600">⚠️ Sélectionnez un template</span>
                )}
                <TemplateDropdown />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || !selectedTemplate}
                className="w-full sm:w-auto px-6 py-3 font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:text-white/70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Génération…
                  </div>
                ) : (
                  "Générer les posters"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default PromptBar;

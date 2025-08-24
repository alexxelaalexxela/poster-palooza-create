import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePosterStore } from "@/store/usePosterStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
// shadcn/ui components
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { useTypingPlaceholder } from "./useTypingPlaceholder";
import { useFingerprint } from "@/hooks/useFingerprint";

import { UpgradeModal } from "@/components/UpgradeModal";
import { AttemptsCounter } from "@/components/AttemptsCounter";
// import OfferModal from "@/components/OfferModal"; // switched to full page route

import { FunctionsHttpError } from "@supabase/supabase-js";
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
    description: `Illustration vectorielle minimaliste, style affiche touristique vintage des années 50. 
Scène : [décris ici le lieu ou l’action, ex. « plage de Biarritz au coucher du soleil »].
Palette : aplats doux et chauds (sable, ocre, orange brûlé, vert d’eau, turquoise), sans dégradés ni textures.
Composition : horizon clair, perspective simple, larges formes géométriques nettes.
Personnages : 1-4 figures stylisées, corps en aplats de couleurs harmonieuses, postures naturelles. 
IMPORTANT → AUCUN trait du visage, AUCUN contour noir, AUCune ombre portée ; vêtements et accessoires en couleurs unies.
Typo : titre centré en haut, majuscules sans-serif épaisses et arrondies, couleur contrastante.
Rendu : bords francs, arrière-plan épuré, effet sérigraphie propre, 4K.

--négatif-- silhouettes noires, ombrage réaliste, détails fins, lignes de croquis, texture photo, grain, visages détaillés, gradients`,
    thumbnail: "/images/poster6.png",
  },
  2: {
    name: "Vintage",
    description: `Illustration vectorielle minimaliste au style rétro, inspirée des affiches touristiques vintage. La scène représente un paysage naturel épuré, avec de larges aplats de couleurs chaudes et douces (sable, ocre, orange, verts doux ou teintes adaptées au thème), sans contours ni détails superflus ! Perspective simple avec un horizon visible et possiblement un couché de soleil (ex. : plage et mer sous un soleil couchant). 
      
      Les personnages, s’ils sont présents, sont stylisés de manière minimaliste mais colorée : pas de silhouettes sombres ou noires, mais des corps représentés avec des aplats de couleurs variées et harmonieuses. Ils n’ont PAS de traits du visage ! mais des postures expressives et naturelles. Les vêtements et accessoires sont également représentés sans ombres ni textures, avec des couleurs unies. L’objectif est de garder un style vivant mais épuré, sans tomber dans un effet “ombre chinoise”.

      La composition est équilibrée, avec un titre centré en haut de l’image, écrit en lettres majuscules, utilisant une typographie sans-serif épaisse, arrondie et bien espacée, dans une couleur qui contraste agréablement avec le fond.
      Il faut absulument que le prompt dise qu'on veut un paysage naturel épuré avec des forme et large aplat et que les personnage soit minimaliste coloré et sans traits de visage .
      `,
    thumbnail: "/images/poster2.jpg",
  },
  3: {
    name: "Affiche de Film",
    description: `Illustration vectorielle minimaliste, style affiche touristique vintage des années 50. 
Scène : [décris ici le lieu ou l’action, ex. « plage de Biarritz au coucher du soleil »].
Palette : aplats doux et chauds (sable, ocre, orange brûlé, vert d’eau, turquoise), sans dégradés ni textures.
Composition : horizon clair, perspective simple, larges formes géométriques nettes.
Personnages : 1-4 figures stylisées, corps en aplats de couleurs harmonieuses, postures naturelles. 
IMPORTANT → AUCUN trait du visage, AUCUN contour noir, AUCune ombre portée ; vêtements et accessoires en couleurs unies.
Typo : titre centré en haut, majuscules sans-serif épaisses et arrondies, couleur contrastante.
Rendu : bords francs, arrière-plan épuré, effet sérigraphie propre, 4K.`,
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
const examples = [
  // Exemples existants
  "2 personnes surfant à Biarritz au coucher du soleil",
  "Des amis partant faire un tour de moto au Maroc",
  "Un couple qui ski à Serre Chevalier dans les Alpes",
  "4 personnes faisant du beach volley au couché du soleil à Bondi en Australie",
  "Une famille pique-niquant sous les cerisiers en fleurs à Kyoto",
  "Une équipe faisant de la plongée avec tuba sur la Grande Barrière de corail",
  "Deux randonneuses admirant le lever du soleil au sommet du Kilimandjaro",
  "Un groupe d'amis faisant du kayak sur le lac Louise au Canada",
  "Un photographe capturant les aurores boréales en Islande",
  "Des enfants construisant un château de sable à Copacabana, Brésil",
  "Un couple dégustant un café sur une terrasse à Rome",
  "Trois amis explorant un marché de nuit à Bangkok",
  "Des cyclistes traversant les champs de tulipes aux Pays-Bas",
  "Un musicien jouant de la guitare dans les rues de La Havane"
];

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

  const PREVIEW_WIDTH = "w-24"; // 128 px – back to larger size

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
  const navigate = useNavigate();
  const visitorId = useFingerprint();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedTemplate, setGeneratedUrls, setCachedUrls } = usePosterStore();
  const { toast } = useToast();
  const [showUpgrade, setShowUpgrade] = useState(false);
  // const [showOffer, setShowOffer] = useState(false);

  const typingPlaceholder = useTypingPlaceholder(examples, prompt !== "");



  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Saisissez un prompt", description: "Décrivez le poster.", variant: "destructive" });
      return;
    }
    if (!selectedTemplate) {
      toast({ title: "Choisissez un template", description: "Sélectionnez un style.", variant: "destructive" });
      return;
    }
    if (!visitorId) {
      toast({ title: "Chargement…", description: "Identifiant visiteur en cours.", variant: "destructive" });
      return;
    }


    setGeneratedUrls([]);           // ← ok, on part de zéro
    setIsGenerating(true);

    try {
      const { name, description } = getTemplate(selectedTemplate);

      /* ②  appel Supabase */
      const { data } = await supabase.functions.invoke("generate-posters", {
        body: {
          prompt: prompt.trim(),
          templateName: name,
          templateDescription: description,
          hasImage: false,
          visitorId,
        },
      });

      /* ↘︎ Si on arrive ici, le HTTP = 200 */
      if (!data?.success) {
        // le back renvoie success:false (ex. limite) → modale
        setShowUpgrade(true);
        return;
      }

      const urls = Array.isArray(data.imageUrls)
        ? data.imageUrls
        : Array.isArray(data.poster?.image_urls)
          ? data.poster.image_urls
          : [];

      if (!urls.length) {
        // défense : pas d’URL => on considère que c’est un échec logique
        setShowUpgrade(true);
        return;
      }

      /* ③  succès réel -> affiche les posters */
      setGeneratedUrls(urls);
      toast({ title: "Posters générés !", description: "Vos posters sont prêts." });
      setPrompt("");
      
      // Demande aux composants d'actualiser les compteurs (profils/visiteur)
      try { window.dispatchEvent(new CustomEvent('attempts:refresh')); } catch {}

    } catch (err) {
      /* ④  attrape les codes != 200 */
      if (err instanceof FunctionsHttpError && err.context?.status === 429) {
        setShowUpgrade(true);          // ouvre la fenêtre d’upgrade
        return;                        // surtout ne pas aller au toast « Erreur »
      }

      toast({
        title: "Erreur",
        description: (err as Error).message ?? "La génération a échoué.",
        variant: "destructive",
      });

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
    <>
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
          Décrivez votre idée de poster
        </h2>

        {/* Compteur de tentatives */}
        <div className="max-w-full sm:max-w-lg md:max-w-2xl mx-auto">
          <AttemptsCounter />
        </div>

        <div className="max-w-full sm:max-w-lg md:max-w-2xl mx-auto">
          <div className="bg-white/60 backdrop-blur rounded-2xl ring-1 ring-[#c8d9f2] p-4 sm:p-6">
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={typingPlaceholder}
                className="w-full p-3 sm:p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none transition-all text-base"
                rows={3}
                disabled={isGenerating}
              />

              <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-3">
                {/* Template Selection - Commenté
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
                */}
                {!isGenerating && (
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim()}
                    className="w-full sm:w-auto px-6 py-3 font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:text-white/70 disabled:cursor-not-allowed"
                  >
                    {"Générer les posters"}
                  </Button>
                )}
              </div>
              {isGenerating && (
                <div className="flex items-center gap-2 text-sm text-indigo-900 bg-indigo-50/80 border border-indigo-100 rounded-xl px-3 py-2">
                  <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Génération en cours. Cela peut prendre quelques minutes…</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.section>


      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onSignup={() => { setShowUpgrade(false); navigate('/subscribe'); }}
      />
    </>
  );
};

export default PromptBar;

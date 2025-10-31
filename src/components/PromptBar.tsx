import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePosterStore } from "@/store/usePosterStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
// shadcn/ui components
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronRight, Image as ImageIcon, Lock, X, Info, ArrowUp, Settings, Sparkles } from "lucide-react";
import { useTypingPlaceholder } from "./useTypingPlaceholder";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFingerprint } from "@/hooks/useFingerprint";

import { UpgradeModal } from "@/components/UpgradeModal";
import { AttemptsCounter } from "@/components/AttemptsCounter";
// import OfferModal from "@/components/OfferModal"; // switched to full page route

import { FunctionsHttpError } from "@supabase/supabase-js";
import { useProfile } from "@/hooks/useProfile";
import { findPosterById } from "@/lib/posterCatalog";
import { trackEventWithId, getFbp, getFbc } from "@/lib/metaPixel";
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
    name: "Vintage",
    description: `Illustration vectorielle minimaliste au style rétro, inspirée des affiches touristiques vintage. La scène représente un paysage naturel épuré, avec de larges aplats de couleurs chaudes et douces (sable, ocre, orange, verts doux ou teintes adaptées au thème), sans contours ni détails superflus ! Perspective simple avec un horizon visible et possiblement un couché de soleil (ex. : plage et mer sous un soleil couchant). 
      
      Les personnages, s'ils sont présents, sont stylisés de manière minimaliste mais colorée : pas de silhouettes sombres ou noires, mais des corps représentés avec des aplats de couleurs variées et harmonieuses. Ils n'ont PAS de traits du visage ! mais des postures expressives et naturelles. Les vêtements et accessoires sont également représentés sans ombres ni textures, avec des couleurs unies. L'objectif est de garder un style vivant mais épuré, sans tomber dans un effet "ombre chinoise". Ils ne doivent pas prendre tout l'espace, seulement 1/5 de la surface.

      La composition est équilibrée, avec un titre centré en haut de l'image, écrit en lettres majuscules, utilisant une typographie sans-serif épaisse, arrondie et bien espacée, dans une couleur qui contraste agréablement avec le fond.
      Il faut absulument que le prompt dise qu'on veut un paysage naturel épuré avec des forme et large aplat et que les personnage soit minimaliste coloré et sans traits de visage .
      `,
    thumbnail: "/images/poster10.png",
  },
  2: {
    name: "Minimaliste",
    description: `Le style est celui d’une affiche illustrée minimaliste au rendu vectoriel, utilisant uniquement des aplats de couleurs sans contours. La composition s’organise en plusieurs plans : un premier plan décoratif qui encadre la scène (par exemple des branches ou motifs stylisés, environ 10 à 15 % de la surface), un deuxième plan qui met en valeur le sujet principal (village, monument, élément central) occupant environ 40 % de la hauteur, et un arrière-plan composé de formes superposées simplifiées (collines, montagnes) représentant 40 à 50 % restants. La palette repose sur des tons sourds et harmonieux (verts, violets, ocres, beiges), enrichis de quelques touches de couleurs vives (jaunes, rouges) servant d’accents visuels. Le texte est centré en bas, dans une zone discrète d’environ 5 à 7 % de la hauteur totale : le titre principal est en majuscules, police sans-serif géométrique, espacé, avec une taille équivalente à environ 1/40 de la hauteur du poster, tandis que le sous-titre, placé juste en dessous, est 4 à 5 fois plus petit, presque comme une annotation. L’ensemble conserve une esthétique épurée, élégante et équilibrée, favorisant la lisibilité et une atmosphère calme et contemplative.
Les personnages, s'ils sont présents, sont stylisés de manière minimaliste mais colorée : pas de silhouettes sombres ou noires, mais des corps représentés avec des aplats de couleurs variées et harmonieuses. Ils n'ont PAS de traits du visage ! mais des postures expressives et naturelles. Les vêtements et accessoires sont également représentés sans ombres ni textures, avec des couleurs unies. L'objectif est de garder un style vivant mais épuré, sans tomber dans un effet "ombre chinoise".`,
    thumbnail: "/images/poster11.png",
  },
  3: {
    name: "Affiche de Film",
    description: `Affiche de cinéma au style néo-rétro inspiré des couvertures de magazines pulp des années 50 et 60, avec une esthétique marquée par des contrastes forts, une typographie massive et un traitement visuel volontairement dramatique. L’image centrale représente un personnage féminin en pose iconique, placé au premier plan et occupant la moitié inférieure de la composition. Le rendu privilégie un réalisme cinématographique, avec un éclairage artificiel et contrasté (ombres profondes et tons saturés), accentuant les volumes du visage et des objets environnants.

Le fond est composé d’un décor intérieur simplifié, sombre et secondaire, servant principalement à faire ressortir la figure principale. Les couleurs dominantes reposent sur une palette chaude et saturée (rouges profonds, oranges, jaunes lumineux), contrebalancée par des tons plus sombres (noirs, bleus nuit). Cette palette crée une tension visuelle et dramatique, propre aux visuels pulp.

La typographie est un élément central de la composition : le titre est inscrit en lettres capitales massives, sans empattement, épaisses et serrées, avec une texture légèrement vieillie. Sa couleur jaune vif contraste violemment avec le fond rouge, renforçant la dimension accrocheuse et publicitaire. En dessous, une signature manuscrite (ex “a Quentin Tarantino film”) apporte une touche plus personnelle et artisanale. La liste des acteurs apparaît en colonne à gauche, en lettres capitales jaunes également, équilibrant visuellement la composition et respectant la hiérarchie typographique.

La composition est organisée verticalement : le titre occupe le tiers supérieur, le personnage central domine la partie médiane, et les crédits en petits caractères forment une base textuelle dense dans la zone inférieure. L’ensemble est encadré par des motifs visuels et des éléments iconographiques (revolver, cigarettes, roman pulp) qui enrichissent l’atmosphère rétro et ancrent l’image dans un univers de fiction dramatique et ironique.

L’objectif esthétique est de transmettre une identité visuelle immédiatement reconnaissable : mélange de culture populaire rétro, de cinéma noir, et d’icônes graphiques pulp, avec un rendu à la fois sophistiqué et volontairement kitsch, proche de l’affiche de magazine d’époque modernisée.



`,
    thumbnail: "/images/poster3.png",
  },
  4: {
    name: "Street Art",
    description: `Illustration digitale au style pop art et street art contemporain, inspirée des fresques murales urbaines et des affiches graphiques modernes. La composition met en valeur un personnage central, représenté de manière stylisée avec des lignes affirmées et des couleurs franches. L’arrière-plan est constitué d’un mur texturé recouvert de graffitis multicolores, réalisés en larges aplats de teintes vives (rouges, oranges, bleus, violets, roses, verts), enrichis de projections et de coulures de peinture, créant une atmosphère vibrante et dynamique.

Lorsqu’un personnage est présent, il occupe une place centrale et s’impose par une posture expressive et déterminée. Ses traits sont simplifiés mais volontairement stylisés, dans un rendu illustratif affirmé évoquant l’iconographie contemporaine. Des symboles graphiques (étoiles, cœurs, couronnes, motifs subversifs) et des slogans typographiques (“KING”, “VICTORY”, “THE WORLD IS YOURS”, “BE THE BEST VERSION OF YOURSELF”) s’intègrent à la composition, rappelant l’esthétique du graffiti et du collage visuel.

La typographie se distingue par un mélange de styles : capitales massives et géométriques, lettrages arrondis inspirés du street art, et inscriptions manuscrites proches du marquage au feutre ou au spray. Les choix chromatiques (bleu électrique, orange fluorescent, rose néon, noir profond) créent des contrastes forts qui accentuent l’impact visuel.

La composition se caractérise par une densité assumée, une asymétrie contrôlée et une superposition volontaire de motifs, d’inscriptions et de symboles. L’ensemble transmet une impression de puissance, d’énergie et de contestation, où l’iconographie urbaine (graffitis, slogans, codes visuels de la culture de rue) se combine avec la force expressive du personnage central.`,
    thumbnail: "/images/poster9.png",
  },
  
  5: {
    name: "City",
    description: `Illustration vectorielle minimaliste au style rétro, inspirée des affiches touristiques des années 1930 à 1950. La scène met en valeur un paysage urbain ou côtier épuré, composé de larges aplats de couleurs franches et lumineuses (bleu ciel, turquoise, jaune sable, rouge brique, vert végétal), sans contours ni détails superflus. Les formes sont simplifiées et stylisées, privilégiant l’équilibre visuel et la lisibilité. La perspective reste simple, avec un horizon clair et une organisation en plans successifs (premier plan décoratif, deuxième plan mettant en valeur le sujet principal comme une plage, une promenade, un monument, puis un arrière-plan avec collines, mer ou ciel).

Les personnages, s’ils apparaissent, sont représentés de manière minimaliste mais colorée : pas de silhouettes sombres, mais des corps aux aplats harmonieux. Ils n’ont pas de traits de visage, uniquement des postures expressives et naturelles. Leurs vêtements sont traités sans ombres ni textures, dans des couleurs franches et contrastées (blanc, rouge, jaune, bleu). L’ensemble conserve un style vivant et élégant, sans jamais basculer dans la surcharge ou l’effet d’ombre chinoise.

La composition est soigneusement équilibrée, avec un titre centré en haut de l’image, écrit en lettres majuscules, utilisant une typographie sans-serif géométrique, épaisse et bien espacée. La couleur du titre contraste nettement avec le fond (souvent blanc cassé, crème ou une teinte claire). Sous ce titre sous la partie gauche et qui chevauche un peu le titre, le nom du pays ou de la région apparaît en beaucoup beaucoup plus petit (10x plus petit), généralement en typographie cursive manuscrite élégante, d’une couleur vive (orange, rouge, bleu).

L’objectif global est de transmettre une atmosphère lumineuse, épurée et élégante, évoquant à la fois le voyage, l’été et le raffinement des affiches vintage, tout en restant intemporel grâce à la simplicité graphique des aplats.`,
    thumbnail: "/images/poster6.png",
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

const TemplateDropdown = ({ onUpgrade, isPaid }: { onUpgrade: () => void; isPaid: boolean }) => {
  const { selectedTemplate, setSelectedTemplate } = usePosterStore();
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [atEnd, setAtEnd] = useState(false);

  const PREVIEW_WIDTH = "w-28"; // Légèrement plus large pour le nouveau design

  const handleSelect = (id: number, templateName: string) => {
    // Templates à venir: tout sauf "Vintage" reste indisponible pour tous
    const isAllowed = templateName.toLowerCase() === 'vintage';

    if (!isAllowed) {
      // Ne pas ouvrir la modale d'upgrade: c'est "Prochainement..."
      return;
    }

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
    <>
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <button
            aria-label="Changer le template"
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 text-xs sm:text-sm font-medium border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            <span>Style</span>
            <ChevronDown size={16} className="text-gray-700" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="center"
          sideOffset={8}
          className="p-4 bg-white/95 backdrop-blur-sm shadow-xl rounded-xl w-[90vw] sm:w-auto sm:max-w-[48rem]"
        >
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-scroll md:overflow-visible md:justify-center px-2 md:px-0"
              style={{ touchAction: "pan-x" }}
            >
              {Object.entries(templates).map(([id, tpl]) => {
                const tplId = Number(id);
                const active = tplId === selectedTemplate;
                // Seul "Vintage" est disponible; les autres sont "Prochainement..."
                const isAllowed = tpl.name.toLowerCase() === 'vintage';
                
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelect(tplId, tpl.name)}
                    className={`${PREVIEW_WIDTH} aspect-[2/3] shrink-0 relative group overflow-hidden rounded-2xl shadow-md transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none ${
                      active ? "ring-2 ring-indigo-500" : "ring-1 ring-transparent hover:ring-indigo-300"
                    } ${!isAllowed ? 'opacity-70' : ''}`}
                  >
                    <img
                      src={tpl.thumbnail}
                      alt={tpl.name}
                      className={`object-contain w-full h-full ${!isAllowed ? 'grayscale' : ''}`}
                      loading="lazy"
                      decoding="async"
                      
                    />
                    
                    <div className={`absolute bottom-0 inset-x-0 text-white text-[0.65rem] font-medium py-1 text-center tracking-wide ${
                      isAllowed ? 'bg-indigo-700/80' : 'bg-gray-700/80'
                    }`}>
                      {tpl.name}
                    </div>
                    
                    {!isAllowed && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="px-2 py-1 rounded-full bg-white/95 text-amber-700 text-[0.65rem] font-semibold inline-flex items-center gap-1 shadow">
                          <Lock size={12} />
                          Prochainement...
                        </div>
                      </div>
                    )}
                    
                    {active && (
                      <Check size={16} className="absolute top-1 right-1 text-white bg-indigo-600 rounded-full p-px shadow" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {!atEnd && (
              <div className="sm:hidden pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 bg-gradient-to-l from-white/90 via-white/60 to-transparent rounded-r-xl">
                <ChevronRight className="text-indigo-500 animate-pulse" size={20} />
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>


    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                               PromptBar                                    */
/* -------------------------------------------------------------------------- */

const PromptBar = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const visitorId = useFingerprint();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedTemplate, selectedLibraryPosterId, setSelectedLibraryPosterId, setGeneratedUrls, setCachedUrls, improvementRefUrl, setImprovementRefUrl } = usePosterStore();
  const { toast } = useToast();
  const [showUpgrade, setShowUpgrade] = useState(false);
  // const [showOffer, setShowOffer] = useState(false);

  // État paiement
  const { profile } = useProfile();
  const isPaid = !!profile?.is_paid;

  // État image uploadée
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isIterating, setIsIterating] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const iterationExamples = [
    "Enlever une personne au premier plan",
    "Rendre le ciel plus orangé",
    "Le garçon a les cheveux blonds",
    "Réduire la taille des personnages",
    "Ajouter un surfeur au loin",
    "Remplacer la ville par Biarritz",
    "Augmenter le contraste et la saturation",
  ];
  const typingPlaceholder = isIterating
    ? useTypingPlaceholder(iterationExamples, prompt !== "")
    : useTypingPlaceholder(examples, prompt !== "");
  const [showStyleInfo, setShowStyleInfo] = useState(false);
  const isMobile = useIsMobile();
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [maxAttempts, setMaxAttempts] = useState<number>(3);

  // Paramètres manuels (titre, sous-titre, date)
  const [paramsOpen, setParamsOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState<string>("");
  const [manualSubtitle, setManualSubtitle] = useState<string>("");
  const [manualDate, setManualDate] = useState<string>("");
  const hasManualOptions = !!((manualTitle && manualTitle.trim()) || (manualSubtitle && manualSubtitle.trim()) || (manualDate && manualDate.trim()));


  const handleGenerate = async () => {
    if (!prompt.trim() && !imageDataUrl && !(isIterating && improvementRefUrl)) {
      toast({ title: "Ajoutez un prompt ou une image", description: "Décrivez votre idée ou importez une image.", variant: "destructive" });
      return;
    }
    // If no library poster is selected, require template selection as before
    if (!selectedLibraryPosterId && !selectedTemplate) {
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
      const libraryPoster = findPosterById(selectedLibraryPosterId || undefined);
      const useTemplate = !libraryPoster;
      const { name, description } = useTemplate ? getTemplate(selectedTemplate) : { name: "LibraryPoster", description: libraryPoster?.stylePrompt || "" };

      /* ②  appel Supabase */
      // Prepare Meta identifiers for StartTrial dedupe
      const trialEventId = crypto.randomUUID();
      const fbp = getFbp();
      const fbc = getFbc();
      const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined;
      const { data } = await supabase.functions.invoke("generate-posters", {
        body: {
          prompt: isIterating ? "" : prompt.trim(),
          templateName: name,
          templateDescription: description,
          libraryPosterId: libraryPoster?.id,
          hasImage: !!imageDataUrl,
          imageDataUrl: imageDataUrl ?? undefined,
          visitorId,
          // Iteration fields
          iterateFromUrl: isIterating && improvementRefUrl ? improvementRefUrl : undefined,
          improvementInstructions: isIterating ? (prompt.trim() || undefined) : undefined,
          fbEventId: trialEventId,
          fbp,
          fbc,
          pageUrl,
          // Champs optionnels
          manualTitle: manualTitle.trim() || undefined,
          manualSubtitle: manualSubtitle.trim() || undefined,
          manualDate: manualDate.trim() || undefined,
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
      setImageDataUrl(null);
      if (isIterating) { setImprovementRefUrl(null); setIsIterating(false); }
      // Conserver les paramètres manuels pour la session; ne pas reset
      
      // Demande aux composants d'actualiser les compteurs (profils/visiteur)
      try { window.dispatchEvent(new CustomEvent('attempts:refresh')); } catch {}

      // Meta Pixel: StartTrial pour visiteurs non payants (déduplication avec CAPI via eventID)
      try {
        if (!isPaid) {
          const contentId = selectedLibraryPosterId
            ? `library-${selectedLibraryPosterId}`
            : selectedTemplate
              ? `template-${selectedTemplate}`
              : 'poster';
          trackEventWithId('StartTrial', {
            content_type: 'product',
            content_ids: [contentId],
          }, trialEventId);
        }
      } catch {}

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

  const handleUploadClick = () => {
    if (!isPaid) {
      setShowUpgrade(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Fichier invalide", description: "Veuillez sélectionner une image.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const currentTemplate = getTemplate(selectedTemplate);
  const selectedLibraryPoster = findPosterById(selectedLibraryPosterId || undefined);

  // Hydration on homepage: only from URL param, otherwise clear selection
  useEffect(() => {
    // Listen for AttemptsCounter refresh events to stay in sync
    const onRefresh = (e?: any) => {
      try {
        const detail = (e as CustomEvent)?.detail as { attemptsRemaining?: number; maxAttempts?: number } | undefined;
        if (detail?.attemptsRemaining !== undefined) setAttemptsRemaining(detail.attemptsRemaining);
        if (detail?.maxAttempts !== undefined) setMaxAttempts(detail.maxAttempts);
      } catch {}
    };
    window.addEventListener('attempts:update', onRefresh);
    return () => window.removeEventListener('attempts:update', onRefresh);
  }, []);

  // Fallback: read from profile when available
  useEffect(() => {
    if (profile) {
      setMaxAttempts(profile.is_paid ? 15 : 3);
      if (typeof profile.generations_remaining === 'number') {
        setAttemptsRemaining(profile.generations_remaining);
      }
    }
  }, [profile]);

  // Initial fetch attempts from Edge function for anonymous and logged users
  useEffect(() => {
    const fetchAttempts = async () => {
      if (!visitorId) return;
      try {
        const resp = await supabase.functions.invoke('get-attempts', {
          body: { visitorId },
        });
        if (resp.data?.success) {
          const remaining = resp.data.attemptsRemaining ?? 0;
          const paid = !!resp.data.isPaid;
          setAttemptsRemaining(remaining);
          setMaxAttempts(paid ? 15 : 3);
        }
      } catch {}
    };
    fetchAttempts();
  }, [visitorId]);

  // Hydrate selection from URL on first render
  useEffect(() => {
    const idFromUrl = searchParams.get('selectedPoster');
    if (idFromUrl) {
      setSelectedLibraryPosterId(idFromUrl);
    } else {
      setSelectedLibraryPosterId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus PromptBar when coming from gallery "Améliorer"
  useEffect(() => {
    const onFocusPrompt = () => {
      try {
        const el = document.getElementById('prompt-textarea') as HTMLTextAreaElement | null;
        if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      } catch {}
      if (improvementRefUrl) setIsIterating(true);
    };
    window.addEventListener('promptbar:focus', onFocusPrompt);
    return () => window.removeEventListener('promptbar:focus', onFocusPrompt);
  }, [improvementRefUrl]);

  useEffect(() => {
    if (improvementRefUrl) setIsIterating(true);
  }, [improvementRefUrl]);

  return (
    <>
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-4 sm:space-y-6">
        <h2
          className="
          relative z-20
          text-2xl sm:text-3xl md:text-4xl font-extrabold
          text-white
          drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]
          text-center mb-1 sm:mb-2
        "
        >
          Crée ton oeuvre Neoma !
        </h2>
        <p
          className="
          text-center text-white/90 text-sm sm:text-base font-medium
          drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]
          mb-6 sm:mb-8
        "
        >
          Décris ton idée et reçois ton poster
        </p>
        <div aria-hidden="true" className="h-6 sm:h-10"></div>
        

        {/* Compteur intégré dans la barre ci-dessous */}

        <div className="w-full sm:max-w-lg md:max-w-2xl px-0 sm:px-0 mx-auto">
          <div className={`relative bg-white/70 backdrop-blur rounded-3xl ring-1 ring-[#c8d9f2] ${isIterating ? 'p-3 sm:p-4 md:p-5' : 'p-2 sm:p-3'}`}>
            {/* Header row: attempts pill (right) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0" />
              {attemptsRemaining !== null && (
                <div className="shrink-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border shadow-sm
                          ${((attemptsRemaining / Math.max(1, maxAttempts)) * 100) > 66 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ((attemptsRemaining / Math.max(1, maxAttempts)) * 100) > 33 ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'}`}
                        aria-label={`Tentatives restantes ${attemptsRemaining} sur ${maxAttempts}`}
                      >
                        {attemptsRemaining}/{maxAttempts}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" sideOffset={6} className="px-3 py-2 text-sm">
                      <span className="font-medium text-gray-800">{attemptsRemaining} tentatives restantes</span>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-3">
              {/* Iteration preview (compact, above composer) */}
              {isIterating && improvementRefUrl && (
                <div className="rounded-xl bg-amber-50/70 ring-1 ring-amber-200 p-2 sm:p-3 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="inline-flex items-center gap-2 text-amber-900">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">Amélioration activée — décrivez vos modifications</span>
                      <button
                        type="button"
                        onClick={() => { setImprovementRefUrl(null); setIsIterating(false); }}
                        className="text-amber-800 hover:text-amber-900 text-xs"
                        aria-label="Désactiver l'amélioration"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="rounded-md border border-amber-200 bg-white p-1">
                      <img
                        src={improvementRefUrl}
                        alt="Poster à améliorer"
                        className="w-24 sm:w-28 md:w-32 h-auto object-contain rounded select-none pointer-events-none"
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>
              )}
 
              {/* Selected library poster banner */}
              {selectedLibraryPoster && (
                <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl px-2 py-1.5 sm:px-3 sm:py-2">
                  <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img src={selectedLibraryPoster.imageUrl} alt={selectedLibraryPoster.title} className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg border border-indigo-200" />
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm text-indigo-900 inline-flex items-center gap-2">
                        <strong className="font-semibold">Style sélectionné : </strong>
                        <span className="text-indigo-800/80 truncate max-w-[140px] sm:max-w-none">{selectedLibraryPoster.styleName || selectedLibraryPoster.title}</span>
                        <button
                          type="button"
                          onClick={() => setShowStyleInfo((v) => !v)}
                          className="hidden sm:inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded whitespace-normal break-words cursor-pointer"
                          title="En savoir plus"
                        >
                          <Info size={12} />
                          <span>Seul le style est appliqué</span>
                        </button>
                      </span>
                      {/* Mobile info toggler */}
                      <button
                        type="button"
                        onClick={() => setShowStyleInfo((v) => !v)}
                        className="sm:hidden inline-flex items-center justify-start gap-1 text-[11px] text-indigo-800 mt-1"
                      >
                        <Info size={12} />
                        <span>En savoir plus</span>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLibraryPosterId(null);
                      const p = new URLSearchParams(searchParams);
                      p.delete('selectedPoster');
                      setSearchParams(p);
                    }}
                    className="text-indigo-700 hover:text-indigo-900 text-xs sm:text-sm"
                    aria-label="Retirer l'affiche sélectionnée"
                  >
                    <X size={16} />
                  </button>
                  </div>
                  {showStyleInfo && (
                    <p className="mt-2 text-xs text-indigo-900 whitespace-normal break-words max-w-none sm:max-w-3xl">
                      Seul le style visuel s’applique à votre poster. Décrivez votre propre scène (lieu, ambiance, personnages).
                    </p>
                  )}
                </div>
              )}
              {/* Composer (always visible) */}
              <div className="flex items-end gap-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={typingPlaceholder}
                  className="flex-1 bg-transparent border-none focus:border-none focus:ring-0 outline-none resize-none px-2.5 sm:px-4 pt-8 sm:pt-7 pb-2.5 sm:pb-4 text-[16px] sm:text-base leading-relaxed"
                  id="prompt-textarea"
                  rows={isMobile ? (isIterating ? 3 : 2) : (isIterating ? 4 : 3)}
                  disabled={isGenerating}
                />
              </div>

              {/* Inline options below text, same surface */}
              <div className="flex items-center justify-between px-1.5 sm:px-2 pb-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Style pill (opens dropdown) */}
                  {!selectedLibraryPoster && !isIterating && (
                    <TemplateDropdown onUpgrade={() => setShowUpgrade(true)} isPaid={isPaid} />
                  )}
                  {/* Photo pill */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium border 
                      ${isPaid 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}
                    `}
                  >
                    {isPaid ? <ImageIcon size={14} /> : <Lock size={14} />}
                    <span>Photo</span>
                  </button>
              {/* Paramètre pill */}
              <Popover open={paramsOpen} onOpenChange={setParamsOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium border 
                      ${hasManualOptions
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'}
                    `}
                  >
                    <Settings size={14} />
                    <span>Titres</span>
                    <ChevronDown size={16} className={`${hasManualOptions ? 'text-emerald-700' : 'text-gray-700'}`} />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" sideOffset={8} className="w-[22rem] p-4 sm:p-5 bg-white/80 backdrop-blur rounded-2xl ring-1 ring-[#c8d9f2]/60 shadow-md">
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Titre (optionnel)</label>
                      <input
                        type="text"
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                        placeholder="Ex: Paris"
                        className="w-full rounded-xl border border-gray-200 bg-white/90 px-3 py-2.5 text-[16px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c8d9f2] focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Sous-titre (optionnel)</label>
                      <input
                        type="text"
                        value={manualSubtitle}
                        onChange={(e) => setManualSubtitle(e.target.value)}
                        placeholder="Ex: France"
                        className="w-full rounded-xl border border-gray-200 bg-white/90 px-3 py-2.5 text-[16px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c8d9f2] focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Date (optionnel)</label>
                      <input
                        type="text"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        placeholder="Ex: 20/03/2024"
                        className="w-full rounded-xl border border-gray-200 bg-white/90 px-3 py-2.5 text-[16px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c8d9f2] focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => { setManualTitle(""); setManualSubtitle(""); setManualDate(""); }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Réinitialiser
                      </button>
                      <button
                        type="button"
                        onClick={() => setParamsOpen(false)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
                </div>
                {!isGenerating && (
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() && !imageDataUrl}
                    aria-label="Générer"
                    className="shrink-0 inline-flex items-center justify-center rounded-full bg-indigo-600 text-white w-9 h-9 sm:w-11 sm:h-11 shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                  >
                    <ArrowUp size={18} />
                  </button>
                )}
              </div>
              {imageDataUrl && (
                <div className="flex items-center justify-between bg-indigo-50/80 border border-indigo-100 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={imageDataUrl} alt="Image sélectionnée" className="w-10 h-10 object-cover rounded-lg border border-indigo-200" />
                    <span className="text-xs sm:text-sm text-indigo-900 truncate">Image ajoutée – incluse dans la génération</span>
                  </div>
                  <button
                    onClick={() => setImageDataUrl(null)}
                    className="text-xs sm:text-sm text-indigo-700 hover:underline"
                  >
                    Retirer
                  </button>
                </div>
              )}
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

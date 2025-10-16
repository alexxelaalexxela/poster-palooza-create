
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { buildCanonical, truncate } from '@/lib/utils';
import TemplateCard from '@/components/TemplateCard';
import PromptBar from '@/components/PromptBar';
import PosterGallery from '@/components/PosterGallery';
import FormatPicker from '@/components/FormatPicker';
import QualityPicker from '@/components/QualityPicker';
import OrderBar from '@/components/OrderBar';
import { usePosterStore } from '@/store/usePosterStore';
import { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronUp } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';



const templates = [
  {
    id: 4,
    name: "Vintage",
    image: "/images/1.png",
    description: "1 personne qui regarde la mer a Nice en France au coucher de soleil",
  },
  {
    id: 2,
    name: "Vintage",
    image: "/images/2.png",
    description: "Paysage rétro minimaliste inspiré des affiches touristiques des années 60.Paysage rétro minimaliste inspiré des affiches touristiques des années 60.",
  },
  {
    id: 1,
    name: "City",
    image: "/images/3.png",
    description: "Illustration monochrome façon manga rétro-futuriste d’une métropole animée.",
  },
  {
    id: 3,
    name: "Vintage",
    image: "/images/4.png",
    description: "Composition cinématographique avec formes géométriques et dégradés.",
  },
  {
    id: 5,
    name: "Vintage",
    image: "/images/5.png",
    description: "Palette chaleureuse évoquant la peinture publicitaire des années 30.",
  },
  {
    id: 6,
    name: "Vintage",
    image: "/images/6.png",
    description: "Palette chaleureuse évoquant la peinture publicitaire des années 30.",
  },
  {
    id: 7,
    name: "Vintage",
    image: "/images/7.png",
    description: "Palette chaleureuse évoquant la peinture publicitaire des années 30.",
  },
  {
    id: 8,
    name: "Vintage",
    image: "/images/8.png",
    description: "Palette chaleureuse évoquant la peinture publicitaire des années 30.",
  },
  {
    id: 9,
    name: "Vintage",
    image: "/images/9.png",
    description: "Palette chaleureuse évoquant la peinture publicitaire des années 30.",
  },

  {
    id: 11,
    name: "Vintage",
    image: "/images/11.png",
    description: "Palette chaleureuse évoquant la peinture publicitaire des années 30.",
  },

];

const Index = () => {
  const { selectedTemplate, setSelectedTemplate, setSelectedFormat, setSelectedQuality } = usePosterStore();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [showTemplates, setShowTemplates] = useState(false);


  const scrollRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(true);


  const handleScroll = () => {
    const el = scrollRef.current;
    if (el && el.scrollLeft > 12 && showHint) setShowHint(false);
  };

  // When user has an active plan with stored format/quality, pre-apply and hide pickers
  const hasIncludedPlan = !!(user && profile?.is_paid && profile?.subscription_format && profile?.subscription_quality && !profile?.included_poster_selected_url);

  useEffect(() => {
    if (hasIncludedPlan) {
      // Apply plan format/quality to the store so OrderBar can be used directly
      setSelectedFormat(profile!.subscription_format as any);
      setSelectedQuality(profile!.subscription_quality as any);
    }
  }, [hasIncludedPlan, profile, setSelectedFormat, setSelectedQuality]);

  return (
    <div className="min-h-screen bg-[#E1D7CA]">
      <Helmet>
        <title>Neoma Poster – Créez votre poster IA personnalisé</title>
        <meta name="description" content={truncate("Décrivez votre idée, choisissez un style et obtenez un poster unique en quelques secondes. Qualité pro, impression prête.", 160)} />
        <meta
          name="keywords"
          content={[
            'poster ia',
            'affiche ia',
            'poster IA personnalisé',
            'affiche personnalisée',
            'poster personnalisé',
            'affiche vintage',
            'poster vintage',
            'affiche sport',
            'affiche ville',
            'poster déco',
            'décoration murale',
            'affiche murale',
            'impression poster',
            'création affiche',
            'affiche sur mesure',
            'poster cadeau',
            'affiche cadeau',
            'Neoma Poster',
            'Neoma AI',
          ].join(', ')}
        />
        <link rel="canonical" href={buildCanonical('/')} />
        <meta property="og:title" content="Neoma Poster – Créez votre poster IA personnalisé" />
        <meta property="og:description" content="Décrivez votre idée, choisissez un style et obtenez un poster unique en quelques secondes." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={buildCanonical('/images/hero-background.png')} />
        <meta property="og:url" content={buildCanonical('/')} />
        <meta name="twitter:card" content="summary_large_image" />
        {/* Preload hero background to improve LCP */}
        <link rel="preload" as="image" href={buildCanonical('/images/hero-background.png')} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Neoma Poster',
          url: buildCanonical('/'),
          potentialAction: {
            '@type': 'SearchAction',
            target: `${buildCanonical('/librairie')}?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        })}</script>
      </Helmet>
      {/*<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">*/}
      {/* Hero Section */}

      {/*<section className="relative pt-24 pb-20">*/}


      <section
        className="
          relative
          /* 1️⃣ Pleine hauteur visible – svh/dvh évite le saut mobile */
          min-h-[100dvh]           /* Tailwind ≥ 3.4 → ok ; sinon reste sur min-h-screen */
          /* 2️⃣ Mise en page */
          flex flex-col items-center justify-center
          /* 3️⃣ On garde le spacing seulement sur desktop */
          lg:pt-24 lg:pb-20 px-4
        "
      >

        {/* Image de fond + overlay, bornés à cette section  */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center z-0"
          style={{ backgroundImage: "url('/images/hero-background.png')" }}
        />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-10" />

        {/* Contenu de la hero */}
        {/* Contenu de la hero */}

        <div
          className="
            relative z-20
            w-full max-w-6xl    /* ❗ w-full assure qu’on ne rétrécit jamais */
            mx-auto px-4 sm:px-6 lg:px-8
            text-center space-y-6
        ">
          {/* Barre de prompt → premier élément visible */}
          <PromptBar />

          {/* Bouton toggle templates - Style épuré */}
          <motion.button
            type="button"
            aria-expanded={showTemplates}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
            className="
              mx-auto inline-flex items-center gap-2 sm:gap-2.5
              rounded-full border border-gray-200/70 bg-white/80 backdrop-blur
              text-gray-800 px-4 py-2 sm:px-5 sm:py-2.5 shadow-sm hover:bg-white/90 hover:shadow
              transition-colors
            "
            onClick={() => setShowTemplates((p) => !p)}
          >
            <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 p-1.5">
              {showTemplates ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
            </span>
            <span className="text-sm sm:text-base font-medium">
              {showTemplates ? 'Masquer les exemples' : 'Voir des exemples'}
            </span>
          </motion.button>

          {/* Section des exemples redesignée */}
          <AnimatePresence initial={false}>
            {showTemplates && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden"
              >
                {/* Header Section */}
                

                {/* Gallery Container */}
                <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 shadow-2xl">
                  <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="
                      flex gap-6 overflow-x-auto px-2 py-4
                      scroll-smooth snap-x snap-mandatory no-scrollbar
                      md:grid md:grid-cols-5 md:gap-8 md:overflow-visible md:px-0
                    "
                  >
                    {templates.map((t, index) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <TemplateCard template={t} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Mobile Scroll Hint */}
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="pointer-events-none md:hidden
                        absolute inset-y-0 right-0 w-16
                        bg-gradient-to-l from-white/10 via-white/5 to-transparent rounded-r-3xl"
                    >
                      <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        className="absolute top-1/2 -translate-y-1/2 right-4"
                      >
                        <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                          <ChevronRight size={16} className="text-white" />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Decorative Elements */}
                  <div className="absolute top-3 left-3 w-2 h-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-60"></div>
                  <div className="absolute bottom-3 right-3 w-2 h-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-60"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>




      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-16">

        {/* Template Picker */}
        {/* Template Picker */}


        {/*<motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            <span className="inline md:hidden">Slide and choose among these templates</span>
            <span className="hidden md:inline">Choose among these templates</span>
          </h2>

          <div className="relative">
            <div
              ref={scrollRef}               
              onScroll={handleScroll}       
              className="
        flex gap-4 overflow-x-auto px-1
        scroll-smooth snap-x snap-mandatory no-scrollbar
        md:grid md:grid-cols-5 md:gap-6
        md:overflow-visible md:px-0
      "
            >
              {templates.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  isSelected={selectedTemplate === t.id}
                  onSelect={() => setSelectedTemplate(t.id)}
                />
              ))}
            </div>

            {showHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none md:hidden
                   absolute inset-y-0 right-0 w-16
                   bg-gradient-to-l from-white via-white/70 to-transparent"
              >
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500"
                >
                  <ChevronRight size={22} />
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.section>*/}


        {/* Prompt Input */}
        {/*<motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}

        >
          <PromptBar />
        </motion.section>*/}

        {/* Poster Gallery */}
        <PosterGallery />

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-indigo-200 to-transparent"
        />
        {/* Format Picker */}
        {!hasIncludedPlan && <FormatPicker />}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-indigo-200 to-transparent"
        />

        {/* Quality Picker */}
        {!hasIncludedPlan && <QualityPicker />}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-indigo-200 to-transparent"
        />

        {/* Order Bar */}
        <OrderBar />

      </div>
    </div >
  );
};

export default Index;

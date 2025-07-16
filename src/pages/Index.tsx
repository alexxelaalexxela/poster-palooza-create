
import { AnimatePresence, motion } from 'framer-motion';
import TemplateCard from '@/components/TemplateCard';
import PromptBar from '@/components/PromptBar';
import PosterGallery from '@/components/PosterGallery';
import FormatPicker from '@/components/FormatPicker';
import QualityPicker from '@/components/QualityPicker';
import OrderBar from '@/components/OrderBar';
import { usePosterStore } from '@/store/usePosterStore';
import { useRef, useState } from 'react';
import { ChevronRight, ChevronUp } from 'lucide-react';



const templates = [
  { id: 4, name: 'Abstract', image: '/images/poster4.png' },
  { id: 2, name: 'Vintage', image: '/images/poster2.jpg' },
  { id: 1, name: 'City', image: '/images/poster6.png' },

  { id: 3, name: 'Affiche de Film', image: '/images/poster3.png' },
  { id: 5, name: 'Painting Vintage', image: '/images/poster7.png' },
];

const Index = () => {
  const { selectedTemplate, setSelectedTemplate } = usePosterStore();

  const [showTemplates, setShowTemplates] = useState(false);


  const scrollRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(true);


  const handleScroll = () => {
    const el = scrollRef.current;
    if (el && el.scrollLeft > 12 && showHint) setShowHint(false);
  };

  return (
    <div className="min-h-screen bg-[#E1D7CA]">
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

        <div
          className="
            relative z-20
            w-full max-w-6xl    /* ❗ w-full assure qu’on ne rétrécit jamais */
            mx-auto px-4 sm:px-6 lg:px-8
            text-center space-y-6
        ">
          {/* Barre de prompt → premier élément visible */}
          <PromptBar />

          {/* Bouton toggle templates */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="
              mx-auto flex items-center gap-2
              bg-indigo-600 hover:bg-indigo-700 text-white
              font-medium px-6 py-3 rounded-full shadow-lg
            "
            onClick={() => setShowTemplates((p) => !p)}
          >
            {showTemplates ? 'Masquer les templates' : 'Changer de style'}
            {showTemplates ? <ChevronUp size={20} /> : <ChevronRight size={20} />}
          </motion.button>

          {/* Picker de templates (collapsible) */}
          <AnimatePresence initial={false}>
            {showTemplates && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: [.4, 0, .2, 1] }}
                className="overflow-hidden"
              >
                <h2
                  className="
                    relative z-20
                    text-xl sm:text-xl md:text-2xl font-extrabold
                    text-white
                    drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]
                    text-center mb-8
                  "
                >
                  Choisis ton template
                </h2>

                <div
                  className="
                    flex gap-4 overflow-x-auto px-1
                    scroll-smooth snap-x snap-mandatory no-scrollbar
                    md:grid md:grid-cols-5 md:gap-6 md:overflow-visible md:px-0
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
        <FormatPicker />
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-indigo-200 to-transparent"
        />

        {/* Quality Picker */}
        <QualityPicker />
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

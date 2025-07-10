
import { motion } from 'framer-motion';
import TemplateCard from '@/components/TemplateCard';
import PromptBar from '@/components/PromptBar';
import PosterGallery from '@/components/PosterGallery';
import FormatPicker from '@/components/FormatPicker';
import QualityPicker from '@/components/QualityPicker';
import OrderBar from '@/components/OrderBar';
import { usePosterStore } from '@/store/usePosterStore';
import { useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';



const templates = [
  { id: 1, name: 'City', image: '/images/poster6.png' },
  { id: 2, name: 'Vintage', image: '/images/poster2.jpg' },
  { id: 3, name: 'Modern', image: '/images/poster3.png' },
  { id: 4, name: 'Abstract', image: '/images/poster4.png' },
];

const Index = () => {
  const { selectedTemplate, setSelectedTemplate } = usePosterStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el && el.scrollLeft > 12 && showHint) setShowHint(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12">

        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-purple-50/40 to-pink-50/40" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .8, ease: [.16, 1, .3, 1] }}
            className="
    mx-auto max-w-3xl text-center font-semibold tracking-wide leading-snug
    text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-800
    mb-6 
  "
          >
            Neoma Poster Creator
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            L’affiche dont&nbsp;
            <span className="relative inline-block px-1">
              {/* accent pastel : surlignage arrière */}
              <span className="absolute inset-0 -skew-y-1 bg-amber-200/60 rounded-sm" />
              <span className="relative">vous</span>
            </span>
            &nbsp;êtes l’auteur
          </motion.p>


          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-indigo-200 to-transparent"
          />
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-16">

        {/* Template Picker */}
        <motion.section
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

          {/* ─────────── Nouveau wrapper relatif ─────────── */}
          <div className="relative">
            {/* ❶ Carrousel (inchangé, on ajoute juste ref + onScroll) */}
            <div
              ref={scrollRef}               /* ← ajoute cette ref */
              onScroll={handleScroll}       /* ← ajoute cette fonction */
              className="
        flex gap-4 overflow-x-auto px-1
        scroll-smooth snap-x snap-mandatory no-scrollbar
        md:grid md:grid-cols-4 md:gap-6
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

            {/* ❷ Indice visuel (gradient + flèche), mobile seulement */}
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
        </motion.section>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-indigo-200 to-transparent"
        />

        {/* Prompt Input */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}

        >
          <PromptBar />
        </motion.section>

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
    </div>
  );
};

export default Index;

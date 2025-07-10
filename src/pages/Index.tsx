
import { motion } from 'framer-motion';
import TemplateCard from '@/components/TemplateCard';
import PromptBar from '@/components/PromptBar';
import PosterGallery from '@/components/PosterGallery';
import FormatPicker from '@/components/FormatPicker';
import QualityPicker from '@/components/QualityPicker';
import OrderBar from '@/components/OrderBar';
import { usePosterStore } from '@/store/usePosterStore';

const templates = [
  { id: 1, name: 'City', image: '/images/poster6.png' },
  { id: 2, name: 'Vintage', image: '/images/poster2.jpg' },
  { id: 3, name: 'Modern', image: '/images/poster3.png' },
  { id: 4, name: 'Abstract', image: '/images/poster4.png' },
];

const Index = () => {
  const { selectedTemplate, setSelectedTemplate } = usePosterStore();

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
            L’affiche dont&nbsp;
            <span className="relative inline-block px-1">
              {/* accent pastel : surlignage arrière */}
              <span className="absolute inset-0 -skew-y-1 bg-amber-200/60 rounded-sm" />
              <span className="relative">vous</span>
            </span>
            &nbsp;êtes l’auteur
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Decrit ton idée de poster et laisse l'IA faire le reste.
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
            {/* Mobile (< md) */}
            <span className="inline md:hidden">
              Slide and choose among these templates
            </span>

            {/* Desktop (≥ md) */}
            <span className="hidden md:inline">
              Choose among these template
            </span>
          </h2>
          <div
            className="
              flex gap-4 overflow-x-auto px-1          /* mobile : carrousel */
              scroll-smooth snap-x snap-mandatory      /* snapping iOS/Android */
              no-scrollbar
              md:grid md:grid-cols-4 md:gap-6          /* desktop : grille */
              md:overflow-visible md:px-0
              
            "
          >
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate === template.id}
                onSelect={() => setSelectedTemplate(template.id)}

              />
            ))}

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

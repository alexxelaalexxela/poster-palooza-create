

/****************************************************************
 * QualityPicker.tsx – desktop inchangé, mobile optimisé
 ****************************************************************/

import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { usePosterStore, type Quality } from '@/store/usePosterStore';

const qualityOptions: {
  id: Quality;
  name: string;
  subtitle: string;
  ring: string;
}[] = [
    { id: 'classic', name: 'Classic', subtitle: 'Papier 250 g/m² — bonne qualité standard.', ring: 'from-neutral-400/40 via-neutral-500/40 to-neutral-600/40' },
    { id: 'premium', name: 'Premium', subtitle: '250 g/m² + laminé mat — anti‑reflets, couleurs plus denses.', ring: 'from-sky-400/40 via-indigo-500/40 to-indigo-600/40' },
    { id: 'museum', name: 'Museum', subtitle: 'Papier premium 250 g/m² — rendu artistique, meilleure durabilité.', ring: 'from-amber-400/40 via-rose-400/40 to-rose-500/40' },
  ];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function QualityPicker() {
  const { selectedQuality, setSelectedQuality, selectedFormat } = usePosterStore();
  if (!selectedFormat) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="mt-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="text-center mb-8 md:mb-12"
      >
        <div className="inline-flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="p-2 md:p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg md:rounded-xl shadow-lg">
            <Palette className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </div>
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            Qualité d'impression
          </h2>
        </div>
        <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-4">
          Choisissez le niveau de qualité qui correspond à vos attentes
        </p>
      </motion.div>

      {/* Grille : 1 colonne mobile, 3 colonnes dès sm (≥640 px) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-sm sm:max-w-3xl mx-auto">
        {qualityOptions.map((opt, idx) => {
          const active = selectedQuality === opt.id;
          return (
            <motion.button
              key={opt.id}
              custom={idx}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              type="button"
              onClick={() => setSelectedQuality(opt.id)}
              className={`relative w-full
                py-6 px-4 md:py-8 md:px-6           /* padding réduit mobile */
                rounded-2xl border bg-white/70 backdrop-blur-2xl shadow-sm transition
                ${active
                  ? `md:scale-105 border-transparent ring-2 ring-transparent
                     bg-clip-padding bg-gradient-to-br ${opt.ring}`
                  : 'md:hover:scale-103 md:hover:shadow-md border-gray-200'}
              `}
            >
              {/* Nom : plus petit mobile, comme avant desktop */}
              <span className="block text-xl md:text-2xl font-semibold text-gray-800">
                {opt.name}
              </span>

              <span className="block w-8 md:w-10 h-px bg-gray-300/60 mx-auto my-2 md:my-3" />

              <span className="block text-xs md:text-sm italic text-gray-600">
                {opt.subtitle}
              </span>

              {active && (
                <span className="pointer-events-none absolute top-2 md:top-3 right-2 md:right-3
                                   bg-white rounded-full p-1 shadow-sm">
                  <Check size={16} className="text-indigo-600" />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
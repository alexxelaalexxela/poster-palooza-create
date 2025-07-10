/****************************************************************
 * QualityPicker.tsx – design sobre, titre « Format », ring doux
 ****************************************************************/

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { usePosterStore, type Quality } from '@/store/usePosterStore';

const qualityOptions: {
  id: Quality;
  name: string;
  subtitle: string;
  ring: string;
}[] = [
    { id: 'classic', name: 'Classic', subtitle: '170 g/m² · Mat', ring: 'from-neutral-400/40 via-neutral-500/40 to-neutral-600/40' },
    { id: 'premium', name: 'Premium', subtitle: '230 g/m² · Satin', ring: 'from-sky-400/40 via-indigo-500/40 to-indigo-600/40' },
    { id: 'museum', name: 'Museum', subtitle: '305 g/m² · Gloss', ring: 'from-amber-400/40 via-rose-400/40 to-rose-500/40' },
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
      {/* Titre conservé comme avant */}
      <h2 className="text-center font-bold text-3xl text-gray-900 mb-8">
        Quality
      </h2>


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
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
              className={`relative w-full py-8 px-6 rounded-2xl border bg-white/70 backdrop-blur-2xl shadow-sm transition
                ${active
                  ? `scale-105 border-transparent ring-2 ring-transparent bg-clip-padding bg-gradient-to-br ${opt.ring}`
                  : 'hover:scale-103 hover:shadow-md border-gray-200'}
              `}
            >
              <span className="block text-2xl font-semibold text-gray-800">
                {opt.name}
              </span>

              {/* filet de séparation */}
              <span className="block w-10 h-px bg-gray-300/60 mx-auto my-3" />

              <span className="block text-sm italic text-gray-600">
                {opt.subtitle}
              </span>

              {active && (
                <span className="pointer-events-none absolute top-3 right-3 bg-white rounded-full p-1 shadow-sm">
                  <Check size={18} className="text-indigo-600" />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
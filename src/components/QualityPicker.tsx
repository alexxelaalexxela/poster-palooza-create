

import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { usePosterStore, type Quality } from '@/store/usePosterStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const qualityOptions: {
  id: Quality;
  name: string;
  subtitle: string;
}[] = [
  { id: 'classic', name: 'Classic', subtitle: 'Papier 250 g/m² · qualité standard équilibrée' },
  { id: 'premium', name: 'Premium', subtitle: '250 g/m² + laminé mat · anti‑reflets, couleurs plus denses' },
  { id: 'museum', name: 'Museum', subtitle: 'Papier premium 250 g/m² · rendu artistique et durabilité' },
];

export default function QualityPicker() {
  const { selectedQuality, setSelectedQuality, selectedFormat } = usePosterStore();
  if (!selectedFormat) return null;

  const activeOption = qualityOptions.find((q) => q.id === selectedQuality) ?? qualityOptions[0];

  return (
    <section className="mt-6">
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Qualité d'impression</h2>
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <button type="button" aria-label="En savoir plus sur les qualités" className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition">
                  <Info size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="max-w-xs text-xs leading-relaxed">
                Classic: papier 250 g/m².
                Premium: 250 g/m² avec laminé mat anti‑reflets.
                Museum: rendu artistique sur papier premium.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Segmented control */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex justify-center"
      >
        <div className="inline-flex rounded-full bg-white/80 backdrop-blur border border-gray-200 p-1 shadow-sm">
          {qualityOptions.map((opt) => {
            const active = selectedQuality ? selectedQuality === opt.id : opt.id === 'classic';
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedQuality(opt.id)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-[15px] font-medium transition-colors ${
                  active
                    ? 'bg-gray-900 text-white shadow'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-pressed={active}
              >
                {opt.name}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Subline description */}
      <div className="mt-3 text-center">
        <p className="text-xs md:text-sm text-gray-600">{activeOption.subtitle}</p>
      </div>
    </section>
  );
}
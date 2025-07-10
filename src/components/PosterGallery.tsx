/* ──────────────────────────────────────────────────────────────
   PosterGallery.tsx – zoom fluide sans lag + anneau bleu
   ────────────────────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import { usePosterStore } from '@/store/usePosterStore';

const PosterGallery = () => {
  const { generatedUrls = [], selectedPoster, setSelectedPoster } =
    usePosterStore();

  if (!generatedUrls.length) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">
          No posters generated yet
        </h2>
        <p className="text-center text-gray-600">
          Generate your first poster using the prompt input above!
        </p>
      </motion.section>
    );
  }

  const allImages = generatedUrls.map((url, i) => ({ id: `gen-${i}`, url }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-6"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">
        Generated Posters
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {allImages.map((image, index) => (
          <motion.div
            key={image.id}
            /* apparition */
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            /* hover : simple scale + easing */
            whileHover={{ scale: 1.06 }}
            /* styles */
            className={`bg-white/80 backdrop-blur rounded-2xl p-4 cursor-pointer
                 transition-transform duration-200 ease-out
                 ${selectedPoster === index
                ? 'border-2 border-indigo-500 bg-indigo-50/80 shadow-lg'
                : 'border border-[#c8d9f2] shadow-md'
              }`}
            style={{ willChange: 'transform' }}
            onClick={() => setSelectedPoster(index)}
          >
            <div className="aspect-[3/4] mb-3 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
              <img
                src={image.url}
                alt={`Generated poster ${index + 1}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default PosterGallery;
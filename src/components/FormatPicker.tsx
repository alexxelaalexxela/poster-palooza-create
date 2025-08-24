
import { motion } from 'framer-motion';
import { Check, Maximize } from 'lucide-react';
import { usePosterStore, Format } from '@/store/usePosterStore';
import PosterWall from './SofaPoster';

const FormatPicker = () => {
  //const { selectedFormat, setSelectedFormat, selectedPoster } = usePosterStore();
  const { selectedFormat, setSelectedFormat, selectedPoster, generatedUrls, cachedUrls } = usePosterStore();
  const mergedUrls = [...generatedUrls, ...cachedUrls];

  //const posterUrl = selectedPoster !== null && generatedUrls[selectedPoster]
  //  ? generatedUrls[selectedPoster]
  //  : null;

  //const posterUrl =
  //  selectedPoster !== null
  //    ? generatedUrls[selectedPoster] ?? cachedUrls[selectedPoster] ?? null
  //    : null;

  const posterUrl = selectedPoster !== null ? mergedUrls[selectedPoster] ?? null : null;

  if (selectedPoster === null || selectedPoster === undefined) return null;

  const formatOptions = [
    { id: 'A2' as Format, label: 'A2', className: 'w-40 h-56 col-span-2' },
    { id: 'A3' as Format, label: 'A3', className: 'w-40 h-28' },
    { id: 'A4' as Format, label: 'A4', className: 'w-20 h-28' },
    { id: 'A5' as Format, label: 'A5', className: 'w-20 h-28' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-4 md:mt-0"
    >

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="text-center mb-8 md:mb-12"
      >
        <div className="inline-flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg md:rounded-xl shadow-lg">
            <Maximize className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </div>
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            Choisissez votre Format
          </h2>
        </div>
        <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-4">
          Sélectionnez la taille parfaite pour votre poster personnalisé
        </p>
      </motion.div>

      <div className="w-full flex flex-col items-center">
        <div className="overflow-hidden">
          <PosterWall posterUrl={posterUrl} />
        </div>
      </div>

    </motion.section>

  );
};

export default FormatPicker;

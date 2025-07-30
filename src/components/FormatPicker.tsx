
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
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

      <div className="w-full flex flex-col items-center pt-6 md:pt-2">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-0">
          Format
        </h2>
        <div className="overflow-hidden">
          <PosterWall posterUrl={posterUrl} />
        </div>
      </div>

    </motion.section>

  );
};

export default FormatPicker;

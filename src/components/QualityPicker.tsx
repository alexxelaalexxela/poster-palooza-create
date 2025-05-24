
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { usePosterStore, Quality } from '@/store/usePosterStore';

const QualityPicker = () => {
  const { selectedQuality, setSelectedQuality, selectedFormat } = usePosterStore();
  
  if (!selectedFormat) return null;

  const qualityOptions = [
    { id: 'paper1' as Quality, label: 'Paper 1', bgColor: 'bg-[#fcf9f4]' },
    { id: 'paper2' as Quality, label: 'Paper 2', bgColor: 'bg-[#f0f6ff]' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-10"
    >
      <h2 className="text-lg font-medium mb-4">Quality :</h2>
      
      <div className="flex space-x-4">
        {qualityOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => setSelectedQuality(option.id)}
            className={`relative cursor-pointer w-20 h-20 border-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
              selectedQuality === option.id
                ? 'border-lime-400 ring-2 ring-lime-400'
                : 'border-[#c8d9f2] hover:border-indigo-400'
            } ${option.bgColor}`}
            aria-label={`Select ${option.label}`}
          >
            <span className="text-xs font-medium text-gray-700">{option.label}</span>
            {selectedQuality === option.id && (
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-lime-400 rounded-full flex items-center justify-center">
                <Check size={10} className="text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.section>
  );
};

export default QualityPicker;

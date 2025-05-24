
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { usePosterStore, Format } from '@/store/usePosterStore';

const FormatPicker = () => {
  const { selectedFormat, setSelectedFormat, selectedPoster } = usePosterStore();
  
  if (!selectedPoster) return null;

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
      className="mt-12"
    >
      <h2 className="text-lg font-medium mb-4">Format</h2>
      
      <div className="grid grid-cols-4 gap-2 w-fit">
        {/* A2 - full width top */}
        <div
          onClick={() => setSelectedFormat('A2')}
          className={`relative cursor-pointer border-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
            selectedFormat === 'A2'
              ? 'bg-lime-100 border-lime-400'
              : 'border-[#c8d9f2] hover:border-indigo-400'
          } w-40 h-56 col-span-2`}
          aria-label="Select A2 format"
        >
          <span className="text-sm font-medium">A2</span>
          {selectedFormat === 'A2' && (
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-lime-400 rounded-full flex items-center justify-center">
              <Check size={10} className="text-white" />
            </div>
          )}
        </div>
        
        {/* A3 - bottom left */}
        <div
          onClick={() => setSelectedFormat('A3')}
          className={`relative cursor-pointer border-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
            selectedFormat === 'A3'
              ? 'bg-lime-100 border-lime-400'
              : 'border-[#c8d9f2] hover:border-indigo-400'
          } w-40 h-28 col-span-2`}
          aria-label="Select A3 format"
        >
          <span className="text-sm font-medium">A3</span>
          {selectedFormat === 'A3' && (
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-lime-400 rounded-full flex items-center justify-center">
              <Check size={10} className="text-white" />
            </div>
          )}
        </div>
        
        {/* A4 - bottom right top */}
        <div
          onClick={() => setSelectedFormat('A4')}
          className={`relative cursor-pointer border-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
            selectedFormat === 'A4'
              ? 'bg-lime-100 border-lime-400'
              : 'border-[#c8d9f2] hover:border-indigo-400'
          } w-20 h-14`}
          aria-label="Select A4 format"
        >
          <span className="text-xs font-medium">A4</span>
          {selectedFormat === 'A4' && (
            <div className="absolute bottom-1 right-1 w-3 h-3 bg-lime-400 rounded-full flex items-center justify-center">
              <Check size={8} className="text-white" />
            </div>
          )}
        </div>
        
        {/* A5 - bottom right bottom */}
        <div
          onClick={() => setSelectedFormat('A5')}
          className={`relative cursor-pointer border-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
            selectedFormat === 'A5'
              ? 'bg-lime-100 border-lime-400'
              : 'border-[#c8d9f2] hover:border-indigo-400'
          } w-20 h-14`}
          aria-label="Select A5 format"
        >
          <span className="text-xs font-medium">A5</span>
          {selectedFormat === 'A5' && (
            <div className="absolute bottom-1 right-1 w-3 h-3 bg-lime-400 rounded-full flex items-center justify-center">
              <Check size={8} className="text-white" />
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default FormatPicker;

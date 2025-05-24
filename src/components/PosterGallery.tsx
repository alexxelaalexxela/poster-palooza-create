
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { usePosterStore, PosterResult } from '@/store/usePosterStore';

// Mock data for demonstration
const mockResults: PosterResult[] = [
  { id: 1, url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=533&fit=crop' },
  { id: 2, url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=533&fit=crop' },
  { id: 3, url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=533&fit=crop' },
  { id: 4, url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=533&fit=crop' },
];

const PosterGallery = () => {
  const { selectedPoster, setSelectedPoster } = usePosterStore();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-14"
    >
      <h2 className="text-lg font-medium mb-6">Our compositions :</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockResults.map((result, index) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedPoster(result.id)}
            className={`relative cursor-pointer aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-300 ${
              selectedPoster === result.id 
                ? 'ring-2 ring-lime-400' 
                : 'hover:drop-shadow-lg'
            }`}
            aria-label={`Select poster ${result.id}`}
          >
            <img
              src={result.url}
              alt={`Generated poster ${result.id}`}
              className="w-full h-full object-cover"
            />
            
            {selectedPoster === result.id && (
              <>
                <div className="absolute inset-0 bg-lime-100/50" />
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-lime-400 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default PosterGallery;

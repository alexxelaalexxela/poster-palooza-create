
import { motion } from 'framer-motion';
import PosterResultCard from './PosterResultCard';

// Mock data for demonstration
const mockResults = [
  { id: 1, url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=533&fit=crop' },
  { id: 2, url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=533&fit=crop' },
  { id: 3, url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=533&fit=crop' },
];

const ResultsGallery = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 text-center">
        Tes posters générés
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockResults.map((result, index) => (
          <PosterResultCard
            key={result.id}
            result={result}
            index={index}
          />
        ))}
      </div>
    </motion.section>
  );
};

export default ResultsGallery;

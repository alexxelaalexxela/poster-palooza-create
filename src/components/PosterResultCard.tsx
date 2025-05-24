
import { motion } from 'framer-motion';

interface PosterResult {
  id: number;
  url: string;
}

interface PosterResultCardProps {
  result: PosterResult;
  index: number;
}

const PosterResultCard = ({ result, index }: PosterResultCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl overflow-hidden drop-shadow-lg hover:drop-shadow-xl transition-all duration-300"
    >
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={result.url}
          alt={`Generated poster ${result.id}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Poster #{result.id}</span>
          <button className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            Download
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PosterResultCard;

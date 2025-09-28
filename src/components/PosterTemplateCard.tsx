
import { motion } from 'framer-motion';

interface Template {
  id: number;
  name: string;
  image: string;
}

interface PosterTemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
}

const PosterTemplateCard = ({ template, isSelected, onSelect }: PosterTemplateCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl overflow-hidden drop-shadow-lg transition-all duration-300 ${
        isSelected 
          ? 'ring-2 ring-green-500 bg-light-green' 
          : 'bg-white hover:drop-shadow-xl'
      }`}
    >
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={template.image}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          width={400}
          height={533}
        />
      </div>
      <div className={`p-4 ${isSelected ? 'bg-light-green' : 'bg-white'}`}>
        <h3 className="text-lg font-medium text-gray-900 text-center">
          {template.name}
        </h3>
      </div>
    </motion.div>
  );
};

export default PosterTemplateCard;

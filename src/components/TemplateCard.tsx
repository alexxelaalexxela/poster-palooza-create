
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Template } from '@/store/usePosterStore';

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
}

const TemplateCard = ({ template, isSelected, onSelect }: TemplateCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative cursor-pointer w-24 h-36 md:w-28 md:h-40 rounded-2xl overflow-hidden transition-all duration-300 ${
        isSelected 
          ? 'bg-lime-100 ring-2 ring-lime-400' 
          : 'bg-[#e9f0fa] hover:drop-shadow-md'
      }`}
      aria-label={`Select ${template.name} template`}
    >
      <img
        src={template.image}
        alt={template.name}
        className="w-full h-full object-cover"
      />
      {isSelected && (
        <div className="absolute bottom-2 right-2 w-5 h-5 bg-lime-400 rounded-full flex items-center justify-center">
          <Check size={12} className="text-white" />
        </div>
      )}
    </motion.div>
  );
};

export default TemplateCard;

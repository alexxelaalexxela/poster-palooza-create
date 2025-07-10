import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Template } from '@/store/usePosterStore';

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
}

export default function TemplateCard({
  template,
  isSelected,
  onSelect,
}: TemplateCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      /* 🠖 largeur/hauteur : plus grand mobile, inchangé ≥ md */
      className={`relative cursor-pointer
        shrink-0 snap-start
        w-28 h-40                       /* mobile */
        md:w-28 md:h-40                 /* desktop inchangé */
        rounded-2xl overflow-hidden transition-all duration-300 shadow-lg
        ${isSelected
          ? 'bg-emerald-50 ring-2 ring-emerald-400 shadow-emerald-200/50'
          : 'bg-white hover:shadow-xl hover:shadow-indigo-100/30'
        }`}
      aria-label="Select template"
    >
      <img
        src={template.image}
        alt={template.name}
        className="w-full h-full object-cover"
      />

      {/* overlay : plus haut & texte + grand sur mobile */}
      <div className="absolute bottom-0 left-0 right-0
                      bg-gradient-to-t from-black/60 to-transparent
                      p-3 sm:p-2">
        <span className="text-sm sm:text-xs text-white font-medium">
          {template.name}
        </span>
      </div>

      {isSelected && (
        <>
          <div className="absolute inset-0 bg-emerald-400/20" />
          <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <Check size={14} className="text-white" />
          </div>
        </>
      )}
    </motion.div>
  );
}
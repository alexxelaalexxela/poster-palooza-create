
import { motion } from 'framer-motion';
import { buildNetlifyImageUrl, buildNetlifySrcSet } from '@/lib/utils';

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
          src={buildNetlifyImageUrl(template.image, { width: 400, quality: 75, fit: 'cover' })}
          srcSet={buildNetlifySrcSet(template.image, [200, 300, 400, 600], { quality: 75, fit: 'cover' })}
          sizes="(max-width: 640px) 45vw, 256px"
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          width={400}
          height={533}
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.src = template.image;
            try { (img as any).srcset = ''; } catch {}
            try { (img as any).sizes = ''; } catch {}
          }}
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

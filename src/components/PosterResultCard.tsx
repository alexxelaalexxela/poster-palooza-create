
import { motion } from 'framer-motion';
import Watermark from '@/components/Watermark';
import { useProfile } from '@/hooks/useProfile';
import { buildNetlifyImageUrl, buildNetlifySrcSet } from '@/lib/utils';

interface PosterResult {
  id: number;
  url: string;
}

interface PosterResultCardProps {
  result: PosterResult;
  index: number;
}

const PosterResultCard = ({ result, index }: PosterResultCardProps) => {
  const { profile } = useProfile();
  const isPaid = !!profile?.is_paid;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl overflow-hidden drop-shadow-lg hover:drop-shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {!isPaid && (
          <Watermark visible text="Aperçu • Neoma" opacity={0.12} tileSize={120} fontSize={14} />
        )}
        <img
          src={buildNetlifyImageUrl(result.url, { width: 800, quality: 75, fit: 'cover' })}
          srcSet={buildNetlifySrcSet(result.url, [400, 600, 800, 1000], { quality: 75, fit: 'cover' })}
          sizes="(max-width: 1024px) 50vw, 33vw"
          alt={`Generated poster ${result.id}`}
          className="w-full h-full object-cover select-none pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
          style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
          draggable={false}
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.src = result.url;
            try { (img as any).srcset = ''; } catch {}
            try { (img as any).sizes = ''; } catch {}
          }}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Poster #{result.id}</span>
          {/* Bouton de téléchargement retiré pour empêcher le download direct */}
        </div>
      </div>
    </motion.div>
  );
};

export default PosterResultCard;

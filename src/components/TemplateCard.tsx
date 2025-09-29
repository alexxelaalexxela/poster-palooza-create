import { motion } from "framer-motion";
import { buildNetlifyImageUrl, buildNetlifySrcSet } from "@/lib/utils";

interface Template {
  id: number;
  name: string;
  image: string;
  description: string;
}

interface TemplateCardProps {
  template: Template;
}

const TemplateCard = ({ template }: TemplateCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="group w-36 sm:w-40 md:w-44 shrink-0 snap-start"
    >
      {/* Cadre en bois rectangulaire */}
      <div className="relative">
        {/* Cadre extérieur - Effet bois */}
        <div 
          className="relative p-2 shadow-2xl group-hover:shadow-3xl transition-all duration-500"
          style={{
            background: `
              linear-gradient(135deg, 
                #8B4513 0%, 
                #A0522D 15%, 
                #CD853F 30%, 
                #D2691E 45%, 
                #A0522D 60%, 
                #8B4513 75%, 
                #654321 100%
              )
            `,
            borderRadius: '4px'
          }}
        >
          {/* Texture bois avec lignes */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(0,0,0,0.1) 2px,
                  rgba(0,0,0,0.1) 3px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 8px,
                  rgba(0,0,0,0.05) 8px,
                  rgba(0,0,0,0.05) 10px
                )
              `,
              borderRadius: '4px'
            }}
          />

          {/* Biseaux du cadre */}
          <div className="absolute inset-0 border-2 border-amber-900/40" style={{ borderRadius: '4px' }} />
          <div className="absolute inset-1 border border-amber-700/60" style={{ borderRadius: '2px' }} />

          {/* Passe-partout crème */}
          <div className="relative bg-gradient-to-br from-amber-50 to-stone-100 p-3 shadow-inner" style={{ borderRadius: '2px' }}>
            {/* Image du poster */}
            <div className="relative aspect-[2/3] overflow-hidden bg-white shadow-sm">
            <img
              src={buildNetlifyImageUrl(template.image, { width: 400, quality: 75, fit: 'inside' })}
              srcSet={buildNetlifySrcSet(template.image, [200, 300, 400, 600], { quality: 75, fit: 'inside' })}
              sizes="(max-width: 640px) 40vw, 176px"
              alt="Exemple de poster"
              className="w-full h-full object-contain"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              width={400}
              height={600}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.src = template.image;
                try { (img as any).srcset = ''; } catch {}
                try { (img as any).sizes = ''; } catch {}
              }}
            />
            </div>
          </div>

          {/* Ombre réaliste du cadre */}
          <div 
            className="absolute inset-0 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              filter: 'drop-shadow(0 10px 25px rgba(139, 69, 19, 0.3))',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* Ombre portée au sol */}
        <div 
          className="absolute -bottom-2 left-2 right-2 h-4 bg-gradient-to-b from-black/20 to-transparent blur-sm -z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500"
          style={{ borderRadius: '50%' }}
        />
      </div>
    </motion.div>
  );
};

export default TemplateCard;
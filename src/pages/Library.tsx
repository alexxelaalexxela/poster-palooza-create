import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { posterCatalog } from '@/lib/posterCatalog';
import { usePosterStore } from '@/store/usePosterStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SHIPPING_FEE_CENTS } from '@/lib/pricing';
import { Helmet } from 'react-helmet-async';
import { buildCanonical, truncate } from '@/lib/utils';

function formatPriceEUR(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(cents / 100);
}

export default function Library() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedLibraryPosterId, setSelectedLibraryPosterId } = usePosterStore();

  // State
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  // Hydrate from URL / localStorage on mount
  useEffect(() => {
    const id = searchParams.get('selectedPoster') || localStorage.getItem('selectedLibraryPosterId');
    if (id) setSelectedLibraryPosterId(id);
    
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle image loading
  const handleImageLoad = (id: string) => {
    setImageLoadingStates(prev => ({ ...prev, [id]: false }));
  };

  const handleImageLoadStart = (id: string) => {
    setImageLoadingStates(prev => ({ ...prev, [id]: true }));
  };

  // Items
  const items = useMemo(() => posterCatalog, []);

  const handleCustomize = (id: string) => {
    setSelectedLibraryPosterId(id);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('selectedPoster', id);
      return p;
    });
    navigate(`/?selectedPoster=${encodeURIComponent(id)}`);
  };

  const handleView = (id: string) => {
    navigate(`/posters/${id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Librairie d'affiches – Neoma Poster</title>
        <meta name="description" content={truncate("Explorez des affiches prêtes à acheter ou à personnaliser avec notre IA.", 160)} />
        <link rel="canonical" href={buildCanonical('/librairie')} />
        <meta property="og:title" content="Librairie d'affiches – Neoma Poster" />
        <meta property="og:description" content="Explorez des affiches prêtes à acheter ou à personnaliser avec notre IA." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={buildCanonical('/librairie')} />
      </Helmet>
      {/* Hero Section (sobre + un peu plus design) */}
      <section className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Librairie</h1>
              <div className="h-1 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-3 mb-4" />
              <p className="text-gray-600 max-w-2xl">
                Parcourez notre librairie d'affiches. Achetez-les telles quelles ou personnalisez-les à votre goût grâce à notre IA.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="p-4 lg:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Skeleton className="h-5 flex-1" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="w-4 h-4 rounded" />
                    ))}
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-10 rounded-lg" />
                    <Skeleton className="h-10 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
        </div>
        ) : (
          <>
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
            >
              {items.map((item, idx) => {
                const selected = selectedLibraryPosterId === item.id;
                const isHovered = hoveredId === item.id;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleView(item.id)}
                    className={`group relative rounded-2xl border cursor-pointer ${
                      selected 
                        ? 'border-indigo-500 ring-2 ring-indigo-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    } bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col transform hover:-translate-y-1`}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      {imageLoadingStates[item.id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                        </div>
                      )}
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        onLoadStart={() => handleImageLoadStart(item.id)}
                        onLoad={() => handleImageLoad(item.id)}
                      />
                      
                      {/* Overlay on hover */}
                      <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </div>
                      
                    {/* Top area cleaned (no badges/likes) */}
                    </div>

                    {/* Content */}
                    <div className="p-4 lg:p-5 flex flex-col flex-1">
                      {/* Rating on top */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={`${i < Math.round(item.rating) ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
                              fill={i < Math.round(item.rating) ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600">{item.rating} ({item.ratingCount} avis)</span>
                      </div>

                      {/* Price and primary action (stacked on mobile) */}
                      <div className="mb-3 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                        <div className="text-indigo-700 font-bold text-base sm:text-lg whitespace-nowrap">
                          {formatPriceEUR(Math.max(0, item.priceCents - SHIPPING_FEE_CENTS))}
                        </div>
                        <Button
                          onClick={(e) => { e.stopPropagation(); handleView(item.id); }}
                          variant="outline"
                          size="sm"
                          className="h-10 w-full sm:w-auto border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        >
                          Acheter
                        </Button>
                      </div>

                      {/* Helper text */}
                      <p className="text-xs text-gray-600 leading-snug mb-3 line-clamp-2">
                        Créez le vôtre dans ce style avec Neoma IA.
                      </p>

                      {/* Action */}
                      <div className="mt-auto">
                        <Button
                          onClick={(e) => { e.stopPropagation(); handleCustomize(item.id); }}
                          size="sm"
                          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Copier le style
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

          {/* Empty State */}
          {items.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune affiche trouvée
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Essayez de modifier vos critères de recherche ou explorez toute notre collection.
              </p>
              {/* No search controls anymore */}
            </motion.div>
          )}
        </>
        )}
      </section>

      {/* No purchase modal here anymore */}
    </div>
  );
}



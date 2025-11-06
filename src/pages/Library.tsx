import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { posterCatalog } from '@/lib/posterCatalog';
import { usePosterStore } from '@/store/usePosterStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, Loader2, Info, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SHIPPING_FEE_CENTS } from '@/lib/pricing';
import { Helmet } from 'react-helmet-async';
import { buildCanonical, truncate, buildNetlifyImageUrl, buildNetlifySrcSet } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  // Items + filters + ordering
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const items = useMemo(() => posterCatalog, []);
  const allLabels = useMemo(() => {
    const s = new Set<string>();
    items.forEach(i => (i.labels || []).forEach(l => s.add(l)));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [items]);
  const filtered = useMemo(() => {
    if (!selectedLabels.length) return items;
    return items.filter(i => (i.labels || []).some(l => selectedLabels.includes(l)));
  }, [items, selectedLabels]);
  const displayItems = filtered.slice(0, visibleCount);

  const toggleLabel = (l: string) => {
    setSelectedLabels((prev) => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
    // reset pagination on filter change
    setVisibleCount(24);
  };
  const clearLabels = () => { setSelectedLabels([]); setVisibleCount(24); };

  // Slider refs per card
  const sliderRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollSlider = (id: string, dir: 'next' | 'prev') => {
    const el = sliderRefs.current[id];
    if (!el) return;
    const width = el.clientWidth;
    const current = Math.round(el.scrollLeft / Math.max(1, width));
    const maxIndex = 1; // two images
    const next = dir === 'next' ? Math.min(current + 1, maxIndex) : Math.max(current - 1, 0);
    el.scrollTo({ left: next * width, behavior: 'smooth' });
  };

  const handleCustomize = (id: string) => {
    setSelectedLibraryPosterId(id);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('selectedPoster', id);
      return p;
    });
    navigate(`/?selectedPoster=${encodeURIComponent(id)}`);
    try { setTimeout(() => { window.dispatchEvent(new CustomEvent('promptbar:focus')); }, 0); } catch {}
  };

  const handleView = (id: string) => {
    // Persist scroll and pagination before leaving
    try {
      sessionStorage.setItem('library:focusId', id);
      sessionStorage.setItem('library:scrollTop', String(window.scrollY || window.pageYOffset || 0));
      sessionStorage.setItem('library:visibleCount', String(visibleCount));
      sessionStorage.setItem('library:labels', JSON.stringify(selectedLabels));
    } catch {}
    navigate(`/posters/${id}`);
  };

  // Restore filters/pagination on mount
  useEffect(() => {
    try {
      const rawLabels = sessionStorage.getItem('library:labels');
      if (rawLabels) {
        const parsed: string[] = JSON.parse(rawLabels);
        if (Array.isArray(parsed)) {
          setSelectedLabels(parsed);
        }
      }
      const savedCount = Number(sessionStorage.getItem('library:visibleCount') || '');
      if (Number.isFinite(savedCount) && savedCount > 24) {
        setVisibleCount(savedCount);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Prefer restoring to the focused poster id, else fallback to pixel scroll
    const focusId = sessionStorage.getItem('library:focusId');
    if (focusId) {
      // Ensure the focused card is loaded
      const focusIdx = filtered.findIndex((i) => i.id === focusId);
      if (focusIdx >= 0 && displayItems.length < (focusIdx + 1)) {
        setVisibleCount(focusIdx + 1);
        // do not return; keep trying below when items update
      }
      // Try repeatedly until element exists (layout/render may lag)
      let attempts = 0;
      const tryFocus = () => {
        attempts++;
        const el = document.querySelector(`[data-poster-id=\"${focusId}\"]`) as HTMLElement | null;
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'auto' });
          try { sessionStorage.removeItem('library:focusId'); } catch {}
          return;
        }
        if (attempts < 40) {
          requestAnimationFrame(tryFocus);
        }
      };
      requestAnimationFrame(tryFocus);
    }
    // Fallback: scrollTop
    const savedY = Number(sessionStorage.getItem('library:scrollTop') || '');
    const savedCount = Number(sessionStorage.getItem('library:visibleCount') || '');
    if (!Number.isFinite(savedY) || savedY <= 0) return;
    if (Number.isFinite(savedCount) && savedCount > 0 && displayItems.length < savedCount) return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedY, left: 0, behavior: 'auto' });
      try { sessionStorage.removeItem('library:scrollTop'); } catch {}
    });
  }, [filtered, displayItems.length, isLoading]);

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

        {/* Labels filter bar */}
        {allLabels.length > 0 && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={clearLabels}
              className={`rounded-full border px-3 py-1 text-xs ${selectedLabels.length===0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
            >
              Tous
            </button>
            {allLabels.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => toggleLabel(l)}
                className={`rounded-full border px-3 py-1 text-xs ${selectedLabels.includes(l) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
              >
                {l}
              </button>
            ))}
          </div>
        )}

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
              {displayItems.map((item, idx) => {
                const selected = selectedLibraryPosterId === item.id;
                const isHovered = hoveredId === item.id;
                
                return (
                  <motion.div
                    key={item.id}
                    data-poster-id={item.id}
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
                    {/* Image Container with slider (2 images) */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100" style={{ contentVisibility: 'auto', containIntrinsicSize: '300px 400px' }}>
                      {imageLoadingStates[item.id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                        </div>
                      )}
                      <div
                        className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory"
                        ref={(el) => { sliderRefs.current[item.id] = el; }}
                      >
                        <img 
                          src={buildNetlifyImageUrl(item.imageUrl, { width: 800, quality: 75 })}
                          srcSet={buildNetlifySrcSet(item.imageUrl, [400, 600, 800, 1000])}
                          sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 50vw"
                          alt={item.title}
                          className="w-full h-full object-cover shrink-0 snap-center transition-transform duration-300" 
                          onLoadStart={() => handleImageLoadStart(item.id)}
                          onLoad={() => handleImageLoad(item.id)}
                          loading={idx < 4 ? 'eager' : 'lazy'}
                          fetchPriority={idx < 2 ? 'high' : 'auto'}
                          decoding="async"
                          width={600}
                          height={800}
                        />
                        <img 
                          src={buildNetlifyImageUrl(item.imageOnlyUrl || item.imageUrl, { width: 800, quality: 75 })}
                          srcSet={buildNetlifySrcSet(item.imageOnlyUrl || item.imageUrl, [400, 600, 800, 1000])}
                          sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 50vw"
                          alt={`${item.title} — poster seul`}
                          className="w-full h-full object-contain bg-white shrink-0 snap-center transition-transform duration-300"
                          loading={idx < 4 ? 'eager' : 'lazy'}
                          decoding="async"
                          width={600}
                          height={800}
                        />
                      </div>
                      
                      {/* Overlay on hover */}
                      <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </div>
                      {/* Subtle arrows to hint horizontal sliding (clickable) */}
                      <button
                        type="button"
                        onMouseDown={(e) => { e.stopPropagation(); setHoveredId(null); }}
                        onClick={(e) => { e.stopPropagation(); scrollSlider(item.id, 'prev'); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/15 hover:bg-black/25 text-white/70 pointer-events-auto focus:outline-none focus:ring-0"
                        aria-label="Image précédente"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => { e.stopPropagation(); setHoveredId(null); }}
                        onClick={(e) => { e.stopPropagation(); scrollSlider(item.id, 'next'); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/15 hover:bg-black/25 text-white/70 pointer-events-auto focus:outline-none focus:ring-0"
                        aria-label="Image suivante"
                      >
                        <ChevronRight size={14} />
                      </button>
                      {/* Top-left rating overlay (all breakpoints) */}
                      {item.rating > 0 && (
                        <div className="absolute top-0 left-0 right-0 pointer-events-none">
                          <div className="bg-gradient-to-b from-black/75 via-black/30 to-transparent px-3 pt-3 pb-8">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={`${i < Math.round(item.rating) ? 'text-yellow-400' : 'text-white/40'}`}
                                    fill={i < Math.round(item.rating) ? 'currentColor' : 'none'}
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] text-white/90">{item.rating} ({item.ratingCount})</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Slider dots */}
                      <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 pointer-events-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      </div>
                      {/* Bottom overlay: price */}
                      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                        <div className="bg-gradient-to-t from-black/80 via-black/20 to-transparent px-3 pb-2 pt-10">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-white font-semibold text-sm whitespace-nowrap">
                              {formatPriceEUR(2000)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                    {/* Top area cleaned (no badges/likes) */}
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4 flex flex-col flex-1">
                      {/* Rating moved into image overlays */}
                      <div className="hidden" />

                      {/* Price and action moved into image overlays */}
                      <div className="hidden" />

                      {/* Helper text */}
                      <p className="mb-1 text-[11px] text-gray-600 text-center">Garde-le ainsi ou adapte-le à ton goût</p>

                      {/* Actions inline */}
                      <div className="mt-1 flex items-center justify-center gap-2">
                        <Button
                          onClick={(e) => { e.stopPropagation(); handleView(item.id); }}
                          size="sm"
                          className="h-8 sm:h-9 lg:h-10 px-2 sm:px-3 text-[11px] sm:text-xs rounded-full bg-white/90 text-gray-900 hover:bg-white shadow whitespace-nowrap"
                        >
                          Acheter
                        </Button>
                        <Button
                          onClick={(e) => { e.stopPropagation(); handleCustomize(item.id); }}
                          size="sm"
                          variant="ghost"
                          className="h-8 sm:h-9 lg:h-10 px-2 sm:px-3 text-[11px] sm:text-xs rounded-full bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200 shadow-none inline-flex items-center justify-center gap-1 whitespace-nowrap"
                        >
                          <span>Personnaliser</span>
                          <Sparkles size={12} />
                        </Button>
                      </div>
                      
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Load more */}
            {filtered.length > visibleCount && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount(c => c + 24)}
                  className="rounded-full border px-4 py-2 text-sm bg-white hover:bg-gray-50 border-gray-200"
                >
                  Afficher plus
                </button>
              </div>
            )}

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



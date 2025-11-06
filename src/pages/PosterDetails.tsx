import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { findPosterById } from '@/lib/posterCatalog';
import { usePosterStore, Format, Quality } from '@/store/usePosterStore';
import { motion } from 'framer-motion';
import { Star, ArrowLeft, Sparkles, ShoppingCart, Info, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPriceCents, SHIPPING_FEE_CENTS } from '@/lib/pricing';
import { Helmet } from 'react-helmet-async';
import { buildCanonical, truncate, buildNetlifyImageUrl, buildNetlifySrcSet } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function formatPriceEUR(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(cents / 100);
}

export default function PosterDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const poster = useMemo(() => findPosterById(id), [id]);

  const { setSelectedLibraryPosterId, setSelectedPosterUrl, setSelectedFormat, setSelectedQuality, applyPromoCode, promoApplied, promoPercent, promoCode } = usePosterStore();
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const scrollDetail = (dir: 'next' | 'prev') => {
    const el = sliderRef.current;
    if (!el) return;
    const width = el.clientWidth;
    const current = Math.round(el.scrollLeft / Math.max(1, width));
    const maxIndex = 1;
    const next = dir === 'next' ? Math.min(current + 1, maxIndex) : Math.max(current - 1, 0);
    el.scrollTo({ left: next * width, behavior: 'smooth' });
  };

  const [tempFormat, setTempFormat] = useState<Format>('A3');
  const [tempQuality, setTempQuality] = useState<Quality>('classic');
  const basePrice = useMemo(() => {
    if (!poster) return 0;
    const q = (tempQuality === 'paper2' ? 'premium' : tempQuality) as 'classic' | 'premium' | 'museum';
    try {
      const cents = getPriceCents(tempFormat as any, q);
      const minusShipping = Math.max(0, cents - SHIPPING_FEE_CENTS);
      return minusShipping;
    } catch {
      const fallback = poster.priceCents ?? 0;
      return Math.max(0, fallback - SHIPPING_FEE_CENTS);
    }
  }, [poster, tempFormat, tempQuality]);

  const computedPrice = useMemo(() => {
    const p = basePrice;
    const discounted = promoApplied && (promoPercent || 0) > 0
      ? Math.max(0, Math.round(p * (1 - (promoPercent! / 100))))
      : p;
    return discounted;
  }, [basePrice, promoApplied, promoPercent]);

  useEffect(() => {
    if (!poster) return;
    const img = new Image();
    img.src = poster.imageUrl;
  }, [poster]);

  // Apply promo automatically for next page (Order)
  useEffect(() => {
    try { applyPromoCode('FIRST100'); } catch {}
  }, [applyPromoCode]);

  if (!poster) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">Affiche introuvable</h1>
          <p className="text-gray-600">Cette affiche n'existe pas ou a été supprimée.</p>
          <Button onClick={() => navigate('/librairie')} variant="outline">Retour à la librairie</Button>
        </div>
      </div>
    );
  }

  const handleCustomize = () => {
    setSelectedLibraryPosterId(poster.id);
    navigate(`/?selectedPoster=${encodeURIComponent(poster.id)}`);
    try { setTimeout(() => { window.dispatchEvent(new CustomEvent('promptbar:focus')); }, 0); } catch {}
  };

  const handleOrder = () => {
    setSelectedLibraryPosterId(poster.id);
    setSelectedPosterUrl(poster.imageUrl);
    setSelectedFormat(tempFormat);
    setSelectedQuality(tempQuality);
    navigate('/order');
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{poster.title} – Affiche à personnaliser | Neoma Poster</title>
        <meta name="description" content={truncate(`Découvrez "${poster.title}" et personnalisez-la avec votre style. Qualité d'impression professionnelle.`)} />
        <link rel="canonical" href={buildCanonical(`/posters/${poster.id}`)} />
        <meta property="og:title" content={`${poster.title} – Affiche à personnaliser | Neoma Poster`} />
        <meta property="og:description" content={`Découvrez "${poster.title}" et personnalisez-la avec votre style.`} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={buildCanonical(`/posters/${poster.id}`)} />
        <meta property="og:image" content={buildCanonical(poster.imageUrl)} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: poster.title,
          image: [buildCanonical(poster.imageUrl)],
          description: `Affiche "+poster.title+" personnalisable, impression haute qualité`,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: poster.rating,
            reviewCount: poster.ratingCount
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            price: (computedPrice/100).toFixed(2),
            availability: 'https://schema.org/InStock',
            url: buildCanonical(`/posters/${poster.id}`)
          }
        })}</script>
      </Helmet>
      <section className="border-b border-gray-200 bg-white/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <button onClick={() => navigate('/librairie')} className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la librairie
          </button>
          <div className="text-sm text-gray-500">Poster</div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image slider (2 images) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-200">
              <div ref={sliderRef} className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory">
                <img
                  src={buildNetlifyImageUrl(poster.imageUrl, { width: 1200, quality: 80 })}
                  srcSet={buildNetlifySrcSet(poster.imageUrl, [600, 900, 1200, 1500])}
                  alt={poster.title}
                  className="w-full h-full object-cover shrink-0 snap-center"
                />
                <img
                  src={buildNetlifyImageUrl(poster.imageOnlyUrl || poster.imageUrl, { width: 1200, quality: 80 })}
                  srcSet={buildNetlifySrcSet(poster.imageOnlyUrl || poster.imageUrl, [600, 900, 1200, 1500])}
                  alt={`${poster.title} — poster seul`}
                  className="w-full h-full object-contain bg-white shrink-0 snap-center"
                />
              </div>
              {/* Subtle arrows to hint horizontal sliding (clickable) */}
              <button
                type="button"
                onClick={() => scrollDetail('prev')}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-black/15 hover:bg-black/25 text-white/70 focus:outline-none focus:ring-0"
                aria-label="Image précédente"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollDetail('next')}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-black/15 hover:bg-black/25 text-white/70 focus:outline-none focus:ring-0"
                aria-label="Image suivante"
              >
                <ChevronRight size={16} />
              </button>
              <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-black/70" />
                <span className="w-1.5 h-1.5 rounded-full bg-black/30" />
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-900">{poster.title}</h1>
              {poster.rating > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className={i < Math.round(poster.rating) ? '' : 'text-gray-300'} fill={i < Math.round(poster.rating) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{poster.rating} ({poster.ratingCount} avis)</span>
                </div>
              )}
              <div>
                {promoApplied && (promoPercent || 0) > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 line-through">{formatPriceEUR(basePrice)}</span>
                      <span className="text-2xl font-bold text-indigo-700">{formatPriceEUR(computedPrice)}</span>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5">
                      -{promoPercent}% {promoCode ? promoCode : ''}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-indigo-700">{formatPriceEUR(basePrice)}</span>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 leading-snug">
                  Personnalisez cette affiche à votre image grâce à l’IA.
                  <br />
                  Vous pouvez personnaliser les personnages, le lieu et les détails tout en conservant le style d’origine.
                </p>
                <div className="mt-2">
                
                  <Button onClick={handleCustomize} className="bg-indigo-600 hover:bg-indigo-700 inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Adapter pour vous avec l’IA</span>
                  </Button>
                  
                </div>
              </div>
              <p className="text-sm text-gray-500">
                ou achetez l'affiche telle quelle :
              </p>
            </div>

            {/* Format */}
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Format</h2>
              <div className="grid grid-cols-5 gap-2">
                {(['A4','A3','A2','A1','A0'] as Format[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTempFormat(f)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${tempFormat===f? 'border-indigo-600 bg-indigo-50 text-indigo-700':'border-gray-200 hover:border-indigo-300'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Qualité</h2>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full w-6 h-6 bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition"
                      aria-label="Infos sur les qualités"
                    >
                      <Info size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="start" className="w-80 rounded-xl p-4 shadow-lg">
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-900">Qualités d'impression</div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <Check className="mt-0.5 text-gray-400" size={16} />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">Classic</div>
                            <div className="text-xs text-gray-600">Papier 250 g/m² — bonne qualité standard.</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="mt-0.5 text-gray-400" size={16} />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">Premium</div>
                            <div className="text-xs text-gray-600">250 g/m² + laminé mat — anti‑reflets, couleurs plus denses.</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="mt-0.5 text-gray-400" size={16} />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">Museum</div>
                            <div className="text-xs text-gray-600">Papier premium 250 g/m² — rendu artistique, meilleure durabilité.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['classic','premium','museum'] as Quality[]).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setTempQuality(q)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize ${tempQuality===q? 'border-indigo-600 bg-indigo-50 text-indigo-700':'border-gray-200 hover:border-indigo-300'}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6">
              <Button onClick={handleOrder} className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Commander
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}



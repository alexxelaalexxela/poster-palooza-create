/* ──────────────────────────────────────────────────────────────
   PosterGallery.tsx – Responsive + mobile lightbox + mobile selection
   ────────────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Sparkles } from "lucide-react";
import { usePosterStore } from "@/store/usePosterStore";
import { UpgradeModal } from "@/components/UpgradeModal";
// Improve now routes back into PromptBar, so dialog is removed
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import Watermark from "@/components/Watermark";
import { buildNetlifyImageUrl, buildNetlifySrcSet } from "@/lib/utils";

export default function PosterGallery() {
  const {
    cachedUrls = [],
    generatedUrls = [],
    selectedPoster,
    setSelectedPoster,
    setSelectedPosterUrl,
    setImprovementRefUrl,
  } = usePosterStore();

  const navigate = useNavigate();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { profile } = useProfile();
  const isPaid = !!profile?.is_paid;

  // Si on a des nouveaux posters générés, on les sépare des anciens
  // Sinon, on affiche tous les posters comme "anciens"
  const cachedUrlsFiltered = generatedUrls.length > 0 
    ? cachedUrls.filter((url) => !generatedUrls.includes(url))
    : cachedUrls;

  const mergedUrls = [...generatedUrls, ...cachedUrlsFiltered];

  const noPosters = cachedUrlsFiltered.length === 0 && generatedUrls.length === 0;

  const offsetOld = generatedUrls.length;

  /* Lightbox state (mobile only) */
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  /* Pagination for old posters */
  const [visibleOldCount, setVisibleOldCount] = useState<number>(8);

  // No modal: clicking "Améliorer" sets improvementRefUrl and scrolls to PromptBar

  useEffect(() => {
    // Reset visible count when the cached list changes
    setVisibleOldCount(8);
  }, [cachedUrlsFiltered.length]);

  /* Close on ESC */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (noPosters) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-8 sm:mt-12 space-y-3 md:space-y-4"
      >
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white/80 backdrop-blur px-4 py-6 shadow-sm text-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
            Aucun poster généré pour le moment
          </h2>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            Utilise le champ au-dessus pour décrire ton idée et lancer la génération.
          </p>
        </div>
      </motion.section>
    );
  }



  //const posters = generatedUrls.map((url, i) => ({ id: `poster-${i}`, url }));
  //const postersOld = cachedUrlsFiltered.map((url, i) => ({ id: `poster-old-${i}`, url }));
  const basePreviewUrl = generatedUrls[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-5 md:space-y-6"
    >

      {generatedUrls.length > 0 && (
        <div>
          <h2 className="mt-8 text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-900">
            Posters générés 
          </h2>


          {/* Grid: 2 cols mobile, 2 ≥ md, 4 ≥ lg (if single on mobile → center and enlarge a bit) */}
          <div
            className={
              `mt-12 grid ${generatedUrls.length === 1 ? 'grid-cols-1 place-items-center md:grid-cols-2' : 'grid-cols-2 md:grid-cols-2'} lg:grid-cols-4 gap-4 md:gap-6`
            }
          >
            {generatedUrls.map((url, idx) => {
              const isSelected = selectedPoster === idx;
              return (
                <motion.div
                  key={`poster-${idx}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: isSelected ? 1.08 : 1 }}
                  whileHover={{ scale: isSelected ? 1.08 : 1.06 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className={`bg-white/80 backdrop-blur rounded-2xl select-none cursor-pointer
                   p-3 md:p-4 transition-transform duration-200 ease-out
                   ${isSelected
                      ? "border-2 border-indigo-500 bg-indigo-50/80 shadow-lg"
                      : "border border-[#c8d9f2] shadow-md"}
                 ${generatedUrls.length === 1 ? 'w-[65%] sm:w-[55%] md:w-auto' : ''}`}
                  onClick={() => {
                    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
                    // Toujours sélectionner
                    setSelectedPoster(idx);
                    setSelectedPosterUrl(url);
                    // Ouvrir l'aperçu plein écran uniquement sur mobile
                    if (!isDesktop) {
                      setLightboxIdx(idx);
                    }
                  }}
                >
                  <div className="relative aspect-[3/4] mb-2 md:mb-3 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
                    {!isPaid && (
                      <Watermark visible text="Aperçu • Neoma" opacity={0.12} tileSize={120} fontSize={14} />
                    )}
                    <img
                      src={buildNetlifyImageUrl(url, { width: 800, quality: 75, fit: 'inside' })}
                      srcSet={buildNetlifySrcSet(url, [400, 600, 800, 1000, 1200], { quality: 75, fit: 'inside' })}
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
                      alt={`Generated poster ${idx + 1}`}
                      className="w-full h-full object-contain select-none pointer-events-none"
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
                      draggable={false}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      fetchPriority={idx === 0 ? 'high' : 'auto'}
                      decoding="async"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.src = url;
                        try { (img as any).srcset = ''; } catch {}
                        try { (img as any).sizes = ''; } catch {}
                      }}
                    />
                    {/* Improve button overlay removed; handled via separate section */}
                  </div>
                </motion.div>
              );
            })}

            {/* Desktop-only blurred placeholders using the real poster (unpaid flow) */}
            {generatedUrls.length === 1 && basePreviewUrl && (
              Array.from({ length: 3 }).map((_, i) => {
                const tintImageClasses =
                  i === 0
                    ? "hue-rotate-15 saturate-150 brightness-95" // violet/rose
                    : i === 1
                    ? "hue-rotate-30 saturate-200 brightness-95" // jaune/rouge
                    : "hue-rotate-180 saturate-100 brightness-100"; // bleu (plus doux)
                const tintOverlayGradient =
                  i === 0
                    ? "from-indigo-200/20 to-fuchsia-200/10"
                  : i === 1
                    ? "from-amber-200/25 to-rose-200/10"
                    : "from-blue-200/30 to-sky-200/15";
                return (
                  <motion.div
                    key={`placeholder-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: (generatedUrls.length + i) * 0.05 }}
                    className="hidden md:block bg-white/80 backdrop-blur rounded-2xl p-3 md:p-4 border border-[#c8d9f2] shadow-md cursor-pointer"
                    onClick={() => setShowUpgrade(true)}
                    role="button"
                    aria-label="Voir plus - passer Premium"
                    title="Passer Premium"
                  >
                  <div className="relative aspect-[3/4] mb-2 md:mb-3 overflow-hidden rounded-lg bg-gray-100">
                      {/* Real poster preview, slightly less blurred with tint */}
                      <img
                        src={buildNetlifyImageUrl(basePreviewUrl, { width: 800, quality: 60, fit: 'cover' })}
                        srcSet={buildNetlifySrcSet(basePreviewUrl, [400, 600, 800, 1000], { quality: 60, fit: 'cover' })}
                        sizes="(max-width: 1024px) 45vw, 25vw"
                        alt="Aperçu floutté — déverrouillez pour voir les détails"
                        className={`w-full h-full object-cover scale-110 blur-lg ${tintImageClasses} select-none pointer-events-none`}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
                        draggable={false}
                        loading="lazy"
                        decoding="async"
                      />
                      {/* Soft gradient veil to ensure no details are visible */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/30" />
                      {/* Subtle color tint overlay to differentiate each slot */}
                      <div className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${tintOverlayGradient}`} />
                      {/* Extra multicolor overlays for the blue variant to make it less monotone */}
                      {i === 2 && (
                        <>
                          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-sky-200/15 via-cyan-200/10 to-indigo-200/15" />
                          <div className="absolute inset-0 pointer-events-none bg-gradient-to-bl from-rose-200/10 via-amber-200/10 to-emerald-200/10" />
                        </>
                      )}
                      {/* Premium CTA overlay */}
                      <div className="absolute inset-0 flex items-end justify-center p-3">
                        <div className="w-full max-w-[90%] rounded-xl border border-white/50 bg-white/70 backdrop-blur px-3 py-2 shadow-md flex items-center justify-center gap-2 hover:bg-white/80 transition">
                          <Crown className="text-yellow-600" size={16} />
                          <span className="text-[13px] font-semibold text-gray-900">Voir plus • Upgrade</span>
                          <Sparkles className="text-indigo-600" size={16} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {cachedUrlsFiltered.length > 0 && (
        <div>
          <h2 className="mt-12 text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-900">
            Anciens Posters
          </h2>

          {/* Grid: 2 cols mobile, 2 ≥ md, 4 ≥ lg */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {cachedUrlsFiltered.slice(0, visibleOldCount).map((url, idx) => {
              const globalIdx = offsetOld + idx;
              const isSelected = selectedPoster === globalIdx;
              return (
                <motion.div
                  key={`poster-old-${idx}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: isSelected ? 1.08 : 1 }}
                  whileHover={{ scale: isSelected ? 1.08 : 1.06 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className={`bg-white/80 backdrop-blur rounded-2xl select-none cursor-pointer
                   p-3 md:p-4 transition-transform duration-200 ease-out
                   ${isSelected
                      ? "border-2 border-indigo-500 bg-indigo-50/80 shadow-lg"
                      : "border border-[#c8d9f2] shadow-md"}
                 `}
                  onClick={() => {
                    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
                    // Toujours sélectionner
                    setSelectedPoster(globalIdx);
                    setSelectedPosterUrl(url);
                    // Ouvrir l'aperçu plein écran uniquement sur mobile
                    if (!isDesktop) {
                      setLightboxIdx(globalIdx);
                    }
                  }}
                >
                  <div className="relative aspect-[3/4] mb-2 md:mb-3 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
                    {!isPaid && (
                      <Watermark visible text="Aperçu • Neoma" opacity={0.12} tileSize={120} fontSize={14} />
                    )}
                    <img
                      src={url}
                      alt={`Generated poster ${idx + 1}`}
                      className="w-full h-full object-contain select-none pointer-events-none"
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
                      draggable={false}
                      loading="lazy"
                    />
                    {/* Improve button overlay removed; handled via separate section */}
                  </div>
                </motion.div>
              );
            })}
          </div>
          {visibleOldCount < cachedUrlsFiltered.length && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() =>
                  setVisibleOldCount((c) =>
                    Math.min(c + 8, cachedUrlsFiltered.length)
                  )
                }
                className="px-5 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Voir plus
              </button>
            </div>
          )}
        </div>
      )}



      {/* Lightbox: mobile only */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center md:hidden"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-[90vw] max-w-sm bg-white rounded-xl overflow-hidden shadow-lg"
            >
              <button
                onClick={() => setLightboxIdx(null)}
                className="absolute top-2 right-2 bg-white/80 backdrop-blur rounded-full p-1 text-gray-700"
                aria-label="Close preview"
              >
                <X size={20} />
              </button>
              {!isPaid && (
                <Watermark visible text="Aperçu • Neoma" opacity={0.12} tileSize={120} fontSize={14} />
              )}
              <img
                src={buildNetlifyImageUrl(mergedUrls[lightboxIdx!], { width: 1000, quality: 80, fit: 'inside' })}
                srcSet={buildNetlifySrcSet(mergedUrls[lightboxIdx!], [600, 800, 1000, 1200], { quality: 80, fit: 'inside' })}
                sizes="90vw"
                alt="Large preview"
                className="w-full h-auto object-contain select-none pointer-events-none"
                onContextMenu={(e) => e.preventDefault()}
                style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
                draggable={false}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  const fallback = mergedUrls[lightboxIdx!];
                  img.src = fallback;
                  try { (img as any).srcset = ''; } catch {}
                  try { (img as any).sizes = ''; } catch {}
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade modal, same as when limit reached during generation */}
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onSignup={() => { setShowUpgrade(false); navigate('/subscribe'); }}
      />

      {/* No dialog anymore */}
    </motion.section>
  );
}

/* ──────────────────────────────────────────────────────────────
   PosterGallery.tsx – Responsive + mobile lightbox + mobile selection
   ────────────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { usePosterStore } from "@/store/usePosterStore";

export default function PosterGallery() {
  const {
    generatedUrls = [],
    selectedPoster,
    setSelectedPoster,
  } = usePosterStore();

  /* Lightbox state (mobile only) */
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  /* Close on ESC */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!generatedUrls.length) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-5 md:space-y-6"
      >
        <h2 className="mt-8 text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-900">
          No posters generated yet
        </h2>
        <p className="text-center text-sm md:text-base text-gray-600">
          Generate your first poster using the prompt input above!
        </p>
      </motion.section>
    );
  }

  const posters = generatedUrls.map((url, i) => ({ id: `poster-${i}`, url }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-5 md:space-y-6"
    >
      <h2 className="mt-4 text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-900">
        Generated Posters
      </h2>

      {/* Grid: 2 cols mobile, 2 ≥ md, 4 ≥ lg */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {posters.map((p, idx) => {
          const isSelected = selectedPoster === idx;
          return (
            <motion.div
              key={p.id}
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
                setSelectedPoster(idx);
                // Ouvrir l'aperçu plein écran uniquement sur mobile
                if (!isDesktop) {
                  setLightboxIdx(idx);
                }
              }}
            >
              <div className="aspect-[3/4] mb-2 md:mb-3 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
                <img
                  src={p.url}
                  alt={`Generated poster ${idx + 1}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

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
              <img
                src={generatedUrls[lightboxIdx!]}
                alt="Large preview"
                className="w-full h-auto object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgePercent } from 'lucide-react';
import { usePosterStore } from '@/store/usePosterStore';

interface FloatingPromoProps {
  fixed?: boolean;
}

export default function FloatingPromo({ fixed = true }: FloatingPromoProps) {
  const { promoApplied, promoCode, promoPercent, applyPromoCode } = usePosterStore();
  const hasAutoAppliedRef = useRef(false);
  const wasAppliedRef = useRef<boolean>(false);

  // Auto-apply FIRST100 once per session unless opted out
  useEffect(() => {
    if (hasAutoAppliedRef.current) return;
    if (!promoApplied) {
      hasAutoAppliedRef.current = true;
      // slight delay to avoid layout jank on first paint
      const t = setTimeout(() => {
        applyPromoCode('FIRST100');
      }, 250);
      return () => clearTimeout(t);
    }
  }, [promoApplied, applyPromoCode]);

  // Detect when a promo was removed to remember last removed
  useEffect(() => {
    const isAppliedNow = promoApplied;
    if (wasAppliedRef.current && !isAppliedNow) {
      try {
        const code = (promoCode || 'FIRST100').toUpperCase();
        const percent = String(promoPercent || 50);
        localStorage.setItem('promo_last_removed_code', code);
        localStorage.setItem('promo_last_removed_percent', percent);
      } catch {}
    }
    wasAppliedRef.current = isAppliedNow;
  }, [promoApplied, promoCode, promoPercent]);

  const isPromoApplied = promoApplied;

  return (
    <>
      {/* Center small notice when a promo is applied */}
      <AnimatePresence>
        {isPromoApplied && (
          <motion.div
            key="center-notice"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className={fixed ? "fixed z-[60] inset-x-0 top-20" : "relative z-[10] w-full mt-4"}
          >
            <div className="w-full flex justify-center">
              <div className="group relative flex items-center gap-2 rounded-full border border-emerald-300/50 bg-white/80 backdrop-blur-md px-3.5 py-1.5 shadow-md">
                <div className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-400/40">
                  <BadgePercent size={14} />
                </div>
                <span className="text-[13px] font-medium text-emerald-800 tracking-tight">
                  {`Code ${(promoCode || 'FIRST100').toUpperCase()} appliqué : −${promoPercent || 50}%`}
                </span>
                <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-emerald-300/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



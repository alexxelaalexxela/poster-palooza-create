
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePosterStore } from '@/store/usePosterStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingCart } from 'lucide-react';

const OrderBar = () => {
  const { price, canOrder, selectedFormat, selectedQuality, selectedPoster, selectedPosterUrl, generatedUrls, cachedUrls } = usePosterStore();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const addItem = useCartStore((s) => s.addItem);

  const hasIncludedPlanActive = !!(user && profile?.is_paid && profile?.subscription_format && profile?.subscription_quality && !profile?.included_poster_selected_url);

  const handleOrder = () => {
    if (canOrder()) {
      navigate('/order');
    }
  };

  const handleAddToCart = () => {
    if (!canOrder()) return;
    const mergedUrls = [...generatedUrls, ...cachedUrls];
    const finalUrl = selectedPosterUrl ?? (selectedPoster != null ? mergedUrls[selectedPoster] : null);
    if (!finalUrl || !selectedFormat || !selectedQuality) {
      toast({ title: 'Sélection incomplète', description: 'Choisissez un poster, un format et une qualité.' });
      return;
    }
    addItem({ posterUrl: finalUrl, format: selectedFormat as any, quality: selectedQuality as any, quantity: 1 });
    toast({ title: 'Ajouté au panier', description: 'Le poster a été ajouté à votre panier.' });
  };

  if (selectedFormat === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="
    sticky bottom-0           /* reste collé en bas, sans chevaucher le footer */
    w-full                     /* largeur pleine dans le conteneur */
    md:bottom-4               /* petit espace bas sur desktop */
    md:w-[40rem] md:mx-auto   /* largeur fixée et centrée sur desktop */
    z-30 p-4
  "
    >
      <div className="bg-white/60 backdrop-blur rounded-2xl ring-1 ring-[#c8d9f2]
                  flex justify-between items-center gap-3 md:gap-4 p-3 md:p-4">
        <span className="text-lg md:text-xl font-semibold">
          {(() => {
            const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
            if (hasIncludedPlanActive) return `Prix : ${fmt.format(0)}`;
            return `Prix : ${fmt.format(price)}`;
          })()}
        </span>

        <div className="relative flex items-center gap-2 md:gap-3 flex-shrink-0">
          <button
            onClick={handleAddToCart}
            disabled={!canOrder()}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-indigo-200 text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter au panier</span>
            <span className="sm:hidden">Panier</span>
          </button>
          <button
            onClick={handleOrder}
            disabled={!canOrder()}
            className="px-5 md:px-7 py-2.5 md:py-3 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-500 whitespace-nowrap"
          >
            {hasIncludedPlanActive ? 'Use included poster' : 'Acheter'}
          </button>
          {selectedQuality === null && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={() =>
                    toast({ title: "Choisir la qualité en dessous" })
                  }
                  className="absolute inset-0 rounded-lg cursor-not-allowed"
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                Choisir la qualité en dessous
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </motion.div>

  );
};

export default OrderBar;

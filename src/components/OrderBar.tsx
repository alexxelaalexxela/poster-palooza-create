
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePosterStore } from '@/store/usePosterStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';

const OrderBar = () => {
  const { price, canOrder, selectedFormat, selectedQuality } = usePosterStore();
  const navigate = useNavigate();

  const handleOrder = () => {
    if (canOrder()) {
      navigate('/order');
    }
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
                  flex justify-between items-center gap-4 p-4">
        <span className="text-lg md:text-xl font-semibold">
          Price : {price} Euros
        </span>

        <div className="relative">
          <button
            onClick={handleOrder}
            disabled={selectedQuality === null}
            className="px-6 md:px-8 py-3 bg-indigo-500 text-white font-medium
                   rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-500"
          >
            Order
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

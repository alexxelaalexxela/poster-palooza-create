
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePosterStore } from '@/store/usePosterStore';

const OrderBar = () => {
  const { price, canOrder } = usePosterStore();
  const navigate = useNavigate();

  const handleOrder = () => {
    if (canOrder()) {
      navigate('/order');
    }
  };

  if (!canOrder()) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="
    fixed bottom-0 inset-x-0          /* mobile : full width */
    md:bottom-4                       /* petit espace bas desktop */
    md:inset-x-auto md:left-1/2       /* retire right-0 et centre le bloc */
    md:-translate-x-1/2 md:transform
    md:w-[40rem]                      /* largeur fixe (≈ 640 px) */
    z-40 p-4
  "
    >
      <div className="bg-white/60 backdrop-blur rounded-2xl ring-1 ring-[#c8d9f2]
                  flex justify-between items-center gap-4 p-4">
        <span className="text-lg md:text-xl font-semibold">
          Price : {price} Euros
        </span>

        <button
          onClick={handleOrder}
          className="px-6 md:px-8 py-3 bg-indigo-500 text-white font-medium
                 rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Order
        </button>
      </div>
    </motion.div>

  );
};

export default OrderBar;

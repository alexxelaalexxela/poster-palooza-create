
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
      className="fixed bottom-0 left-0 right-0 md:static md:w-1/2 md:mx-auto mt-12 p-4"
    >
      <div className="bg-white/60 backdrop-blur rounded-2xl ring-1 ring-[#c8d9f2] flex justify-between items-center p-4">
        <span className="text-xl font-semibold">
          Price : {price} AUD
        </span>
        <button
          onClick={handleOrder}
          className="px-8 py-3 text-white font-medium rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors"
          aria-label={`Order poster for ${price} AUD`}
        >
          Order
        </button>
      </div>
    </motion.div>
  );
};

export default OrderBar;

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const OrderConfirmation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-5xl font-extrabold text-indigo-800"
        >
          Merci ! Votre poster inclus a bien été enregistré
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-gray-700 text-lg"
        >
          Nous revenons vers vous pour finaliser l'expédition. Vous pouvez continuer à générer vos affiches Premium.
        </motion.p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Retour à l'accueil</Link>
          <Link to="/account" className="px-6 py-3 bg-white text-indigo-700 rounded-lg ring-1 ring-indigo-200 hover:bg-indigo-50">Voir mon compte</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;



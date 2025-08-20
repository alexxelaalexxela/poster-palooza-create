import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePosterStore } from '@/store/usePosterStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const SubscribeCheckout = () => {
  const navigate = useNavigate();
  const { selectedFormat, selectedQuality, price } = usePosterStore();
  const { user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const SHIPPING_FEE = 0; // forfait: livraison incluse, on conserve adresse au checkout stripe
  const totalWithShipping = Number((price + SHIPPING_FEE).toFixed(2));

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      // Créer la session Stripe pour un forfait (plan)
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? null;

      // L'Edge function créera pending_signups côté serveur si non connecté
      const res = await fetch(import.meta.env.VITE_SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          ...(token ? { 'X-Client-Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          purchaseType: 'plan',
          format: selectedFormat,
          quality: selectedQuality,
          email: user ? undefined : email,
          password: user ? undefined : password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création de la session');
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <Link to="/subscribe" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg w-full">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Récapitulatif de votre forfait</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Format:</span>
              <span className="font-medium">{selectedFormat}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Qualité:</span>
              <span className="font-medium">{selectedQuality}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Livraison:</span>
              <span className="font-medium">Incluse</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-gray-200">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-indigo-600">{totalWithShipping.toFixed(2)} €</span>
            </div>
          </div>

          {!user ? (
            <div className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Votre mot de passe" required />
              </div>
              <p className="text-xs text-gray-500">Votre compte sera créé après paiement et vous pourrez vous connecter avec ces identifiants.</p>
            </div>
          ) : (
            <p className="mt-6 text-sm text-gray-700">Vous êtes connecté en tant que <strong>{user.email}</strong>. Le forfait sera attaché à ce compte.</p>
          )}

          <Button onClick={handleConfirm} disabled={(!user && (!email || !password)) || !selectedFormat || !selectedQuality || isLoading} className="w-full py-3 text-lg font-medium bg-indigo-500 hover:bg-indigo-600 mt-6">
            Confirmer et payer
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscribeCheckout;



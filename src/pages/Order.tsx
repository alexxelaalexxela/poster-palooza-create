
import { motion } from 'framer-motion';
import { ArrowLeft, Check, CreditCard, MapPin, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePosterStore } from '@/store/usePosterStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Order = () => {
  const { selectedPoster, selectedFormat, selectedQuality, price, generatedUrls, cachedUrls } = usePosterStore();
  const mergedUrls = [...generatedUrls, ...cachedUrls];
  const { toast } = useToast();
  //const primaryUrl = generatedUrls[selectedPoster];
  //const fallbackUrl = cachedUrls[selectedPoster];   // ← nouvel accès
  //const finalUrl = primaryUrl ?? fallbackUrl;
  const finalUrl = mergedUrls[selectedPoster] ?? null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Connexion requise',
          description: 'Veuillez vous connecter pour procéder au paiement.',
          variant: 'destructive',
        });
        return;
      }

      if (!finalUrl) {
        toast({
          title: 'Image manquante',
          description: 'Aucune URL de poster disponible.',
          variant: 'destructive',
        });
        return;
      }

      const res = await fetch(
        import.meta.env.VITE_SUPABASE_FUNCTION_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            format: selectedFormat,
            quality: selectedQuality,
            posterUrl: finalUrl,
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;   // redirection Stripe Checkout
      } else {
        throw new Error(data.error || 'Erreur lors de la création de la session de paiement');
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: String(err),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to design
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Summary</h2>

            {/* Selected poster preview */}

            <div className="mb-6">
              {/* conteneur du poster */}
              <div
                className="aspect-[3/4] w-32 mx-auto mb-4 rounded-lg
               flex items-center justify-center     /* centre l’image */
               bg-black p-0.5"                       /* bordure noire fine */
              >

                {finalUrl ? (
                  <img
                    src={finalUrl}
                    alt={`Poster ${selectedPoster}`}
                    className="max-w-full max-h-full object-contain" /* plus de crop */
                  />
                ) : (
                  /* fallback */
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center rounded-md">
                    <span className="text-gray-500 text-sm">
                      Poster #{selectedPoster}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Format:</span>
                <span className="font-medium">{selectedFormat}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Quality:</span>
                <span className="font-medium">
                  {selectedQuality === 'classic'
                    ? 'Classic'
                    : selectedQuality === 'premium'
                      ? 'Premium'
                      : 'Museum'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-gray-200">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-indigo-600">{price} AUD</span>
              </div>
            </div>

            {/* Features included */}
            <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
              <h3 className="font-medium text-emerald-800 mb-2">Included:</h3>
              <ul className="space-y-2 text-sm text-emerald-700">
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  High-quality printing
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Fast shipping (5-7 business days)
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Protective packaging
                </li>
              </ul>
            </div>

            <Button
              onClick={handleSubmitOrder}
              className="w-full py-3 text-lg font-medium bg-indigo-500 hover:bg-indigo-600 mt-6"
            >
              Complete Order - {price} AUD
            </Button>
          </motion.div>

          {/* Checkout Form */}
          {/*<motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Checkout</h2>

            <form onSubmit={handleSubmitOrder} className="space-y-6">

              
              <div>
                <h3 className="flex items-center text-lg font-medium text-gray-800 mb-4">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="First name" required />
                  <Input placeholder="Last name" required />
                  <Input type="email" placeholder="Email address" className="md:col-span-2" required />
                  <Input type="tel" placeholder="Phone number" className="md:col-span-2" />
                </div>
              </div>

             
              <div>
                <h3 className="flex items-center text-lg font-medium text-gray-800 mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Address
                </h3>
                <div className="space-y-4">
                  <Input placeholder="Street address" required />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input placeholder="City" required />
                    <Input placeholder="State/Province" required />
                    <Input placeholder="Postal code" required />
                  </div>
                  <Input placeholder="Country" required />
                </div>
              </div>

              
              <div>
                <h3 className="flex items-center text-lg font-medium text-gray-800 mb-4">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </h3>
                <div className="space-y-4">
                  <Input placeholder="Card number" required />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="MM/YY" required />
                    <Input placeholder="CVC" required />
                  </div>
                  <Input placeholder="Cardholder name" required />
                </div>
              </div>

              
              <Button
                onClick={handleSubmitOrder}
                className="w-full py-3 text-lg font-medium bg-indigo-500 hover:bg-indigo-600"
              >
                Complete Order - {price} AUD
              </Button>
            </form>
            <Button
              onClick={handleSubmitOrder}
              className="w-full py-3 text-lg font-medium bg-indigo-500 hover:bg-indigo-600"
            >
              Complete Order - {price} AUD
            </Button>
          </motion.div>*/}
        </div>
      </div>
    </div>
  );
};

export default Order;

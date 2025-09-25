
import { motion } from 'framer-motion';
import { ArrowLeft, Check, CreditCard, MapPin, User, Package, Star, Shield, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePosterStore } from '@/store/usePosterStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useFingerprint } from '@/hooks/useFingerprint';
import Watermark from '@/components/Watermark';
import { createWatermarkedPreview } from '@/lib/watermarkPreview';
import { Helmet } from 'react-helmet-async';
import { buildCanonical } from '@/lib/utils';

const Order = () => {
  const { selectedPoster, selectedPosterUrl, selectedFormat, selectedQuality, price, generatedUrls, cachedUrls } = usePosterStore();
  const mergedUrls = [...generatedUrls, ...cachedUrls];
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, refresh } = useProfile();
  const visitorId = useFingerprint();
  //const primaryUrl = generatedUrls[selectedPoster];
  //const fallbackUrl = cachedUrls[selectedPoster];   // ← nouvel accès
  //const finalUrl = primaryUrl ?? fallbackUrl;
  const finalUrl = selectedPosterUrl ?? (selectedPoster != null ? mergedUrls[selectedPoster] : null);
  const SHIPPING_FEE = 4.99;
  const totalWithShipping = Number((price + SHIPPING_FEE).toFixed(2));
  const hasIncludedPlanActive = !!(user && profile?.is_paid && profile?.subscription_format && profile?.subscription_quality && !profile?.included_poster_selected_url);
  const shippingDisplay = hasIncludedPlanActive ? 0 : SHIPPING_FEE;
  const totalDisplay = hasIncludedPlanActive ? 0 : totalWithShipping;
  const canCheckout = !!user || !!visitorId;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!finalUrl) {
        toast({
          title: 'Image manquante',
          description: 'Aucune URL de poster disponible.',
          variant: 'destructive',
        });
        return;
      }

      // Crée une preview filigranée pour Stripe
      let posterPreviewDataUrl: string | null = null;
      try {
        posterPreviewDataUrl = await createWatermarkedPreview(finalUrl, {
          text: 'apercu Neoma',
          tile: 120,
          opacity: 0.18,
          fontSize: 14,
        });
      } catch {}

      if (hasIncludedPlanActive) {
        // No Stripe: store selected poster url as included poster and confirm
        const { error } = await supabase
          .from('profiles')
          .update({ included_poster_selected_url: finalUrl, included_poster_validated: false })
          .eq('id', user!.id);
        if (error) throw error;
        await refresh();
        window.location.href = '/order/confirmation';
        return;
      }

      // Default one-off poster purchase via Stripe
      const res = await fetch(
        import.meta.env.VITE_SUPABASE_FUNCTION_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'X-Client-Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            purchaseType: 'poster',
            format: selectedFormat,
            quality: selectedQuality,
            posterUrl: typeof finalUrl === 'string' && finalUrl.startsWith('data:') ? undefined : finalUrl,
            posterPreviewDataUrl: posterPreviewDataUrl ?? undefined,
            visitorId,
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
    <div className="min-h-screen relative overflow-hidden">
      <Helmet>
        <title>Commande – Neoma Poster</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={buildCanonical('/order')} />
      </Helmet>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div 
          className="absolute inset-0 animate-pulse opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              to="/"
              className="inline-flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au design
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Finaliser votre Commande</h1>
            <p className="text-white/80 text-lg">Vérifiez les détails de votre poster avant la commande</p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Poster Preview */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Votre Poster
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Poster Preview */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="relative aspect-[3/4] w-full max-w-xs mx-auto mb-4 rounded-lg bg-black/20 p-1 backdrop-blur-sm" onContextMenu={(e) => e.preventDefault()}>
                      {finalUrl ? (
                        <>
                          {!profile?.is_paid && (
                            <Watermark visible text="Aperçu • Neoma" opacity={0.12} tileSize={120} fontSize={14} />
                          )}
                          <img
                            src={finalUrl}
                            alt={`Poster ${selectedPoster}`}
                            className="w-full h-full object-contain rounded-md select-none pointer-events-none"
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center rounded-md">
                          <span className="text-white/60 text-sm">
                            Poster #{selectedPoster}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="text-white border-white/30">
                        Poster Sélectionné
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-3"
            >
              <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Récapitulatif de Commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-white/70">Format:</span>
                      <Badge variant="outline" className="text-white border-white/30">
                        {selectedFormat}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-white/70">Qualité:</span>
                      <Badge variant="outline" className="text-white border-white/30">
                        {selectedQuality === 'classic'
                          ? 'Classic'
                          : selectedQuality === 'premium'
                            ? 'Premium'
                            : 'Museum'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-white/70">Livraison:</span>
                      <span className="text-white font-medium">
                        {hasIncludedPlanActive ? 'Gratuite' : `${shippingDisplay.toFixed(2)} €`}
                      </span>
                    </div>
                  </div>

                  <Separator className="bg-white/20" />

                  {/* Total */}
                  <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-4 border border-white/20">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold text-lg">Total:</span>
                      <span className="text-3xl font-bold text-white">
                        {hasIncludedPlanActive ? 'Gratuit' : `${totalDisplay.toFixed(2)} €`}
                      </span>
                    </div>
                    {hasIncludedPlanActive && (
                      <p className="text-white/60 text-xs mt-1">Inclus dans votre abonnement Premium</p>
                    )}
                  </div>

                  {/* Features included */}
                  <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-green-300" />
                      <h3 className="font-medium text-green-200">Inclus dans votre commande:</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-green-200">
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3" />
                        <span>Impression haute qualité</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-3 h-3" />
                        <span>Livraison rapide (5-7 jours)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-3 h-3" />
                        <span>Emballage protecteur</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3 h-3" />
                        <span>Garantie qualité</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Button */}
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={!canCheckout}
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {canCheckout ? (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        {hasIncludedPlanActive 
                          ? 'Confirmer la Commande' 
                          : `Finaliser la Commande - ${totalDisplay.toFixed(2)} €`
                        }
                        <Star className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Initialisation...
                      </div>
                    )}
                  </Button>

                  {/* Security info */}
                  <div className="text-center">
                    <p className="text-white/60 text-xs">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Paiement 100% sécurisé avec Stripe
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;

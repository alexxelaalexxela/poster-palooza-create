import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Crown, Sparkles, ArrowRight, Package, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { buildCanonical } from '@/lib/utils';
import { trackEvent } from '@/lib/metaPixel';
import { trackTikTokEvent } from '@/lib/tiktokPixel';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Meta Pixel: Purchase
    try {
      const value = Number(localStorage.getItem('fb_last_purchase_value') || '0');
      const currency = localStorage.getItem('fb_last_purchase_currency') || 'EUR';
      const contentId = localStorage.getItem('fb_last_content_id') || undefined;
      const contentType = localStorage.getItem('fb_last_content_type') || undefined;
      trackEvent('Purchase', {
        value,
        currency,
        ...(contentId ? { content_ids: [contentId] } : {}),
        ...(contentType ? { content_type: contentType } : {}),
      });
      trackTikTokEvent('CompletePayment', {
        value,
        currency,
        ...(contentId ? { content_id: contentId } : {}),
        ...(contentType ? { content_type: contentType } : {}),
        ...(contentId
          ? {
              contents: [
                {
                  content_id: contentId,
                  content_type: contentType,
                  quantity: 1,
                  price: value,
                },
              ],
            }
          : {}),
      });
    } catch {}

    // Simuler un délai pour l'animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Confirmation de votre paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Helmet>
        <title>Abonnement confirmé – Neoma Poster</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={buildCanonical('/subscribe/success')} />
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Animation de succès */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Paiement Réussi !
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Félicitations ! Vous êtes maintenant membre Premium
            </p>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-lg font-semibold">
              <Crown className="w-5 h-5 mr-2" />
              Compte Premium Activé
            </Badge>
          </motion.div>

          {/* Cartes d'informations */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Avantages Premium */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 h-full">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    Vos Nouveaux Avantages
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                      <span className="text-gray-700">
                        <strong>15 générations</strong> - Créez autant de posters que vous voulez
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                      <span className="text-gray-700">
                        <strong>1 poster physique inclus</strong> - Livré gratuitement chez vous
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                      <span className="text-gray-700">
                        <strong>Qualité premium</strong> - Format et qualité sélectionnés
                      </span>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Prochaines étapes */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 h-full">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    Prochaines Étapes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Connectez-vous à votre compte</h4>
                          <p className="text-sm text-gray-600">Accédez à votre espace membre premium</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Créez vos posters</h4>
                          <p className="text-sm text-gray-600">Utilisez vos 15 générations mensuelles</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Sélectionnez votre poster</h4>
                          <p className="text-sm text-gray-600">Choisissez celui à recevoir gratuitement</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
              <CardContent className="p-8">
                <div className="mb-6">
                  <Sparkles className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Prêt à créer vos premiers posters premium ?
                  </h2>
                  <p className="text-gray-600">
                    Connectez-vous à votre compte pour commencer à utiliser vos nouveaux avantages
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/account')}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Accéder à mon compte
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Note de confirmation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-gray-500">
              Vous recevrez également un email de confirmation avec tous les détails de votre abonnement.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;

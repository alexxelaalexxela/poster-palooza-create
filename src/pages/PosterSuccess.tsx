import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Package, Clock, Truck, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { buildCanonical } from '@/lib/utils';

const PosterSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un délai pour l'animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Confirmation de votre commande...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <Helmet>
        <title>Commande confirmée – Neoma Poster</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={buildCanonical('/poster/success')} />
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
              Commande Confirmée !
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Merci pour votre achat ! Votre poster est en cours de préparation
            </p>
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 text-lg font-semibold">
              <Package className="w-5 h-5 mr-2" />
              Commande Validée
            </Badge>
          </motion.div>

          {/* Cartes d'informations */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Confirmation par email */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 h-full">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    Confirmation par Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">Email de confirmation envoyé</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            Vous recevrez bientôt un email avec tous les détails de votre commande, 
                            y compris le numéro de suivi une fois votre poster expédié.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                      <span>Vérifiez aussi vos spams si vous ne recevez rien</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                      <span>Support disponible si besoin d'aide</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Délais de livraison */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 h-full">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    Délais de Livraison
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="w-6 h-6 text-emerald-600" />
                        <span className="font-semibold text-gray-900">5-6 jours ouvrés</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Votre poster sera imprimé avec soin et expédié dans les meilleurs délais. 
                        La livraison prend généralement entre 5 et 6 jours ouvrés.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full"></div>
                        <span>Impression de qualité professionnelle</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full"></div>
                        <span>Emballage soigné pour éviter les dommages</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full"></div>
                        <span>Suivi de commande par email</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Timeline de traitement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  Suivi de votre Commande
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Étape 1 - Actuelle */}
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Commande Reçue</h4>
                    <p className="text-sm text-gray-600">Paiement confirmé</p>
                    <div className="w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mt-3"></div>
                  </div>

                  {/* Étape 2 */}
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">En Préparation</h4>
                    <p className="text-sm text-gray-600">Impression en cours</p>
                    <div className="w-full h-1 bg-gray-200 rounded-full mt-3"></div>
                  </div>

                  {/* Étape 3 */}
                  <div className="text-center opacity-60">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Truck className="w-6 h-6 text-gray-500" />
                    </div>
                    <h4 className="font-semibold text-gray-700 mb-1">Expédition</h4>
                    <p className="text-sm text-gray-500">En route vers vous</p>
                    <div className="w-full h-1 bg-gray-200 rounded-full mt-3"></div>
                  </div>

                  {/* Étape 4 */}
                  <div className="text-center opacity-60">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-gray-500" />
                    </div>
                    <h4 className="font-semibold text-gray-700 mb-1">Livré</h4>
                    <p className="text-sm text-gray-500">À votre adresse</p>
                    <div className="w-full h-1 bg-gray-200 rounded-full mt-3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center"
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
              <CardContent className="p-8">
                <div className="mb-6">
                  <Sparkles className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Envie de créer d'autres posters ?
                  </h2>
                  <p className="text-gray-600">
                    Découvrez notre abonnement premium pour créer jusqu'à 15 posters par mois
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/subscribe')}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Découvrir Premium
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Note de support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-gray-500">
              Une question sur votre commande ? Contactez-nous à{' '}
              <a href="mailto:Neoma.poster@gmail.com" className="text-emerald-600 hover:underline">
                Neoma.poster@gmail.com
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PosterSuccess;

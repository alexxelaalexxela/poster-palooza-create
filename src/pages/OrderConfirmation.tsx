import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, Truck, Mail, ArrowRight, Home, User, Sparkles, Clock, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { buildCanonical } from '@/lib/utils';

const OrderConfirmation = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Helmet>
        <title>Confirmation de commande – Neoma Poster</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={buildCanonical('/order/confirmation')} />
      </Helmet>
      {/* Animated background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-800">
        <div 
          className="absolute inset-0 animate-pulse opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Floating celebration orbs */}
        <div className="absolute top-1/4 left-1/5 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/5 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 backdrop-blur-sm rounded-full mb-6 border border-green-400/30 animate-success-pulse">
              <CheckCircle2 className="w-12 h-12 text-green-300" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="text-green-300">Parfait !</span> Commande reçue
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Votre commande est en cours de validation. Vous pouvez encore modifier votre poster ou adresse.
            </p>
          </div>

          {/* Order Status Card */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl mb-8 animate-slide-up">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-4 mb-8">
                <Package className="w-8 h-8 text-white" />
                <h2 className="text-3xl font-bold text-white">État de votre commande</h2>
              </div>
              
              {/* Progress Steps */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-300">Commande reçue</h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/20">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center animate-spin-slow">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Validation en cours</h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/20 opacity-60">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white/60" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white/60">Expédition</h3>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl mb-12 animate-slide-up-delayed-1">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white">Prochaines étapes</h3>
              </div>
              <div className="space-y-4 text-white/80 text-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-3"></div>
                  <p><strong className="text-white">Tant que la commande n'est pas validée</strong>, vous pouvez modifier votre poster sélectionné et votre adresse de livraison depuis votre compte</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-3"></div>
                  <p>Validation sous 24h puis impression haute qualité</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-3"></div>
                  <p>Email de suivi dès l'expédition</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="text-center animate-slide-up">
            <Link to="/account">
              <Button className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 group">
                <User className="w-5 h-5 mr-2" />
                Mon compte
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-12 animate-fade-in-delayed">
            <div className="inline-flex items-center gap-2 text-white/60 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Expédition depuis la France • Délai : 3-5 jours ouvrés</span>
            </div>
            <p className="text-white/50 text-xs mt-2">
              © 2025 Neoma Poster . Merci de nous faire confiance pour vos créations uniques.
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes success-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .animate-fade-in {
            animation: fade-in 1s ease-out;
          }
          
          .animate-fade-in-delayed {
            animation: fade-in 1s ease-out 0.8s both;
          }
          
          .animate-slide-up {
            animation: slide-up 0.8s ease-out 0.2s both;
          }
          
          .animate-slide-up-delayed-1 {
            animation: slide-up 0.8s ease-out 0.4s both;
          }
          
          .animate-slide-up-delayed-2 {
            animation: slide-up 0.8s ease-out 0.6s both;
          }
          
          .animate-success-pulse {
            animation: success-pulse 2s ease-in-out infinite;
          }
          
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
        `
      }} />
    </div>
  );
};

export default OrderConfirmation;




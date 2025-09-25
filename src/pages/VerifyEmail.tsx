// src/pages/VerifyEmail.tsx
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, MailCheck, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { buildCanonical } from '@/lib/utils';

export default function VerifyEmail() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Helmet>
        <title>Vérifier l'email – Neoma Poster</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={buildCanonical('/verifier-email')} />
      </Helmet>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Vérifiez votre e-mail</h1>
            <p className="text-white/80">Un lien d'activation vous a été envoyé</p>
          </div>

          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl animate-slide-up">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl font-semibold text-white">Activation du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="flex justify-center">
                <MailCheck className="w-12 h-12 text-white/90" />
              </div>
              <p className="text-white/90">Consultez votre boîte de réception et cliquez sur le lien pour vérifier votre adresse e-mail.</p>
              <p className="text-white/60 text-sm">Vous pouvez fermer cette page et revenir une fois la vérification effectuée.</p>
              <div className="flex justify-center">
                <Link to="/login">
                  <Button className="h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl group">
                    Aller à la connexion
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fade-in { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-slide-up { animation: slide-up 0.6s ease-out 0.2s both; }
          .animate-fade-in { animation: fade-in 0.8s ease-out; }
        `
      }} />
    </div>
  );
}



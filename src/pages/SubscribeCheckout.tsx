import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Shield, Check, X, Eye, EyeOff, Mail, Lock, CreditCard, Package, Star, Zap, Sparkles, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { buildCanonical } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePosterStore } from '@/store/usePosterStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const SubscribeCheckout = () => {
  const navigate = useNavigate();
  const { selectedFormat, selectedQuality, price } = usePosterStore();
  const { user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [error, setError] = useState('');

  const SHIPPING_FEE = 4.99; // Livraison express
  const totalWithShipping = Number((price + SHIPPING_FEE).toFixed(2));

  // Password validation
  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  };

  const { checks, score } = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleConfirm = async () => {
    try {
      setError('');
      
      if (!user && password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      
      if (!user && score < 3) {
        setError('Veuillez choisir un mot de passe plus fort');
        return;
      }
      
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
      setError(e instanceof Error ? e.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Helmet>
        <title>Abonnement – Paiement | Neoma Poster</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={buildCanonical('/subscribe/checkout')} />
      </Helmet>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div 
          className="absolute inset-0 animate-pulse opacity-30"
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
            <Link to="/subscribe" className="inline-flex items-center text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l'abonnement
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
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Finaliser votre Abonnement Premium</h1>
            <p className="text-white/80 text-lg">Une dernière étape avant de devenir membre Premium</p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Récapitulatif */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Récapitulatif
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Forfait Premium */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-semibold">Forfait Premium</span>
                    </div>
                    <div className="space-y-2 text-sm text-white/80">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        <span>15 générations premium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-3 h-3" />
                        <span>1 poster physique inclus</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3" />
                        <span>Qualité premium garantie</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-3 h-3" />
                        <span>Livraison express</span>
                      </div>
                    </div>
                  </div>

                  {/* Détails */}
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
                        {selectedQuality}
                      </Badge>
            </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-white/70">Livraison :</span>
                      <span className="text-white font-medium">4,99 €</span>
            </div>
          </div>

                  <Separator className="bg-white/20" />

                  {/* Total */}
                  <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-4 border border-white/20">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold text-lg">Total:</span>
                      <span className="text-3xl font-bold text-white">{totalWithShipping.toFixed(2)} €</span>
                    </div>
                    <p className="text-white/60 text-xs mt-1">Paiement sécurisé par Stripe</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Formulaire */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-3"
            >
              <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {user ? (
                      <>
                        <Shield className="w-5 h-5" />
                        Compte Connecté
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Créer votre Compte
                      </>
                    )}
                  </CardTitle>
                  <p className="text-white/70 text-sm">
                    {user 
                      ? `Connecté en tant que ${user.email}` 
                      : 'Votre compte sera créé après le paiement'
                    }
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
          {!user ? (
                    <div className="space-y-6">
                      {/* Email field */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/90 font-medium">
                          Adresse email
                        </Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white/70 transition-colors" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            className="pl-11 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:bg-white/15 transition-all duration-300 h-12"
                            required
                          />
                        </div>
                      </div>

                      {/* Password field */}
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-white/90 font-medium">
                          Mot de passe
                        </Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white/70 transition-colors" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setPasswordFocus(true)}
                            onBlur={() => setPasswordFocus(false)}
                            placeholder="Créez un mot de passe fort"
                            className="pl-11 pr-11 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:bg-white/15 transition-all duration-300 h-12"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        
                        {/* Password strength indicator */}
                        {(passwordFocus || password.length > 0) && (
                          <div className="bg-white/5 rounded-lg p-3 space-y-2 animate-slide-down">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-4 h-4 text-white/60" />
                              <span className="text-white/80 text-xs font-medium">Force du mot de passe</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className={`flex items-center gap-1 ${checks.length ? 'text-green-300' : 'text-white/50'}`}>
                                {checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                8+ caractères
                              </div>
                              <div className={`flex items-center gap-1 ${checks.uppercase ? 'text-green-300' : 'text-white/50'}`}>
                                {checks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                Majuscule
                              </div>
                              <div className={`flex items-center gap-1 ${checks.lowercase ? 'text-green-300' : 'text-white/50'}`}>
                                {checks.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                Minuscule
                              </div>
                              <div className={`flex items-center gap-1 ${checks.number ? 'text-green-300' : 'text-white/50'}`}>
                                {checks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                Chiffre
                              </div>
                            </div>
                            <div className="flex gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                  key={i}
                                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                    i <= score
                                      ? score < 2
                                        ? 'bg-red-400'
                                        : score < 4
                                        ? 'bg-yellow-400'
                                        : 'bg-green-400'
                                      : 'bg-white/20'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password field */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white/90 font-medium">
                          Confirmer le mot de passe
                        </Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white/70 transition-colors" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmez votre mot de passe"
                            className={`pl-11 pr-11 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:bg-white/15 transition-all duration-300 h-12 ${
                              confirmPassword.length > 0 && !passwordsMatch
                                ? 'border-red-400/50 focus:border-red-400/70'
                                : passwordsMatch
                                ? 'border-green-400/50 focus:border-green-400/70'
                                : ''
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {confirmPassword.length > 0 && (
                          <div className={`flex items-center gap-2 text-xs ${passwordsMatch ? 'text-green-300' : 'text-red-300'}`}>
                            {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {passwordsMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
                        <p className="text-blue-200 text-sm">
                          <Shield className="w-4 h-4 inline mr-2" />
                          Votre compte sera créé automatiquement après le paiement réussi.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-full">
                          <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                          <p className="text-green-200 font-medium">Compte vérifié</p>
                          <p className="text-green-200/80 text-sm">Le forfait sera attaché à votre compte existant</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error message */}
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 animate-shake">
                      <p className="text-red-200 text-sm">{error}</p>
              </div>
                  )}

                  {/* Submit button */}
                  <Button
                    onClick={handleConfirm}
                    disabled={
                      (!user && (!email || !password || !passwordsMatch || score < 3)) ||
                      !selectedFormat || 
                      !selectedQuality || 
                      isLoading
                    }
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Traitement en cours...
            </div>
          ) : (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Confirmer et Payer {totalWithShipping.toFixed(2)} €
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
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

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slide-down {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          .animate-slide-down {
            animation: slide-down 0.4s ease-out;
          }
          
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `
      }} />
    </div>
  );
};

export default SubscribeCheckout;



// src/pages/Register.tsx
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFingerprint } from '@/hooks/useFingerprint';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, UserPlus, Check, X, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { buildCanonical } from '@/lib/utils';

export default function Register() {
    const navigate = useNavigate();
    const visitorId = useFingerprint();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);

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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }
        
        if (score < 3) {
            setError('Veuillez choisir un mot de passe plus fort');
            return;
        }
        
        setIsLoading(true);
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { visitor_id_to_claim: visitorId }
            }
        });

        if (error) {
            setError(error.message);
        } else if (data.user) {
            // Associate visitor posters with the new user account
            if (visitorId) {
                await supabase
                    .from('visitor_posters')
                    .update({ user_id: data.user.id })
                    .eq('visitor_id', visitorId)
                    .is('user_id', null);
                
                // Update visitor_user_links to associate with new user
                await supabase
                    .from('visitor_user_links')
                    .update({ user_id: data.user.id })
                    .eq('visitor_id', visitorId);
            }
            navigate('/verifier-email');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            <Helmet>
                <title>Créer un compte – Neoma Poster</title>
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={buildCanonical('/register')} />
            </Helmet>
            {/* Animated background with different gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-800">
                <div 
                    className="absolute inset-0 animate-pulse"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zM30 10c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                ></div>
                
                {/* Floating geometric shapes */}
                <div className="absolute top-1/3 left-1/5 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl animate-pulse delay-300"></div>
                <div className="absolute bottom-1/3 right-1/5 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-2/3 right-1/2 w-56 h-56 bg-teal-500/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo/Brand section */}
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Rejoignez Neoma Poster </h1>
                        <p className="text-white/80">Commencez à créer des posters incroyables dès aujourd'hui</p>
                    </div>

                    {/* Register Card */}
                    <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl animate-slide-up">
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                <UserPlus className="w-6 h-6" />
                                Créer un compte
                            </CardTitle>
                            <p className="text-white/70 text-sm mt-2">Rejoignez des milliers de créateurs dans le monde</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleRegister} className="space-y-6">
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
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
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
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {confirmPassword.length > 0 && (
                                        <div className={`flex items-center gap-2 text-xs ${passwordsMatch ? 'text-green-300' : 'text-red-300'}`}>
                                            {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            {passwordsMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                                        </div>
                                    )}
                                </div>

                                {/* Error message */}
                                {error && (
                                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 animate-shake">
                                        <p className="text-red-200 text-sm text-center">{error}</p>
                                    </div>
                                )}

                                {/* Submit button */}
                                <Button
                                    type="submit"
                                    disabled={isLoading || !passwordsMatch || score < 3}
                                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Création du compte...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            Créer le compte
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </Button>

                                {/* Terms */}
                                <div className="text-center">
                                    <p className="text-white/60 text-xs">
                                        En créant un compte, vous acceptez nos{' '}
                                        <Link to="/terms" className="text-white/80 hover:text-white underline">
                                            Conditions d'utilisation
                                        </Link>{' '}
                                        et notre{' '}
                                        <Link to="/privacy" className="text-white/80 hover:text-white underline">
                                            Politique de confidentialité
                                        </Link>
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/20"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-transparent text-white/60">ou</span>
                                    </div>
                                </div>

                                {/* Login link */}
                                <div className="text-center">
                                    <p className="text-white/70 text-sm">
                                        Vous avez déjà un compte ?{' '}
                                        <Link
                                            to="/login"
                                            className="text-white font-semibold hover:text-emerald-200 transition-colors hover:underline"
                                        >
                                            Se connecter
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="text-center mt-8 text-white/50 text-xs">
                        <p>© 2025 Neoma Poster. Libérer la créativité dans le monde entier.</p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes fade-in {
                        from { opacity: 0; transform: translateY(-20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    
                    @keyframes slide-up {
                        from { opacity: 0; transform: translateY(40px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    
                    @keyframes slide-down {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                    
                    .animate-fade-in {
                        animation: fade-in 0.8s ease-out;
                    }
                    
                    .animate-slide-up {
                        animation: slide-up 0.6s ease-out 0.2s both;
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
}
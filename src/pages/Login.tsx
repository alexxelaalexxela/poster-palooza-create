// src/pages/Login.tsx
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, User } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            setError(error.message);
        } else {
            navigate('/account');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
                <div 
                    className="absolute inset-0 animate-pulse"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                ></div>
                
                {/* Floating orbs */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo/Brand section */}
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Poster Palooza</h1>
                        <p className="text-white/80">Créez des posters uniques avec l'IA</p>
                    </div>

                    {/* Login Card */}
                    <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl animate-slide-up">
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                <User className="w-6 h-6" />
                                Bon retour
                            </CardTitle>
                            <p className="text-white/70 text-sm mt-2">Connectez-vous pour continuer votre parcours créatif</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleLogin} className="space-y-6">
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
                                            placeholder="Entrez votre mot de passe"
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
                                    disabled={isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Connexion...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            Se connecter
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </Button>

                                {/* Forgot password link */}
                                <div className="text-center">
                                    <Link
                                        to="/mot-de-passe-oublie"
                                        className="text-white/70 hover:text-white text-sm transition-colors hover:underline"
                                    >
                                        Mot de passe oublié ?
                                    </Link>
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

                                {/* Register link */}
                                <div className="text-center">
                                    <p className="text-white/70 text-sm">
                                        Pas encore de compte ?{' '}
                                        <Link
                                            to="/register"
                                            className="text-white font-semibold hover:text-purple-200 transition-colors hover:underline"
                                        >
                                            Créer un compte
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="text-center mt-8 text-white/50 text-xs">
                        <p>© 2025 Poster Palooza. Créé pour les créateurs.</p>
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
                    
                    .animate-shake {
                        animation: shake 0.5s ease-in-out;
                    }
                `
            }} />
        </div>
    );
}
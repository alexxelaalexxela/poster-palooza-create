// src/pages/ResetPassword.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Sparkles, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { buildCanonical } from '@/lib/utils';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Demande à l'utilisateur de mettre à jour son mot de passe si il vient du lien de reset
        // Supabase gère la session temporaire automatiquement via le lien magic
        // Rien à faire ici tant que la page est protégée par supabase-js
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setIsLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        setIsLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            <Helmet>
                <title>Réinitialiser le mot de passe – Neoma Poster</title>
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={buildCanonical('/reinitialiser-mot-de-passe')} />
            </Helmet>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-800" />

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Définir un nouveau mot de passe</h1>
                        <p className="text-white/80">Entrez un nouveau mot de passe sécurisé</p>
                    </div>

                    <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl animate-slide-up">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-xl font-semibold text-white">Réinitialisation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {success ? (
                                <div className="space-y-6 text-center">
                                    <div className="flex justify-center">
                                        <Check className="w-12 h-12 text-green-300" />
                                    </div>
                                    <p className="text-white/90">Votre mot de passe a été mis à jour.</p>
                                    <p className="text-white/60 text-sm">Redirection vers la connexion...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-white/90 font-medium">Nouveau mot de passe</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white/70" />
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="8+ caractères"
                                                className="pl-11 pr-11 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:bg-white/15 h-12"
                                                required
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirm" className="text-white/90 font-medium">Confirmer le mot de passe</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white/70" />
                                            <Input
                                                id="confirm"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Retapez votre mot de passe"
                                                className="pl-11 pr-11 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:bg-white/15 h-12"
                                                required
                                            />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 animate-shake">
                                            <p className="text-red-200 text-sm text-center">{error}</p>
                                        </div>
                                    )}

                                    <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-xl">
                                        {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                                    </Button>

                                    <div className="text-center">
                                        <Link to="/login" className="text-white/70 hover:text-white text-sm hover:underline">Retour</Link>
                                    </div>
                                </form>
                            )}
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
                    .animate-shake { animation: shake 0.5s ease-in-out; }
                    @keyframes shake { 0%,100%{ transform: translateX(0)} 25%{ transform: translateX(-5px)} 75%{ transform: translateX(5px)} }
                `
            }} />
        </div>
    );
}



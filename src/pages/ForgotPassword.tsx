// src/pages/ForgotPassword.tsx
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { buildCanonical } from '@/lib/utils';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reinitialiser-mot-de-passe',
        });

        if (error) {
            setError(error.message);
        } else {
            setSent(true);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            <Helmet>
                <title>Mot de passe oublié – Neoma Poster</title>
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={buildCanonical('/mot-de-passe-oublie')} />
            </Helmet>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800" />

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Mot de passe oublié</h1>
                        <p className="text-white/80">Recevez un lien sécurisé pour réinitialiser votre mot de passe</p>
                    </div>

                    <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl animate-slide-up">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-xl font-semibold text-white">Réinitialisation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {sent ? (
                                <div className="space-y-6 text-center">
                                    <div className="flex justify-center">
                                        <CheckCircle2 className="w-12 h-12 text-green-300" />
                                    </div>
                                    <p className="text-white/90">Un lien de réinitialisation a été envoyé à <span className="font-semibold">{email}</span>.</p>
                                    <p className="text-white/60 text-sm">Vérifiez vos emails et suivez les instructions.</p>
                                    <div className="text-white/70 text-sm">
                                        <p>Pas reçu ? Vérifiez vos spams ou {' '}
                                            <button onClick={() => setSent(false)} className="underline hover:text-white">renvoyez le lien</button>.
                                        </p>
                                    </div>
                                    <div>
                                        <Link to="/login" className="text-white hover:underline">Retour à la connexion</Link>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-white/90 font-medium">Adresse email</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white/70" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="vous@exemple.com"
                                                className="pl-11 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:bg-white/15 h-12"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 animate-shake">
                                            <p className="text-red-200 text-sm text-center">{error}</p>
                                        </div>
                                    )}

                                    <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl group">
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Envoi...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                Envoyer le lien
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        )}
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



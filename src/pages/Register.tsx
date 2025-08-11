// src/pages/Register.tsx
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';

// Voici la bonne façon, avec un import par fichier de composant
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFingerprint } from '@/hooks/useFingerprint';

export default function Register() {
    const navigate = useNavigate();
    const visitorId = useFingerprint(); // Récupère l'empreinte visiteur
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // On passe l'ID visiteur pour l'associer côté serveur
                data: { visitor_id_to_claim: visitorId }
            }
        });

        if (error) {
            setError(error.message);
        } else if (data.user) {
            // Associer les posters au nouvel utilisateur
            await supabase.rpc('claim_visitor_posters', { p_visitor_id: visitorId, p_user_id: data.user.id });
            navigate('/account');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create your Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="6+ characters"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <Button type="submit" className="w-full">
                            Create Account
                        </Button>
                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-indigo-600 hover:underline">
                                Login
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
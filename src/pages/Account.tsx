// src/pages/Account.tsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePosterStore } from '@/store/usePosterStore';
import { AttemptsCounter } from '@/components/AttemptsCounter';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, CreditCard } from 'lucide-react';

const POSTERS_PER_PAGE = 8; // On charge 8 posters à la fois

export default function Account() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { setSelectedPoster } = usePosterStore();

    const [posters, setPosters] = useState<{ url: string }[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [postersLoading, setPostersLoading] = useState(false);
    const [profile, setProfile] = useState<{ is_paid: boolean; generations_remaining: number } | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('is_paid, generations_remaining')
            .eq('id', user.id)
            .single();

        if (!error && data) {
            setProfile(data);
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Redirige vers /login si déconnecté (après que l'état d'auth soit connu)
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login', { replace: true });
        }
    }, [loading, user, navigate]);

    const fetchPosters = useCallback(async (currentPage: number) => {
        if (!user || postersLoading) return;

        setPostersLoading(true);

        const from = currentPage * POSTERS_PER_PAGE;
        const to = from + POSTERS_PER_PAGE - 1;

        const { data, error } = await supabase
            .from('visitor_posters')
            .select('url')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error fetching posters:", error);
        } else if (data) {
            // Si on reçoit moins de posters que la taille de la page, c'est qu'il n'y en a plus.
            if (data.length < POSTERS_PER_PAGE) {
                setHasMore(false);
            }
            // On ajoute les nouveaux posters à la liste existante
            setPosters(prev => [...prev, ...data]);
        }
        setPostersLoading(false);
    }, [user, postersLoading]);

    // Effet pour charger la première page
    useEffect(() => {
        fetchPosters(0);
    }, [user]); // Déclenché uniquement lorsque l'utilisateur change

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosters(nextPage);
    };

    const handleOrder = (index: number) => {
        setSelectedPoster(index); // On stocke l'index global du poster
        navigate('/order');
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
        );
    }

    if (!user) {
        return null; // redirection en cours
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">My Account</h1>
                    <p className="text-gray-600">Welcome, {user?.email}</p>
                </div>
                <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div>

            {/* Informations du compte */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200"
            >
                <h2 className="text-xl font-semibold mb-4">Account Status</h2>
                
                {/* Compteur de tentatives */}
                <div className="mb-4">
                    <AttemptsCounter />
                </div>

                {/* Statut de paiement */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {profile?.is_paid ? (
                        <>
                            <Sparkles size={20} className="text-yellow-500" />
                            <span className="text-green-700 font-medium">Premium Account</span>
                            <span className="text-sm text-gray-600">15 générations par mois</span>
                        </>
                    ) : (
                        <>
                            <AlertCircle size={20} className="text-blue-500" />
                            <span className="text-blue-700 font-medium">Free Account</span>
                            <span className="text-sm text-gray-600">3 générations gratuites</span>
                        </>
                    )}
                </div>

                {/* Bouton d'upgrade si non payé */}
                {profile && !profile.is_paid && (
                    <div className="mt-4">
                        <Button 
                            onClick={() => navigate('/pricing')}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                            <CreditCard size={16} className="mr-2" />
                            Upgrade to Premium
                        </Button>
                    </div>
                )}
            </motion.div>

            <h2 className="text-2xl font-bold mt-8">My Posters</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {posters.map((poster, index) => (
                    <div key={index} className="group relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                        <img
                            src={poster.url}
                            alt={`Poster ${index + 1}`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button onClick={() => handleOrder(index)}>
                                Commander
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && (
            <div className="text-center mt-8">
                    <Button onClick={handleLoadMore} disabled={postersLoading}>
                        {postersLoading ? 'Loading...' : 'Load More'}
                    </Button>
                </div>
            )}
        </div>
    );
}
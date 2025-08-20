// src/pages/Account.tsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePosterStore } from '@/store/usePosterStore';
import { AttemptsCounter } from '@/components/AttemptsCounter';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, CreditCard, CheckCircle, Clock, Pencil } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

const POSTERS_PER_PAGE = 8; // On charge 8 posters à la fois

export default function Account() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { setSelectedPoster } = usePosterStore();
    const { profile, loading: profileLoading, refresh } = useProfile();

    const [posters, setPosters] = useState<{ url: string }[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [postersLoading, setPostersLoading] = useState(false);

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

    const handleChangeIncludedPoster = async () => {
        if (!user) return;
        if (profile?.included_poster_validated) return; // Sécurité : modification impossible si validé
        const confirmed = window.confirm('Voulez-vous modifier votre poster sélectionné ? Vous pourrez en choisir un autre ensuite.');
        if (!confirmed) return;
        const { error } = await supabase
            .from('profiles')
            .update({ included_poster_selected_url: null, included_poster_validated: null })
            .eq('id', user.id);
        if (error) {
            console.error('Error resetting included poster:', error);
            return;
        }
        await refresh();
        // L'utilisateur peut maintenant choisir un nouveau poster dans la grille ci-dessous
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

            {/* Poster sélectionné (si déjà choisi via l'offre incluse) */}
            {profile?.included_poster_selected_url && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200"
                >
                    <h2 className="text-xl font-semibold mb-4">Votre poster sélectionné</h2>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-40 h-56 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            <img
                                src={profile.included_poster_selected_url}
                                alt="Poster sélectionné"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="mb-4">
                                {profile.included_poster_validated ? (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm">
                                        <CheckCircle size={16} /> Validé
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">
                                        <Clock size={16} /> En cours de validation
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                                <div>
                                    <span className="text-gray-500">Format</span>
                                    <div className="font-medium">{profile.subscription_format ?? '—'}</div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Qualité</span>
                                    <div className="font-medium">{profile.subscription_quality ?? '—'}</div>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3">
                                {!profile.included_poster_validated && (
                                    <Button onClick={handleChangeIncludedPoster} variant="outline" className="flex items-center gap-2">
                                        <Pencil size={16} /> Modifier le poster
                                    </Button>
                                )}
                                {profile.included_poster_validated && (
                                    <Button disabled variant="outline" className="cursor-not-allowed opacity-80">
                                        Modification verrouillée
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

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
// src/pages/Account.tsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePosterStore } from '@/store/usePosterStore';

const POSTERS_PER_PAGE = 8; // On charge 8 posters à la fois

export default function Account() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { setSelectedPoster } = usePosterStore();

    const [posters, setPosters] = useState<{ url: string }[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchPosters = useCallback(async (currentPage: number) => {
        if (!user || loading) return;

        setLoading(true);

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
        setLoading(false);
    }, [user, loading]);

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

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">My Account</h1>
                    <p className="text-gray-600">Welcome, {user?.email}</p>
                </div>
                <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div>

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
                    <Button onClick={handleLoadMore} disabled={loading}>
                        {loading ? 'Loading...' : 'Load More'}
                    </Button>
                </div>
            )}
        </div>
    );
}
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUnifiedPosters } from '@/hooks/useUnifiedPosters';

const POSTERS_PER_PAGE = 8; // On charge 8 posters à la fois

export default function Account() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { setSelectedPoster, setSelectedPosterUrl, generatedUrls, cachedUrls } = usePosterStore();
    const { profile, loading: profileLoading, refresh } = useProfile();
    const [editOpen, setEditOpen] = useState(false);
    const [form, setForm] = useState({
        shipping_name: '',
        shipping_address_line1: '',
        shipping_address_line2: '',
        shipping_city: '',
        shipping_postal_code: '',
        shipping_country: '',
    });

    useEffect(() => {
        if (profile) {
            setForm({
                shipping_name: profile.shipping_name || '',
                shipping_address_line1: profile.shipping_address_line1 || '',
                shipping_address_line2: profile.shipping_address_line2 || '',
                shipping_city: profile.shipping_city || '',
                shipping_postal_code: profile.shipping_postal_code || '',
                shipping_country: profile.shipping_country || '',
            });
        }
    }, [profile]);

    const { posters: allPosters, loading: postersLoading } = useUnifiedPosters();
    const [page, setPage] = useState(0);
    const [visibleCount, setVisibleCount] = useState(POSTERS_PER_PAGE);

    // Redirige vers /login si déconnecté (après que l'état d'auth soit connu)
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login', { replace: true });
        }
    }, [loading, user, navigate]);

    // Posters paginés pour l'affichage
    const visiblePosters = allPosters.slice(0, visibleCount);
    const hasMore = visibleCount < allPosters.length;

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + POSTERS_PER_PAGE);
    };

    const handleOrder = (url: string) => {
        const merged = [...generatedUrls, ...cachedUrls];
        const idx = merged.findIndex(u => u === url);
        setSelectedPoster(idx >= 0 ? idx : null);
        setSelectedPosterUrl(url ?? null);
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

            {/* Ma commande (poster + livraison) - affichée seulement si poster sélectionné */}
            {profile?.included_poster_selected_url && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-8 p-6 rounded-2xl border shadow-sm bg-white"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Ma commande</h2>
                    <div>
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
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Poster */}
                    <div className="p-4 rounded-xl border bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Poster sélectionné</h3>
                            <div />
                        </div>

                        {profile?.included_poster_selected_url ? (
                            <>
                                <div className="flex items-start gap-4">
                                    <div className="w-28 h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                        <img src={profile.included_poster_selected_url} alt="Poster sélectionné" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-2 text-sm text-gray-700">
                                        <div>
                                            <div className="text-gray-500">Format</div>
                                            <div className="font-medium">{profile.subscription_format ?? '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Qualité</div>
                                            <div className="font-medium">{profile.subscription_quality ?? '—'}</div>
                                        </div>
                                    </div>
                                </div>
                                {!profile.included_poster_validated && (
                                    <div className="mt-4">
                                        <Button onClick={handleChangeIncludedPoster} variant="outline" className="flex items-center gap-2">
                                            <Pencil size={16} /> Modifier le poster
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-sm text-gray-500">Aucun poster sélectionné pour l’instant.</div>
                        )}
                    </div>

                    {/* Adresse de livraison */}
                    <div className="p-4 rounded-xl border bg-gradient-to-br from-gray-50 to-white relative">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Adresse de livraison</h3>
                            {!profile?.included_poster_validated && (
                                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline">Modifier</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Modifier l’adresse de livraison</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-3 mt-4">
                                            <Input placeholder="Nom complet" value={form.shipping_name} onChange={e => setForm(f => ({ ...f, shipping_name: e.target.value }))} />
                                            <Input placeholder="Adresse (ligne 1)" value={form.shipping_address_line1} onChange={e => setForm(f => ({ ...f, shipping_address_line1: e.target.value }))} />
                                            <Input placeholder="Adresse (ligne 2)" value={form.shipping_address_line2} onChange={e => setForm(f => ({ ...f, shipping_address_line2: e.target.value }))} />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <Input placeholder="Ville" value={form.shipping_city} onChange={e => setForm(f => ({ ...f, shipping_city: e.target.value }))} />
                                                <Input placeholder="Code postal" value={form.shipping_postal_code} onChange={e => setForm(f => ({ ...f, shipping_postal_code: e.target.value }))} />
                                                <Input placeholder="Pays" value={form.shipping_country} onChange={e => setForm(f => ({ ...f, shipping_country: e.target.value }))} />
                                            </div>
                                            <div className="flex justify-end gap-3 mt-2">
                                                <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
                                                <Button onClick={async () => {
                                                    if (!user) return;
                                                    const { error } = await supabase
                                                        .from('profiles')
                                                        .update({
                                                            shipping_name: form.shipping_name || null,
                                                            shipping_address_line1: form.shipping_address_line1 || null,
                                                            shipping_address_line2: form.shipping_address_line2 || null,
                                                            shipping_city: form.shipping_city || null,
                                                            shipping_postal_code: form.shipping_postal_code || null,
                                                            shipping_country: form.shipping_country || null,
                                                        })
                                                        .eq('id', user.id);
                                                    if (!error) {
                                                        await refresh();
                                                        setEditOpen(false);
                                                    } else {
                                                        console.error('Update shipping failed', error);
                                                    }
                                                }}>Enregistrer</Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-gray-500">Nom</div>
                                <div className="text-gray-900 font-medium">{profile?.shipping_name || '—'}</div>
                            </div>
                            <div className="sm:col-span-2">
                                <div className="text-gray-500">Adresse</div>
                                <div className="text-gray-900 font-medium break-words">
                                    {(profile?.shipping_address_line1 || '—')}{profile?.shipping_address_line2 ? `, ${profile.shipping_address_line2}` : ''}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-500">Ville</div>
                                <div className="text-gray-900 font-medium">{profile?.shipping_city || '—'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">Code postal</div>
                                <div className="text-gray-900 font-medium">{profile?.shipping_postal_code || '—'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">Pays</div>
                                <div className="text-gray-900 font-medium">{profile?.shipping_country || '—'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
            )}

            <h2 className="text-2xl font-bold mt-8">My Posters</h2>
            {postersLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : visiblePosters.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {visiblePosters.map((poster, index) => (
                        <div key={poster.url || index} className="group relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                src={poster.url}
                                alt={`Poster ${index + 1}`}
                                className="w-full h-full object-contain"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button onClick={() => handleOrder(poster.url)}>
                                    Commander
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center mt-8 text-gray-500">
                    <p>Aucun poster trouvé. Générez votre premier poster !</p>
                </div>
            )}

            {hasMore && (
                <div className="text-center mt-8">
                    <Button onClick={handleLoadMore}>
                        Load More ({allPosters.length - visibleCount} remaining)
                    </Button>
                </div>
            )}
        </div>
    );
}
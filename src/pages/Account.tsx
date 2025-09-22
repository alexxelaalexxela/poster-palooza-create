// src/pages/Account.tsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePosterStore } from '@/store/usePosterStore';
import { AttemptsCounter } from '@/components/AttemptsCounter';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, CreditCard, CheckCircle, Clock, Pencil, User, Mail, LogOut, Crown, Zap, Package, MapPin, Settings, Image, ArrowRight, Star, Lock } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUnifiedPosters } from '@/hooks/useUnifiedPosters';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Watermark from '@/components/Watermark';

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                    style={{ backgroundImage: 'url(/images/hero-background.png)' }}
                ></div>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30"></div>
                
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                    className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
                >
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                                    <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl self-start">
                                        <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 leading-tight">
                                            Mon Compte
                                        </h1>
                                        <div className="flex items-center gap-2 text-white/90">
                                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="text-sm sm:text-lg truncate">{user?.email}</span>
                                        </div>
                                    </div>
                </div>
                </div>

                            <div className="w-full sm:w-auto">
                        <Button 
                                    onClick={handleLogout} 
                                    variant="outline"
                                    className="w-full sm:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/30 h-10 sm:h-auto"
                        >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Déconnexion
                        </Button>
                            </div>
                        </div>
                    </div>
            </motion.div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-10">

                {/* Section Statut du Compte Simplifiée */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-8"
                >
                    <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
                        <div className="relative">
                            {/* Gradient Header */}
                            <div className={`h-2 ${profile?.is_paid 
                                ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500' 
                                : 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600'
                            }`}></div>
                            
                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                <div className="flex flex-col gap-6">
                                    {/* Statut Principal */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                        <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-lg ${profile?.is_paid 
                                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                                            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                        }`}>
                                            {profile?.is_paid ? (
                                                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                            ) : (
                                                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                            )}
                </div>

                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                                                {profile?.is_paid ? 'Membre Premium' : 'Compte Gratuit'}
                                            </h2>
                                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                                {profile?.is_paid 
                                                    ? 'Accès complet à toutes les fonctionnalités' 
                                                    : 'Découvrez nos fonctionnalités premium'
                                                }
                                            </p>
                        </div>
                                    </div>
                                    
                                    {/* Bouton Premium si compte gratuit */}
                                    {profile && !profile.is_paid && (
                                        <div className="w-full sm:w-auto sm:self-end">
                                            <Button 
                                                onClick={() => navigate('/subscribe')}
                                                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 px-4 sm:px-6 py-2 sm:py-3 h-10 sm:h-auto"
                                            >
                                                <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                <span className="text-sm sm:text-base">Passer Premium</span>
                                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                
                                <Separator className="my-6 bg-gray-200" />
                                
                                {/* Compteur de tentatives */}
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100">
                                    <AttemptsCounter />
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                </motion.div>

                {/* Ma commande - Section élégante */}
                {profile?.included_poster_selected_url && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mb-8"
                    >
                        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <CardTitle className="flex items-center gap-3 text-2xl">
                                        <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl">
                                            <Package className="w-6 h-6 text-white" />
                                        </div>
                                        Ma Commande 
                                    </CardTitle>
                                    
                                    <div className="flex justify-center sm:justify-end">
                                        {profile.included_poster_validated ? (
                                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Commande Validée
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 text-sm font-semibold shadow-lg animate-pulse">
                                                <Clock className="w-4 h-4 mr-2" />
                                                En cours de validation
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                                    {/* Poster Section */}
                                    <div className="space-y-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg sm:rounded-xl">
                                                    <Image className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                </div>
                                                <h3 className="text-lg sm:text-xl font-semibold">Poster Sélectionné</h3>
                                            </div>
                                            
                                            {!profile?.included_poster_validated && (
                                                <Button 
                                                    onClick={handleChangeIncludedPoster} 
                                                    variant="outline" 
                                                    size="sm"
                                                    className="w-full sm:w-auto hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 border-pink-200 h-8 sm:h-auto text-xs sm:text-sm"
                                                >
                                                    <Pencil className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                                    Modifier
                                        </Button>
                                            )}
                                        </div>

                                                                                {profile?.included_poster_selected_url ? (
                                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                                    <div className="flex-shrink-0 self-center sm:self-start">
                                                        <div className="relative w-24 h-32 sm:w-32 sm:h-44 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border-2 sm:border-4 border-white mx-auto sm:mx-0">
                                                            {!profile?.is_paid && (
                                                                <Watermark visible text="Aperçu • Neoma" opacity={0.12} tileSize={160} fontSize={12} />
                                                            )}
                                                            <img 
                                                                src={profile.included_poster_selected_url} 
                                                                alt="Poster sélectionné" 
                                                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 select-none pointer-events-none" 
                                                                onContextMenu={(e) => e.preventDefault()}
                                                                style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
                                                                draggable={false}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-1 space-y-3 sm:space-y-4">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border relative">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <div className="text-xs sm:text-sm text-gray-500">Format</div>
                                                                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                                                </div>
                                                                <div className="font-semibold text-gray-900 text-sm sm:text-lg">
                                                                    {profile.subscription_format ?? 'Non spécifié'}
                                                                </div>
                                                            </div>
                                                            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border relative">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <div className="text-xs sm:text-sm text-gray-500">Qualité</div>
                                                                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                                                </div>
                                                                <div className="font-semibold text-gray-900 text-sm sm:text-lg">
                                                                    {profile.subscription_quality ?? 'Standard'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                                                                ) : (
                                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-100 text-center">
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                                    <Image className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                                </div>
                                                <p className="text-sm sm:text-base text-gray-500">Aucun poster sélectionné pour l'instant.</p>
                                    </div>
                        )}
                    </div>

                    {/* Adresse de livraison */}
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg sm:rounded-xl">
                                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                </div>
                                                <h3 className="text-lg sm:text-xl font-semibold">Adresse de Livraison</h3>
                                            </div>
                                            
                            {!profile?.included_poster_validated && (
                                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                                    <DialogTrigger asChild>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="w-full sm:w-auto hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 border-emerald-200 h-8 sm:h-auto text-xs sm:text-sm"
                                                        >
                                                            <Pencil className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                                            Modifier
                                                        </Button>
                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                                            <DialogTitle className="text-2xl">Modifier l'adresse de livraison</DialogTitle>
                                        </DialogHeader>
                                                        <div className="grid gap-4 mt-6">
                                                            <Input 
                                                                placeholder="Nom complet" 
                                                                value={form.shipping_name} 
                                                                onChange={e => setForm(f => ({ ...f, shipping_name: e.target.value }))}
                                                                className="h-12"
                                                            />
                                                            <Input 
                                                                placeholder="Adresse (ligne 1)" 
                                                                value={form.shipping_address_line1} 
                                                                onChange={e => setForm(f => ({ ...f, shipping_address_line1: e.target.value }))}
                                                                className="h-12"
                                                            />
                                                            <Input 
                                                                placeholder="Adresse (ligne 2)" 
                                                                value={form.shipping_address_line2} 
                                                                onChange={e => setForm(f => ({ ...f, shipping_address_line2: e.target.value }))}
                                                                className="h-12"
                                                            />
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <Input 
                                                                    placeholder="Ville" 
                                                                    value={form.shipping_city} 
                                                                    onChange={e => setForm(f => ({ ...f, shipping_city: e.target.value }))}
                                                                    className="h-12"
                                                                />
                                                                <Input 
                                                                    placeholder="Code postal" 
                                                                    value={form.shipping_postal_code} 
                                                                    onChange={e => setForm(f => ({ ...f, shipping_postal_code: e.target.value }))}
                                                                    className="h-12"
                                                                />
                                                                <Input 
                                                                    placeholder="Pays" 
                                                                    value={form.shipping_country} 
                                                                    onChange={e => setForm(f => ({ ...f, shipping_country: e.target.value }))}
                                                                    className="h-12"
                                                                />
                                            </div>
                                                            <div className="flex justify-end gap-3 mt-6">
                                                                <Button variant="outline" onClick={() => setEditOpen(false)}>
                                                                    Annuler
                                                                </Button>
                                                                <Button 
                                                                    onClick={async () => {
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
                                                                    }}
                                                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                                                >
                                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                                    Enregistrer
                                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                                                                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                                            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6">
                                                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border">
                                                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Nom complet</div>
                                                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                                                        {profile?.shipping_name || 'Non renseigné'}
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border md:col-span-2">
                                                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Adresse complète</div>
                                                    <div className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                                                        {profile?.shipping_address_line1 ? (
                                                            <>
                                                                {profile.shipping_address_line1}
                                                                {profile.shipping_address_line2 && `, ${profile.shipping_address_line2}`}
                                                            </>
                                                        ) : 'Non renseignée'}
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border">
                                                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Ville</div>
                                                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                                                        {profile?.shipping_city || 'Non renseignée'}
                                                    </div>
                            </div>
                                                
                                                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border">
                                                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Code postal</div>
                                                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                                                        {profile?.shipping_postal_code || 'Non renseigné'}
                                </div>
                            </div>
                                                
                                                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border md:col-span-2">
                                                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Pays</div>
                                                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                                                        {profile?.shipping_country || 'Non renseigné'}
                            </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
                            </CardContent>
                        </Card>
            </motion.div>
            )}

                {/* Section Mes Posters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mb-8"
                >
                    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    <div className="p-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl">
                                        <Image className="w-6 h-6 text-white" />
                                    </div>
                                    Ma Galerie de Posters
                                </CardTitle>
                                
                                <div className="flex justify-center sm:justify-end">
                                    <Badge variant="outline" className="text-lg px-4 py-2 font-semibold">
                                        {allPosters.length} création{allPosters.length > 1 ? 's' : ''}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        
                                                <CardContent className="p-4 sm:p-6">
            {postersLoading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : visiblePosters.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {visiblePosters.map((poster, index) => (
                                            <motion.div
                                                key={poster.url || index}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="group relative aspect-[3/4] bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300"
                                            >
                            {!profile?.is_paid && (
                                <Watermark visible text="Aperçu • Neoma" opacity={0.12} tileSize={120} fontSize={12} />
                            )}
                            {!profile?.is_paid && (
                                <Watermark visible text="Aperçu • Neoma" opacity={0.12} tileSize={120} fontSize={12} />
                            )}
                            <img
                                src={poster.url}
                                alt={`Poster ${index + 1}`}
                                                    className="w-full h-full object-contain p-1 sm:p-2 group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
                                onContextMenu={(e) => e.preventDefault()}
                                style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
                                draggable={false}
                                loading="lazy"
                            />
                                                
                                                {/* Overlay avec bouton */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-2 sm:p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <Button 
                                                        onClick={() => handleOrder(poster.url)}
                                                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 w-full text-xs sm:text-sm h-8 sm:h-auto"
                                                        size="sm"
                                                    >
                                                        <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    Commander
                                </Button>
                            </div>
                                            </motion.div>
                    ))}
                </div>

                                                {hasMore && (
                                        <div className="text-center mt-6 sm:mt-8">
                                            <Button 
                                                onClick={handleLoadMore}
                                                variant="outline"
                                                className="w-full sm:w-auto hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 border-violet-200 h-10 sm:h-auto text-sm"
                                            >
                                                <ArrowRight className="w-4 h-4 mr-2" />
                                                Charger plus ({allPosters.length - visibleCount} restants)
                                            </Button>
                </div>
            )}
                                </>
                                                        ) : (
                                <div className="text-center py-12 sm:py-16">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                        <Image className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Aucun poster créé</h3>
                                    <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 px-4">Commencez à créer vos premiers posters personnalisés !</p>
                                    <Button 
                                        onClick={() => navigate('/')}
                                        className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 h-10 sm:h-auto text-sm sm:text-base"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Créer mon premier poster
                    </Button>
                </div>
            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
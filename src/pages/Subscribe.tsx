import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePosterStore, type Quality, type Format } from "@/store/usePosterStore";
import { Crown, Gem, Layers, Sparkles, Truck, User, Check, ArrowRight } from "lucide-react";
import PosterWall from "@/components/SofaPoster";
import { useAuth } from "@/hooks/useAuth";

const benefits = [
  { icon: Sparkles, text: "15 générations premium par mois", highlight: "premium" },
  { icon: Layers, text: "4 propositions par prompt", highlight: "unique" },
  { icon: User, text: "Photo de personne ou lieu pour personnalisation", highlight: "perso" },
  { icon: Gem, text: "Impression haute qualité galerie", highlight: "qualité" },
  { icon: Truck, text: "Livraison rapide & emballage soigné", highlight: "rapide" },
];

const qualityOptions: { id: Quality; name: string; subtitle: string; price: string; ring: string; popular?: boolean }[] = [
  { id: "classic", name: "Classic", subtitle: "170 g/m² · Mat", price: "Base", ring: "from-neutral-400/30 via-neutral-500/30 to-neutral-600/30" },
  { id: "premium", name: "Premium", subtitle: "230 g/m² · Satin", price: "+10€", ring: "from-sky-400/30 via-indigo-500/30 to-indigo-600/30", popular: true },
  { id: "museum", name: "Museum", subtitle: "305 g/m² · Gloss", price: "+20€", ring: "from-amber-400/30 via-rose-400/30 to-rose-500/30" },
];

const Subscribe = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedFormat,
    setSelectedFormat,
    selectedQuality,
    setSelectedQuality,
    price,
    calculatePrice,
    generatedUrls,
    cachedUrls,
  } = usePosterStore();

  const formatOptions: { id: Format; label: string }[] = [
    { id: "A0", label: "A0" },
    { id: "A1", label: "A1" },
    { id: "A2", label: "A2" },
    { id: "A3", label: "A3" },
    { id: "A4", label: "A4" },
  ];

  useEffect(() => {
    calculatePrice();
  }, [selectedFormat, selectedQuality, calculatePrice]);

  const handleBuy = async () => {
    navigate('/subscribe/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Hero Section Premium */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-[url('/images/hero-background2.png')] opacity-5 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Crown className="mx-auto h-16 w-16 text-yellow-400 mb-6" />
            </motion.div>
            
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight"
            >
              Votre Poster<br />
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Personnalisé
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto leading-relaxed"
            >
              De l'idée à l'impression premium. Générez, choisissez, recevez.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative -mt-16 max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Benefits Sidebar */}
          <motion.aside
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="xl:col-span-4"
          >
            <div className="sticky top-24">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl h-fit">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-6">Ce qui est inclus</h3>
                  
                  <ul className="space-y-4 mb-8">
                    {benefits.map(({ icon: Icon, text }, i) => (
                      <motion.li
                        key={text}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        className="flex items-start gap-4 group"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center group-hover:bg-white/25 transition-colors">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-white/90 text-base leading-relaxed">{text}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <div className="rounded-2xl bg-white/10 backdrop-blur p-6 border border-white/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Gem className="h-5 w-5 text-yellow-400" />
                      <span className="text-white font-semibold">Garantie qualité</span>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Impression professionnelle sur papier premium. Emballage sécurisé et livraison soignée.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Main Configurator */}
          <div className="xl:col-span-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
            >
              
              {/* Format Selection */}
              <div className="p-8 pb-0">
                <div className="text-center ">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre format</h3>
                  <p className="text-gray-600">Cliquez sur le format souhaité pour voir l'aperçu</p>
                </div>
                
                <div className="relative">
                  {(() => {
                    const merged = [...generatedUrls, ...cachedUrls];
                    const previewUrl = merged[0] ?? "/images/poster6.png";
                    return <PosterWall posterUrl={previewUrl} sofaImage="./images/Sofa10.png" compact={true} />;
                  })()}
                </div>
                
                {/* Format options grid */}
                <div className="mt-6 grid grid-cols-5 gap-3">
                  {formatOptions.map((f) => {
                    const active = selectedFormat === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFormat(f.id)}
                        className={`py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${active ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white hover:border-indigo-300'}`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>

                {selectedFormat && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-4 mb-4 p-3 bg-indigo-50 rounded-xl"
                  >
                    <span className="text-indigo-700 font-medium">Format sélectionné: {selectedFormat}</span>
                  </motion.div>
                )}
              </div>

              {/* Quality Selection */}
              <div className="p-8 pt-0">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Qualité d'impression</h3>
                  <p className="text-gray-600">Sélectionnez le niveau de qualité souhaité</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {qualityOptions.map((opt) => {
                    const active = selectedQuality === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedQuality(opt.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                          active
                            ? `border-indigo-500 bg-gradient-to-br ${opt.ring} shadow-xl shadow-indigo-500/20`
                            : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg"
                        }`}
                      >
                        {opt.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                              POPULAIRE
                            </span>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">{opt.name}</h4>
                          <div className="w-12 h-px bg-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 mb-3">{opt.subtitle}</p>
                          <div className="text-lg font-semibold text-indigo-600">{opt.price}</div>
                        </div>
                        
                        {active && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center"
                          >
                            <Check size={14} className="text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Price & CTA */}
              <div className="bg-gradient-to-r from-gray-50 to-indigo-50/50 p-8 border-t border-gray-200">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="text-center lg:text-left">
                    <p className="text-gray-600 text-sm mb-1">Prix total</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl lg:text-5xl font-black text-gray-900">{price}€</span>
                      <span className="text-gray-500 text-lg">TTC</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Livraison incluse en France</p>
                  </div>

                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleBuy}
                      disabled={!selectedFormat || !selectedQuality}
                      size="lg"
                      className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      Finaliser ma commande
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-gray-500 mb-4">
                🔒 Paiement sécurisé • 📦 Livraison rapide 
              </p>
              <p className="text-xs text-gray-400">
                En continuant, vous acceptez nos conditions générales de vente.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Subscribe;



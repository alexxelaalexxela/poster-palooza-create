/* ──────────────────────────  UpgradeModal.tsx  ────────────────────────── */
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Layers, Image, Palette, Truck, Package, Star, X, ArrowRight, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UpgradeModalProps {
    open: boolean;
    onClose: () => void;
    onSignup: () => void;
}

const steps = [
    {
        icon: <Sparkles className="w-5 h-5" />,
        title: "Générez",
        description: "15 créations IA premium",
        color: "from-purple-500 to-pink-500"
    },
    {
        icon: <Image className="w-5 h-5" />,
        title: "Choisissez",
        description: "Votre poster favori",
        color: "from-blue-500 to-cyan-500"
    },
    {
        icon: <Package className="w-5 h-5" />,
        title: "Recevez",
        description: "Impression + livraison",
        color: "from-green-500 to-emerald-500"
    }
];

const features = [
    {
        icon: <Sparkles className="w-4 h-4" />,
        text: "15 générations premium par mois",
        highlight: true
    },
    {
        icon: <Layers className="w-4 h-4" />,
        text: "4 propositions par génération",
        highlight: false
    },
    {
        icon: <Star className="w-4 h-4" />,
        text: "Tous les styles de templates",
        highlight: false
    },
    {
        icon: <Palette className="w-4 h-4" />,
        text: "Qualité d'impression premium",
        highlight: false
    },
    {
        icon: <Truck className="w-4 h-4" />,
        text: "Livraison express incluse",
        highlight: false
    }
];

/* ---------------------------------------------------------------------- */
/*                            UpgradeModal                                */
/* ---------------------------------------------------------------------- */
export const UpgradeModal = ({ open, onClose, onSignup }: UpgradeModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-md sm:max-w-lg p-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white shadow-2xl rounded-3xl border-0 max-h-[95vh] overflow-y-auto">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
                    <div className="absolute top-0 left-0 w-full h-full opacity-30">
                        <div className="w-full h-full" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundRepeat: 'repeat'
                        }} />
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                >
                    <X size={20} className="text-white/80 hover:text-white" />
                </button>

                <div className="relative p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl mb-4 shadow-xl"
                        >
                            <Crown className="w-8 h-8 text-white" />
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Badge className="mb-3 bg-white/20 text-white border-white/30 text-xs font-semibold px-3 py-1">
                                FORFAIT PREMIUM
                            </Badge>
                            <DialogTitle className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                                De l'Idée au Poster Livré
                            </DialogTitle>
                            <DialogDescription className="text-white/70 text-sm sm:text-base leading-relaxed">
                                Générez, choisissez et recevez votre poster personnalisé
                            </DialogDescription>
                        </motion.div>
                    </div>

                    {/* Process Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="flex-1 text-center"
                                >
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} shadow-lg mb-3`}>
                                        {step.icon}
                                    </div>
                                    <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                                    <p className="text-xs text-white/60 leading-tight">{step.description}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Arrows between steps */}
                        <div className="flex items-center justify-center mb-6">
                            <div className="flex items-center space-x-2">
                                <ArrowRight className="w-4 h-4 text-white/40" />
                                <ArrowRight className="w-4 h-4 text-white/40" />
                            </div>
                        </div>
                    </div>

                    {/* Features List */}
                    {/* <div className="mb-8">
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                            <h3 className="font-semibold mb-4 text-center text-white/90">Ce qui est inclus :</h3>
                            <div className="space-y-3">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                            feature.highlight ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30' : ''
                                        }`}
                                    >
                                        <div className="flex-shrink-0 p-1.5 bg-white/10 rounded-lg">
                                            {feature.icon}
                                        </div>
                                        <span className={`text-sm ${feature.highlight ? 'font-semibold' : 'text-white/80'}`}>
                                            {feature.text}
                                        </span>
                                        {feature.highlight && (
                                            <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>*/}

                    {/* Pricing */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6 text-center"
                    >
                        <p className="text-white/60 text-xs uppercase tracking-widest mb-2">
                            Tout inclus à partir de
                        </p>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl sm:text-5xl font-bold">45</span>
                            <span className="text-lg text-white/80">€</span>
                        </div>
                        <p className="text-xs text-white/50 mt-1">Génération + Impression + Livraison</p>
                    </motion.div>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onClick={onSignup}
                            className="w-full py-4 text-base font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-xl shadow-yellow-400/25 rounded-2xl transition-all duration-300 border-0"
                        >
                            <Crown className="w-5 h-5 mr-2" />
                            Commencer maintenant
                        </Button>
                    </motion.div>

                    {/* Trust indicator */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-center text-xs text-white/50 mt-4"
                    >
                        🔒 Paiement sécurisé • Livraison garantie
                    </motion.p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

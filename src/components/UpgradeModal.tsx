/* ──────────────────────────  UpgradeModal.tsx  ────────────────────────── */
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Gem, Layers, Sparkles, Truck, User, X } from "lucide-react";
import { motion } from "framer-motion";

interface UpgradeModalProps {
    open: boolean;
    onClose: () => void;
    onSignup: () => void;
}

const premiumFeatures = [
    {
        icon: <Sparkles className="h-5 w-5 text-fuchsia-500" />,
        text: "15 générations premium",
    },
    {
        icon: <Layers className="h-5 w-5 text-fuchsia-500" />,
        text: "4 propositions par prompt",
    },
    {
        icon: <User className="h-5 w-5 text-fuchsia-500" />,
        text: "Photo de tête et lieu inclus pour la personnalisation",
    },
    {
        icon: <Gem className="h-5 w-5 text-fuchsia-500" />,
        text: "Meilleure qualité d’impression",
    },
    {
        icon: <Truck className="h-5 w-5 text-fuchsia-500" />,
        text: "Livraison rapide de votre poster préféré",
    },
];


/* ---------------------------------------------------------------------- */
/*                            UpgradeModal                                */
/* ---------------------------------------------------------------------- */
export const UpgradeModal = ({ open, onClose, onSignup }: UpgradeModalProps) => {


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:max-w-2xl p-0 bg-gray-900 text-white shadow-2xl rounded-2xl border-fuchsia-500/20 border max-h-[90vh] overflow-y-auto">
                <div className="relative">
                    <img
                        src="/images/hero-background.png" // A nice background
                        alt="Premium background"
                        className="absolute inset-0 w-full h-full object-cover opacity-10"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900" />
                    
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                    >
                        <X size={24} />
                    </button>

                    <div className="relative p-8 md:p-12 text-center">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                        >
                            <Crown className="mx-auto h-16 w-16 text-yellow-400" />
                        </motion.div>
                        
                        <DialogHeader className="mt-4">
                            <DialogTitle className="text-3xl font-extrabold tracking-tight text-center">
                                De l'Idée au Poster Livré
                            </DialogTitle>
                            <DialogDescription className="mt-2 text-lg text-gray-300 max-w-md mx-auto text-center">
                                Générez plusieurs posters uniques avec l'IA, choisissez votre favori, et recevez une impression de qualité galerie directement chez vous.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="my-10 text-left">
                            <ul className="space-y-4">
                                {premiumFeatures.map((feature, index) => (
                                    <motion.li 
                                        key={index}
                                        className="flex items-center gap-4"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                    >
                                        <div className="bg-fuchsia-500/10 rounded-full p-2">
                                            {feature.icon}
                                        </div>
                                        <span className="text-base">{feature.text}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-sm uppercase tracking-widest text-gray-400">
                                À partir de
                            </p>
                            <p className="mt-2 text-5xl font-bold tracking-tight">
                                45€
                            </p>
                            
                        </div>

                        <motion.div
                            className="mt-10"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={onSignup}
                                size="lg"
                                className="w-full py-4 text-lg font-bold
                               bg-gradient-to-r from-fuchsia-600 to-indigo-600
                               hover:from-fuchsia-700 hover:to-indigo-700
                               text-white shadow-lg shadow-fuchsia-500/20
                               transform transition-all duration-300"
                            >
                                Gérer mes propositions
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

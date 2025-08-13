/* ──────────────────────────  UpgradeModal.tsx  ────────────────────────── */
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, X, UserPlus, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

interface UpgradeModalProps {
    open: boolean;
    onClose: () => void;
    onSignup: () => void;
}

const features = [
    "Générations illimitées",
    "Historique cloud",
    "Export HD 4K",
    "Priorité de rendu",
];

const freeFeatures = [
    "3 générations gratuites",
    "Templates de base",
    "Qualité standard",
    "Support email",
];

/* ---------------------------------------------------------------------- */
/*                            UpgradeModal                                */
/* ---------------------------------------------------------------------- */
export const UpgradeModal = ({ open, onClose, onSignup }: UpgradeModalProps) => {
    const { user } = useAuth();
    const isAnonymous = !user;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                className="w-[92vw] sm:max-w-lg p-0 overflow-hidden
                     bg-gradient-to-br from-white/70 to-indigo-50/60
                     backdrop-blur-xl shadow-2xl rounded-3xl ring-1 ring-indigo-100"
            >
                {/* bannière / illustration */}
                <div className="relative h-40 md:h-48 bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-pink-500">
                    <img
                        src="/images/upgrade-banner.webp"
                        alt=""
                        className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                        loading="lazy"
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* contenu */}
                <div className="px-6 py-8 md:p-10 space-y-6 text-gray-800">
                    <DialogHeader className="items-center space-y-2">
                        {isAnonymous ? (
                            <UserPlus size={28} className="text-blue-600" />
                        ) : (
                            <Crown size={28} className="text-yellow-600" />
                        )}
                        <DialogTitle className="text-2xl font-extrabold text-indigo-800">
                            {isAnonymous ? "Créez votre compte !" : "Passez Premium !"}
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm md:text-base text-gray-600">
                            {isAnonymous ? (
                                <>
                                    Vous avez utilisé vos 3 tentatives gratuites.<br />
                                    Créez un compte pour continuer à créer des posters :
                                </>
                            ) : (
                                <>
                                    Vous avez utilisé vos 3 tentatives gratuites.<br />
                                    Passez Premium pour 15 générations par mois :
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {/* liste des avantages */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">
                            {isAnonymous ? "Avantages du compte gratuit :" : "Avantages Premium :"}
                        </h3>
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {(isAnonymous ? freeFeatures : features).map((f) => (
                                <li key={f} className="flex items-start gap-2">
                                    <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span className="text-sm md:text-base">{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <Button
                            onClick={onSignup}
                            className="w-full py-3 text-base font-semibold
                           bg-gradient-to-r from-indigo-600 to-fuchsia-600
                           hover:from-indigo-700 hover:to-fuchsia-700
                           focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500
                           animate-pulse"
                        >
                            {isAnonymous ? "Créer mon compte" : "Passer Premium"}
                        </Button>
                    </motion.div>

                    <button
                        onClick={onClose}
                        className="block mx-auto text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Plus tard
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

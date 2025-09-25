import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle, Gem, Layers, Sparkles, Truck } from "lucide-react";
import { usePosterStore, type Format, type Quality } from "@/store/usePosterStore";
import { useNavigate } from "react-router-dom";

interface OfferModalProps {
  open: boolean;
  onClose: () => void;
}

const benefits = [
  { icon: Sparkles, text: "15 générations premium" },
  { icon: Layers, text: "4 propositions par prompt" },
  { icon: Gem, text: "Meilleure qualité d’impression" },
  { icon: Truck, text: "Livraison rapide de votre poster préféré" },
];

const formatOptions: Format[] = ["A0", "A1", "A2", "A3", "A4"];

const qualityOptions: { id: Quality; name: string; subtitle: string }[] = [
  { id: "classic", name: "Classic", subtitle: "170 g/m² · Mat" },
  { id: "premium", name: "Premium", subtitle: "230 g/m² · Satin" },
  { id: "museum", name: "Museum", subtitle: "305 g/m² · Gloss" },
];

export const OfferModal = ({ open, onClose }: OfferModalProps) => {
  const navigate = useNavigate();
  const {
    selectedFormat,
    selectedQuality,
    setSelectedFormat,
    setSelectedQuality,
    price,
    calculatePrice,
  } = usePosterStore();

  // Ensure price reflects current selections on open
  useEffect(() => {
    if (open) calculatePrice();
  }, [open, calculatePrice]);

  const handleBuy = () => {
    // Proceed to order page; selections are already in the store
    navigate("/order");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-3xl p-0 overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Benefits & intro */}
          <div className="relative p-8 md:p-10 bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl md:text-3xl font-extrabold">
                Configurez votre poster
              </DialogTitle>
              <DialogDescription className="text-white/90 md:text-base">
                Générez plusieurs versions, choisissez votre préférée et recevez-la chez vous en quelques jours.
              </DialogDescription>
            </DialogHeader>

            <ul className="mt-6 space-y-3">
              {benefits.map(({ icon: Icon, text }, idx) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className="flex items-start gap-3"
                >
                  <span className="inline-flex items-center justify-center rounded-full bg-white/15 p-1.5">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm md:text-base">{text}</span>
                </motion.li>
              ))}
            </ul>

            <p className="mt-8 text-xs text-white/80">
              Prix selon format et qualité. Impression de qualité galerie.
            </p>
          </div>

          {/* Right: Configurator */}
          <div className="p-8 md:p-10 space-y-8 bg-white">
            {/* Format */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Format</h3>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {formatOptions.map((fmt) => {
                  const active = selectedFormat === fmt;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedFormat(fmt)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40"
                      }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Quality */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Qualité d’impression</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {qualityOptions.map((q) => {
                  const active = selectedQuality === q.id;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setSelectedQuality(q.id)}
                      className={`text-left rounded-2xl border p-4 transition ${
                        active
                          ? "border-indigo-500 ring-2 ring-indigo-200"
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      <span className="block font-semibold">{q.name}</span>
                      <span className="mt-1 block text-sm text-gray-600">{q.subtitle}</span>
                      {active && (
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600">
                          <CheckCircle className="h-4 w-4" />
                          Sélectionné
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Price & CTA */}
            <section className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">Prix estimé</p>
                <p className="text-3xl font-extrabold tracking-tight">{price.toFixed(2)} €</p>
              </div>
              <Button
                onClick={handleBuy}
                className="px-6 py-6 text-base font-semibold bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700"
                disabled={!selectedFormat || !selectedQuality}
              >
                Acheter maintenant
              </Button>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferModal;



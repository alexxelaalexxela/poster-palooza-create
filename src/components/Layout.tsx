import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/Footer';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/useCartStore';
import { usePosterStore } from '@/store/usePosterStore';
import PromoCode from '@/components/PromoCode';
import { getPriceEuros, SHIPPING_FEE_CENTS } from '@/lib/pricing';
import { useCartSync } from '@/hooks/useCartSync';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Accueil", href: "/" },
  { name: "Librairie", href: "/librairie" },
  { name: "Tarifs", href: "/subscribe" },
  { name: "À propos", href: "/about" },
];

export default function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  useCartSync();

  /* ------------------------------------------------------------
   * UX : lock body scroll when nav is open
   * ---------------------------------------------------------- */
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  /* ------------------------------------------------------------
   * Close menu automatically on route change
   * ---------------------------------------------------------- */
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    if (href !== "/" && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="min-h-screen font-inter flex flex-col">
      {/* --------------------------------------------------------
       * Header (fixed)
       * ------------------------------------------------------ */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="flex h-14 md:h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/logoo.png"
                alt="Neoma logo"
                className="h-8 w-auto md:h-10"
              />
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-gray-900 ${isActive(item.href) ? "text-gray-900" : "text-gray-600"
                    }`}
                >
                  {item.name}
                </Link>
              ))}

              <div className="w-px h-6 bg-gray-200" /> {/* Séparateur visuel */}
              {loading ? (
                <div className="w-20 h-6 bg-gray-200 rounded-md animate-pulse" />
              ) : user ? (
                <Link
                  to="/account"
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  Mon Compte
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800"
                >
                  Login
                </Link>
              )}
              {/* Panier (desktop) */}
              <CartButton />
              {/* ===================== FIN NOUVEAU BLOC DESKTOP ===================== */}

            </div>

            {/* Mobile actions */}
            <div className="md:hidden flex items-center gap-2">
              <CartButton />
              <button
                type="button"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-md shadow-sm border-t border-gray-100"
            >
              <div className="px-6 py-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${isActive(item.href)
                      ? "bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Séparateur plus discret */}
                <div className="h-px bg-gray-200 my-3" />
                
                {loading ? (
                  <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse ml-3" />
                ) : user ? (
                  <Link
                    to="/account"
                    className="block px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200"
                  >
                    Mon Compte
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="block px-3 py-2.5 text-base font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-all duration-200"
                  >
                    Connexion
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --------------------------------------------------------
       * Main content (compensate fixed header)
       * ------------------------------------------------------ */}
      <main className="pt-14 md:pt-16 flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function CartButton() {
  const totalQty = useCartStore((s) => s.getTotalQuantity());
  const items = useCartStore((s) => s.items);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="relative inline-flex items-center justify-center rounded-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Voir le panier"
        >
          <ShoppingCart size={22} />
          {totalQty > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-indigo-600 text-white text-[11px] font-semibold flex items-center justify-center">
              {totalQty}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Votre panier</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Votre panier est vide.</p>
          ) : (
            <CartList />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CartList() {
  const { items, removeItem, setQuantity, getSubtotal } = useCartStore();
  const { promoApplied, promoPercent } = usePosterStore();
  const subtotal = getSubtotal();
  const discount = promoApplied && (promoPercent || 0) > 0 ? Number((subtotal * ((promoPercent || 0) / 100)).toFixed(2)) : 0;
  const subtotalAfter = Number((subtotal - discount).toFixed(2));
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto divide-y">
        {items.map((it) => {
          const unit = Math.max(0, getPriceEuros(it.format as any, it.quality as any) - SHIPPING_FEE_CENTS / 100);
          const lineTotal = Number((unit * it.quantity).toFixed(2));
          return (
            <div key={`${it.posterUrl}-${it.format}-${it.quality}`} className="py-3 flex gap-3 items-center">
              <img src={it.posterUrl} alt="Poster" className="w-16 h-20 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{it.format} – {it.quality}</div>
                <div className="mt-1 flex items-center gap-2">
                  <button className="px-2 py-1 text-sm rounded bg-gray-100" onClick={() => setQuantity(it.posterUrl, it.format, it.quality, Math.max(1, it.quantity - 1))}>−</button>
                  <span className="w-6 text-center text-sm">{it.quantity}</span>
                  <button className="px-2 py-1 text-sm rounded bg-gray-100" onClick={() => setQuantity(it.posterUrl, it.format, it.quality, it.quantity + 1)}>+</button>
                  <button className="ml-3 text-xs text-red-600 hover:underline" onClick={() => removeItem(it.posterUrl, it.format, it.quality)}>Supprimer</button>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-800 whitespace-nowrap ml-2">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(lineTotal)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="pt-4 border-t mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Sous-total (hors livraison)</span>
          <span className="font-semibold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(subtotal)}</span>
        </div>
        {promoApplied && discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700">Code promo (−{promoPercent}%)</span>
            <span className="font-medium text-green-700">−{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-800 font-medium">Sous-total après réduction</span>
          <span className="font-semibold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(subtotalAfter)}</span>
        </div>
        {!promoApplied && (
          <div className="pt-2">
            <PromoCode compact />
          </div>
        )}
        <SheetClose asChild>
          <Link to="/order" className="block mt-3">
            <Button className="w-full">Commander</Button>
          </Link>
        </SheetClose>
      </div>
    </div>
  );
}

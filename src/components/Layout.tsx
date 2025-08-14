import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "What we propose", href: "/" },
  { name: "Pricing", href: "/pricing" },
  { name: "About Us", href: "/about" },
];

export default function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
              {/* ===================== FIN NOUVEAU BLOC DESKTOP ===================== */}

            </div>

            {/* Burger */}
            <button
              type="button"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
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
              className="md:hidden bg-white shadow-lg border-t border-gray-200 transition"
            >
              <div className="px-4 py-2 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-4 py-3 text-lg font-medium transition-colors ${isActive(item.href)
                      ? "bg-gray-50 text-gray-900"
                      : "text-gray-600"
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* ======================== NOUVEAU BLOC MOBILE ======================= */}
                <div className="border-t border-gray-100 my-2" />
                {loading ? (
                  <div className="w-full h-12 bg-gray-100 rounded-md animate-pulse" />
                ) : user ? (
                  <Link
                    to="/account"
                    className="block px-4 py-3 text-lg font-medium text-gray-600"
                  >
                    Mon Compte
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-lg font-medium text-indigo-600"
                  >
                    Login / Register
                  </Link>
                )}
                {/* ====================== FIN NOUVEAU BLOC MOBILE ===================== */}
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

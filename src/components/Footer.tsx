import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Contact */}
          <div className="text-sm text-gray-700 text-center md:text-left">
            <div className="font-semibold text-gray-900 mb-8">Contact</div>
            <div>
              <div className="mb-3 flex items-center gap-3 justify-center md:justify-start">
                <a href="https://www.facebook.com/NeomaPoster" target="_blank" rel="noopener" aria-label="Facebook Neoma Poster"
                   className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white border text-black shadow">
                  <Facebook size={18} />
                  <span className="sr-only">Facebook Neoma Poster</span>
                </a>
                <a href="https://instagram.com/neoma_ai" target="_blank" rel="noopener" aria-label="Instagram Neoma AI"
                   className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white border text-black shadow">
                  <Instagram size={18} />
                  <span className="sr-only">Instagram @neoma_ai</span>
                </a>
              </div>
              <p>
                <span className="font-medium">Tel</span> : <a href="tel:+33650900921" className="text-indigo-600 hover:underline">06 50 90 09 21</a> <span className="text-gray-500">— Numéro non surtaxé</span>
              </p>
              <p className="mt-1">
                <span className="font-medium">Mail</span> : <a href="mailto:honealexandre@gmail.com" className="text-indigo-600 hover:underline">honealexandre@gmail.com</a>
              </p>
              
            </div>
          </div>

          {/* Middle: Legal links */}
          <div className="text-sm text-gray-700 flex flex-col items-center md:items-center text-center md:text-left">
            <div className="font-semibold text-gray-900 mb-8">Informations</div>
            {/* Payment logos – Apple Pay, Mastercard, Visa, CB */}
            <div className="mb-4 flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4">
              {/* Mastercard (same card size as Visa, bigger logo inside) */}
              <div className="h-8 w-20 rounded-lg bg-white border shadow-sm flex items-center justify-center p-0 overflow-hidden">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                  alt="Mastercard"
                  className="h-full w-full object-contain scale-90"
                  loading="lazy"
                />
              </div>
              {/* VISA (reference card size) */}
              <div className="h-8 w-20 rounded-lg bg-white border shadow-sm flex items-center justify-center p-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                  alt="Visa"
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </div>
              {/* Apple Pay (same card size as Visa, bigger logo inside) */}
              <div className="h-8 w-20 rounded-lg bg-white border shadow-sm flex items-center justify-center p-0 overflow-hidden">
                <img
                  src="/images/apple-pay-badge.png"
                  alt="Apple Pay"
                  className="h-full w-full object-contain scale-110"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <Link to="/mentions-legales" target="_blank" rel="noopener" className="hover:text-gray-900 underline underline-offset-4">
                Mentions légales
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/conditions-generales-de-vente" target="_blank" rel="noopener" className="hover:text-gray-900 underline underline-offset-4">
                Conditions générales de vente
              </Link>
            </div>
            <p className="mt-3 text-xs text-gray-500 text-left md:text-center max-w-md">
              Mentions légales : Informations obligatoires par l’article 6 de la loi n°2004-575 du 21 juin 2004.
            </p>
          </div>

          {/* Right: Existing nav, with title */}
          <nav className="text-sm text-gray-700 flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            <div className="font-semibold text-gray-900 mb-8">Menu</div>
            <Link to="/about" className="hover:text-gray-900">À propos</Link>
            <Link to="/subscribe" className="hover:text-gray-900">Tarifs</Link>
            <a href="mailto:neoma.poster@gmail.com" className="hover:text-gray-900">Contact</a>
          </nav>
        </div>

        {/* Bottom: Brand and copyright */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <img src="/logoo.png" alt="Neoma logo" className="h-8 w-auto" />
          <span className="text-sm text-gray-500">© {new Date().getFullYear()} Neoma Poster</span>
        </div>
      </div>
    </footer>
  );
}



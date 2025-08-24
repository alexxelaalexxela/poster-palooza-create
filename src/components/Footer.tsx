import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logoo.png" alt="Neoma logo" className="h-8 w-auto" />
            <span className="text-sm text-gray-500">
              © {new Date().getFullYear()} Neoma Poster 
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/about" className="text-gray-600 hover:text-gray-900">
              À propos
            </Link>
            <Link to="/subscribe" className="text-gray-600 hover:text-gray-900">
              Tarifs
            </Link>
            <a
              href="mailto:Neoma.poster@gmail.com"
              className="text-gray-600 hover:text-gray-900"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}



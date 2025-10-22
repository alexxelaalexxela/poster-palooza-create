import { Helmet } from 'react-helmet-async';
import { buildCanonical } from '@/lib/utils';

export default function MentionsLegales() {
  return (
    <div className="bg-white">
      <Helmet>
        <title>Mentions légales – Neoma Poster</title>
        <meta name="description" content="Mentions légales de Neoma Poster: informations légales et coordonnées de l'éditeur du site." />
        <link rel="canonical" href={buildCanonical('/mentions-legales')} />
      </Helmet>

      <section className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Mentions légales</h1>
          <p className="mt-2 text-sm text-gray-500">Informations obligatoires au sens de l’article 6 de la loi n°2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white/80 shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Éditeur du site</h2>
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <p><span className="font-medium">Dénomination</span> : Neoma Poster</p>
                <p><span className="font-medium">SIREN</span> : 989 885 975</p>
                <p><span className="font-medium">Siège social</span> : 37 rue Marius Aufan, 92300 Levallois-Perret, France</p>
                <p><span className="font-medium">Email</span> : <a className="text-indigo-600 hover:underline" href="mailto:honealexandre@gmail.com">honealexandre@gmail.com</a></p>
                <p><span className="font-medium">Téléphone</span> : <a className="text-indigo-600 hover:underline" href="tel:+33650900921">06 50 90 09 21</a> <span className="text-gray-500">(numéro non surtaxé)</span></p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <h2 className="text-base font-semibold text-gray-900">Hébergement</h2>
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <p>Le site est hébergé et distribué via des services cloud modernes garantissant performance et sécurité.</p>
                <p>Pour toute question technique, contactez l’éditeur à l’adresse ci-dessus.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-8">
          <h2 className="text-base font-semibold text-gray-900">Propriété intellectuelle</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">Tous les éléments présents sur le site (textes, images, graphismes, logos, marques, etc.) sont protégés par le droit de la propriété intellectuelle et demeurent la propriété exclusive de leurs titulaires. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, est interdite sans autorisation préalable.</p>
        </div>
      </section>
    </div>
  );
}



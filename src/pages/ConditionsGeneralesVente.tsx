import { Helmet } from 'react-helmet-async';
import { buildCanonical } from '@/lib/utils';

export default function ConditionsGeneralesVente() {
  return (
    <div className="bg-white">
      <Helmet>
        <title>Conditions générales de vente – Neoma Poster</title>
        <meta name="description" content="Conditions générales de vente de Neoma Poster: commande, prix, paiement, livraison, rétractation et responsabilités." />
        <link rel="canonical" href={buildCanonical('/conditions-generales-de-vente')} />
      </Helmet>

      <section className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Conditions générales de vente (CGV)</h1>
          <p className="mt-2 text-sm text-gray-500">Version courte et claire, applicable aux consommateurs, régie par le droit français.</p>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 md:p-8 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">1. Identité du vendeur</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Neoma Poster – 37 rue Marius Aufan, 92300 Levallois-Perret, France – SIREN 989 885 975 –
              Email: <a className="text-indigo-600 hover:underline" href="mailto:honealexandre@gmail.com">honealexandre@gmail.com</a> –
              Tél: <a className="text-indigo-600 hover:underline" href="tel:+33650900921">06 50 90 09 21</a> (numéro non surtaxé).
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 md:p-8 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">2. Champ d’application</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Les présentes CGV s’appliquent aux ventes conclues entre Neoma Poster et tout client non commerçant sur le site. Toute commande vaut
              acceptation pleine et entière des CGV.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 md:p-8 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">3. Produits et disponibilité</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Nous proposons des visuels et impressions sur commande. Les offres sont valables dans la limite des stocks et capacités de production. En cas d’indisponibilité,
              vous êtes informé et pouvez être remboursé des sommes versées.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 md:p-8 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">4. Prix</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Les prix sont exprimés en euros TTC. Les frais de livraison sont indiqués avant validation de la commande. Tout changement de TVA sera automatiquement répercuté.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 md:p-8 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">5. Paiement</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Les paiements sont sécurisés et traités via Stripe (cartes Visa, MasterCard, etc.). Vos données bancaires ne sont jamais connues ni stockées par Neoma Poster.
              La commande n’est prise en compte qu’après acceptation du paiement.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 md:p-8 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">6. Livraison</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Livraison à domicile ou en point relais selon options proposées. Les délais communiqués sont indicatifs et dépendent du transporteur. En cas d’anomalie,
              signalez-le au transporteur et au service client. En cas de perte avérée, un nouveau colis sera expédié sans frais.
            </p>
          </section>

          

          <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 md:p-8 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">7. Conformité et retours</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              En cas de non-conformité au bon de commande, nous échangeons ou remboursons l’article et les frais de réexpédition. Contactez-nous sous 3 jours après réception.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 md:p-8 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">8. Données personnelles</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Vos données sont traitées pour la gestion des commandes conformément à la réglementation applicable. Vous disposez de droits d’accès, de rectification et d’opposition.
              Contactez-nous par email.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 md:p-8 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">9. Responsabilité</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Neoma Poster ne saurait être tenue responsable des interruptions du site, erreurs ou dommages résultant d’intrusions frauduleuses. Les visuels affichés peuvent présenter de
              légères variations selon les écrans et techniques d’impression.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 md:p-8 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">10. Propriété intellectuelle</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Tous les contenus du site sont protégés. Toute reproduction ou exploitation non autorisée est interdite.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 md:p-8 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">11. Droit applicable et litiges</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Le présent contrat est soumis au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux français seront compétents.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}



export interface PosterCatalogItem {
  id: string;
  title: string;
  priceCents: number;
  imageUrl: string;
  rating: number; // 0–5
  ratingCount: number;
  stripePriceId: string; // reserved for future use (Stripe Price ID)
  stylePrompt: string; // used to augment prompt when customizing
}

// Reusable style prompts (to avoid duplication across posters)
const VINTAGE_APLATS_STYLE = `Illustration vectorielle minimaliste au style rétro, inspirée des affiches touristiques vintage. La scène représente un paysage naturel épuré, avec de larges aplats de couleurs chaudes et douces (sable, ocre, orange, verts doux ou teintes adaptées au thème), sans contours ni détails superflus ! Perspective simple avec un horizon visible et possiblement un couché de soleil (ex. : plage et mer sous un soleil couchant). 
      
      Les personnages, s'ils sont présents, sont stylisés de manière minimaliste mais colorée : pas de silhouettes sombres ou noires, mais des corps représentés avec des aplats de couleurs variées et harmonieuses. Ils n'ont PAS de traits du visage ! mais des postures expressives et naturelles. Les vêtements et accessoires sont également représentés sans ombres ni textures, avec des couleurs unies. L'objectif est de garder un style vivant mais épuré, sans tomber dans un effet "ombre chinoise". Ils ne doivent pas prendre tout l'espace, seulement 1/5 de la surface.

      La composition est équilibrée, avec un titre centré en haut de l'image, écrit en lettres majuscules, utilisant une typographie sans-serif épaisse, arrondie et bien espacée, dans une couleur qui contraste agréablement avec le fond.
      Il faut absulument que le prompt dise qu'on veut un paysage naturel épuré avec des forme et large aplat et que les personnage soit minimaliste coloré et sans traits de visage .
      `;

const STYLE_CADRE_BLANC_VIN = `1. Format général
	•	Le poster est en format vertical (portrait).
	•	Il est encadré par une large bordure blanche uniforme tout autour de l’image centrale.
	•	Proportions visuelles :
	•	Haut et bas : ≈ 15 % de la hauteur totale.
	•	Côtés gauche et droit : ≈ 10 % de la largeur totale.

👉 Cela crée un effet de cadre épuré, rappelant les affiches d’exposition artistique.

⸻

2. Image centrale
	•	L’image est rectangulaire et parfaitement centrée dans le poster.
	•	Elle occupe ≈ 70 % de la hauteur totale et 80 % de la largeur totale.
	•	Style de l’illustration :
	•	Palette vive et contrastée : {palette de couleurs principales}.
	•	Traits peints plats, sans contours noirs, typique d’un style {style pictural / artistique}.
	•	Sujet :
	•	{nombre de personnages / éléments principaux}, représentés de façon minimale (aplats de couleurs, pas de contours).
	•	{postures ou actions caractéristiques}.
	•	Ils sont placés {organisation dans la composition, ex. légèrement décalés} pour créer un rythme visuel.
	•	Arrière-plan :
	•	{description du paysage ou décor stylisé : ex. plage, ville, montagne…}.
	•	Le ciel est traité dans des tons {couleurs du ciel}, rappelant une {moment de la journée / atmosphère}.

⸻

3. Texte du haut (titre principal)
	•	Position : centré horizontalement au-dessus de l’image, dans la bande blanche supérieure.
	•	Texte : {TITRE PRINCIPAL, ex. “BIARRITZ”}
	•	Police :
	•	Sans-serif propre et géométrique (ressemble à Helvetica Neue ou Futura).
	•	Majuscules uniquement.
	•	Espacement entre les lettres (tracking élargi : environ +50 à +80).
	•	Taille : proportionnelle à la largeur → environ 80 % de la largeur de l’image.
	•	Placement :
	•	Aligné au centre exact de la largeur.
	•	Espace entre le haut du texte et le bord supérieur ≈ 2 × la hauteur des lettres.
	•	Espace entre le bas du texte et l’image ≈ 1,5 × la hauteur des lettres.

⸻

4. Texte du bas (sous-titre / lieu et date)
	•	Position : centré horizontalement en dessous de l’image, dans la bande blanche inférieure.
	•	Texte : {SOUS-TITRE, ex. “FRANCE – 1956”}
	•	Police :
	•	Identique au texte du haut (sans-serif moderne).
	•	Majuscules uniquement.
	•	Espacement entre lettres : similaire ou légèrement réduit.
	•	Taille : ≈ 70 % de la taille du texte supérieur.
	•	Placement :
	•	Aligné au centre exact.
	•	Espace entre le haut du texte et l’image ≈ 1,5 × la hauteur des lettres.
	•	Espace entre le bas du texte et le bord inférieur ≈ 2 × la hauteur des lettres.

⸻

5. Hiérarchie visuelle

L’œil du spectateur suit l’ordre suivant :
	1.	Le titre en haut ({TITRE PRINCIPAL}).
	2.	L’illustration centrale ({sujet stylisé et coloré}).
	3.	Le sous-titre en bas ({SOUS-TITRE}).

⸻

6. Récap proportions simplifiées
	•	Hauteur (100 unités) :
	•	Bande blanche supérieure : ≈ 15 unités.
	•	Image : ≈ 70 unités.
	•	Bande blanche inférieure : ≈ 15 unités.
	•	Largeur (100 unités) :
	•	Bande blanche gauche : ≈ 10 unités.
	•	Image : ≈ 80 unités.
	•	Bande blanche droite : ≈ 10 unités.`;

const MOUNTAINS_VECTOR_RETRO_STYLE = `
1. Format & Composition
	•	Format vertical (portrait), proportions d’affiche classique.
	•	Image en pleine page sans marges ni cadre apparent : le visuel occupe tout l’espace.
	•	Composition construite en plans superposés (avant-plan, milieu, arrière-plan), créant une profondeur scénique marquée.

⸻

2. Palette & Couleurs
	•	Palette restreinte et harmonisée : dominance de tons chauds orangés/ocres pour l’ambiance générale (ciel, lumière, montagnes).
	•	Contraste avec des tons verts et bleu pétrole pour certains éléments secondaires.
	•	Utilisation de dégradés doux et progressifs : transitions lissées entre zones lumineuses et ombrées, sans contours nets.
	•	Pas de couleurs saturées “violentes” : tout reste légèrement adouci, avec une cohérence chromatique (teinte chaude appliquée globalement, créant une ambiance coucher de soleil).

⸻

3. Lignes & Formes
	•	Absence totale de contours noirs : les objets sont définis uniquement par leurs aplats de couleur et les contrastes de ton.
	•	Les formes sont simplifiées et géométrisées (pas de détails superflus, pas de texture).
	•	Angles doux, arrondis sur certains éléments (routes, collines), contrastant avec des formes anguleuses et découpées (montagnes).
	•	Travail graphique basé sur des aplats homogènes avec de légères variations tonales.

⸻

4. Ombres & Lumière
	•	Éclairage uniforme et directionnel (provenant du soleil bas à l’horizon).
	•	Les ombres sont stylisées : aplats colorés plus sombres, sans dégradés réalistes ni textures.
	•	Pas de reflets brillants ou détails photographiques → tout est traité en mode illustration vectorielle / sérigraphie.

⸻

5. Texture & Rendu
	•	Rendu lisse et net : aucune texture de papier, grain ou effet de pinceau.
	•	Style très proche de l’illustration vectorielle numérique ou des affiches sérigraphiées vintage.
	•	Aspect graphique/affiche et non pictural : absence de coups de pinceaux ou effets réalistes.

⸻

6. Style général & Références
	•	Style rétro-vintage, inspiré des affiches touristiques des années 70–80.
	•	Proche de l’art du travel poster ou des illustrations de magazines de voyage anciens.
	•	Mélange entre minimalisme (formes simplifiées, pas de détails) et dramatisme chromatique (couleurs chaudes, contrastes marqués).
	•	Atmosphère cinématographique : composition centrée, perspectives exagérées, couleurs évocatrices d’un coucher de soleil.

⸻
`;

const EPURER_SOBRE = `
1. Format général
	•	Le poster est en format vertical (portrait).
	•	Il est encadré par une large bordure blanche uniforme sur les quatre côtés.
	•	Proportions visuelles de la bordure :
	•	Haut et bas : ≈ 12–15 % de la hauteur totale.
	•	Côtés gauche et droit : ≈ 8–10 % de la largeur totale.
	•	Cet encadrement crée un effet de cadre épuré, rappelant les affiches d’exposition artistique.

⸻

2. Image centrale
	•	L’image est rectangulaire et parfaitement centrée dans le poster.
	•	Elle occupe ≈ 70 % de la hauteur et 80–85 % de la largeur du format total.
	•	Style visuel :
	•	Minimaliste et moderne, inspiré de l’Art Déco et des affiches touristiques vintage.
	•	Utilisation de dégradés peints et aplats de couleurs (principalement tons bleus et variations de clair/foncé).
	•	Pas de contours noirs : uniquement des transitions douces.
	•	Arrière-plan composé de formes géométriques simplifiées (souvent montagnes, collines, ou aplats abstraits).

⸻

3. Sujet principal
	•	Au premier plan, {personnage ou élément stylisé} en mouvement, placé au centre ou légèrement décalé.
	•	Le sujet est traité en aplats de couleurs unies, sans détails réalistes ni traits du visage.
	•	Les proportions sont simplifiées et harmonieuses pour conserver une esthétique graphique.
	•	Exemple d’intégration : {un joueur en action, un surfeur, un randonneur, un cycliste…}, en contraste avec le fond géométrique.

⸻

4. Texte & typographie
	•	En partie supérieure, un titre en deux lignes :
	•	Première ligne : mot court en police manuscrite ou cursive fine (ex. : Ski → ici remplacé par Jeu).
	•	Deuxième ligne : nom du pays ou lieu, en majuscules, police sans-serif large et espacée.
	•	Le texte est centré, de couleur blanche, et se détache clairement du fond.
`;

export const posterCatalog: PosterCatalogItem[] = [
  {
    id: 'surfTorch',
    title: 'Surf à la Torch',
    priceCents: 4499,
    imageUrl: '/images/poster666.png',
    rating: 4.8,
    ratingCount: 59,
    stripePriceId: '',
    stylePrompt: VINTAGE_APLATS_STYLE,
  },
  {
    id: 'rolandgarros',
    title: 'Tennis à Roland Garros',
    priceCents: 4499,
    imageUrl: '/images/poster777.png',
    rating: 4.5,
    ratingCount: 65,
    stripePriceId: '',
    stylePrompt: STYLE_CADRE_BLANC_VIN,
  },
  {
    id: 'rando-mont-fuji',
    title: 'Randonné au Mont Fuji ',
    priceCents: 4499,
    imageUrl: '/images/poster111.png',
    rating: 4.8,
    ratingCount: 128,
    stripePriceId: 'price_vintage_cote_azur_a2',
    stylePrompt: VINTAGE_APLATS_STYLE,
  },
  {
    id: 'plongeon-zurich',
    title: 'Plongeon de Zurich',
    priceCents: 4499,                  // affichage seulement, le paiement reste format×qualité
    imageUrl: '/images/poster555.png',
    rating: 4.6,
    ratingCount: 58,
    stripePriceId: '',                 // pas utilisé aujourd’hui, laisse vide
    stylePrompt: VINTAGE_APLATS_STYLE
  },
  {
    id: 'tennis-paris',
    title: 'Tennis à Paris',
    priceCents: 4499,
    imageUrl: '/images/poster999.png',
    rating: 4.7,
    ratingCount: 26,
    stripePriceId: 'price_street_art_pop_a2',
    stylePrompt: EPURER_SOBRE,
  },
  
  {
    id: 'plongee-koh-tao',
    title: 'Plongée a Koh Tao',
    priceCents: 4499,
    imageUrl: '/images/poster444.png',
    rating: 4.7,
    ratingCount: 203,
    stripePriceId: 'price_street_art_pop_a2',
    stylePrompt: VINTAGE_APLATS_STYLE,
  },
  {
    id: 'reserve-afrique-sud',
    title: 'Réserve Afrique du Sud',
    priceCents: 4499,
    imageUrl: '/images/poster888.png',
    rating: 4.4,
    ratingCount: 17,
    stripePriceId: 'price_street_art_pop_a2',
    stylePrompt: VINTAGE_APLATS_STYLE,
  },
  {
    id: 'football-paris',
    title: 'Football à Paris',
    priceCents: 4499,
    imageUrl: '/images/poster1212.png',
    rating: 4.7,
    ratingCount: 28,
    stripePriceId: 'price_minimaliste_rivage_a2',
    stylePrompt: EPURER_SOBRE,
  },

  
  {
    id: 'wing-foil-boston',
    title: 'Wing Foil à Boston',
    priceCents: 4499,
    imageUrl: '/images/poster1010.png',
    rating: 4.5,
    ratingCount: 34,
    stripePriceId: 'price_minimaliste_rivage_a2',
    stylePrompt: VINTAGE_APLATS_STYLE,
  }, 
  {
    id: 'plongee-corse',
    title: 'Plongée en Corse',
    priceCents: 4499,
    imageUrl: '/images/poster1111.png',
    rating: 4.3,
    ratingCount: 17,
    stripePriceId: 'price_minimaliste_rivage_a2',
    stylePrompt: STYLE_CADRE_BLANC_VIN,
  },
  {
    id: 'surfeurs-vintage',
    title: '2 surfeurs vintage',
    priceCents: 4499,
    imageUrl: '/images/poster222.png',
    rating: 4.6,
    ratingCount: 76,
    stripePriceId: 'price_minimaliste_rivage_a2',
    stylePrompt: STYLE_CADRE_BLANC_VIN,
  },
  {
    id: 'Surf-californie',
    title: 'Surf en Californie',
    priceCents: 4499,
    imageUrl: '/images/poster1313.png',
    rating: 4.1,
    ratingCount: 12,
    stripePriceId: 'price_minimaliste_rivage_a2',
    stylePrompt: STYLE_CADRE_BLANC_VIN,
  },
 
  {
    id: 'montagne-alpes',
    title: '4x4 au milieu des montagnes',
    priceCents: 4499,
    imageUrl: '/images/poster333.png',
    rating: 4.5,
    ratingCount: 59,
    stripePriceId: 'price_city_vintage_a2',
    stylePrompt: MOUNTAINS_VECTOR_RETRO_STYLE,
  },
  
];

export function findPosterById(id: string | null | undefined): PosterCatalogItem | null {
  if (!id) return null;
  return posterCatalog.find((p) => p.id === id) || null;
}



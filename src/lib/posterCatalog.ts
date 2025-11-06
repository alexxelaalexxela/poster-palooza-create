// Optional per-poster metadata loaded from JSON (labels, rank, note)
// You can edit src/lib/postersMeta.json to control labels/rank/rating per ID
// JSON shape: { "1": { "labels": ["ville"], "rank": 1, "note": 4.5 }, ... }
// Vite bundler supports JSON imports
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import postersMeta from './postersMeta.json';

export interface PosterCatalogItem {
  id: string;
  title: string;
  styleName?: string; // short style label used in UI
  priceCents: number;
  imageUrl: string;
  imageOnlyUrl?: string; // poster-only variant used for adaptation reference
  rating: number; // 0–5
  ratingCount: number;
  stripePriceId: string; // reserved for future use (Stripe Price ID)
  stylePrompt: string; // used to augment prompt when customizing
  labels?: string[]; // e.g., ['ville','vintage']
  rank?: number;     // preferred order (1..N)
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

// Build catalog dynamically from Supabase Storage
// Base path configurable via environment for easy deployment changes
const SUPABASE_LIBRARY_BASE: string = 'https://jzjwaadxzaqvsjcnqabj.supabase.co/storage/v1/object/public/assets/posters';
const SUPABASE_LIBRARY_MAX: number = 109;

// Labels and order defined in code (fill as needed)
// Only allowed labels: 'voiture', 'ville', 'vintage', 'art'
const ALLOWED_LABELS = ['voiture', 'ville', 'vintage', 'art'];
// Optional overrides; leave empty to auto-generate for all 1..110
const LABELS_BY_ID: Record<string, string[]> = {};
// Optional rank overrides; by default rank = id (1..110)
const RANK_BY_ID: Record<string, number> = {};

type PosterMeta = { labels?: string[]; rank?: number; note?: number; ratingCount?: number; title?: string };
const META_BY_ID: Record<string, PosterMeta> = (postersMeta as any) || {};

function defaultLabelsForId(idNum: number): string[] {
  // Deterministic 1-2 labels from allowed set, covering all 110 IDs
  const a = ALLOWED_LABELS[(idNum - 1) % ALLOWED_LABELS.length];
  const b = ALLOWED_LABELS[Math.floor((idNum - 1) / ALLOWED_LABELS.length) % ALLOWED_LABELS.length];
  return a === b ? [a] : [a, b];
}

function buildImageUrl(id: string, withFrame: boolean): string {
  if (SUPABASE_LIBRARY_BASE) {
    const file = withFrame ? `${id}_cadre.png` : `${id}.png`;
    return `${SUPABASE_LIBRARY_BASE}/${id}/${file}`;
    
  }
  // Fallback to local and avoid breaking builds
  return withFrame ? `/images/${id}.png` : `/images/${id}.png`;
}

export const posterCatalog: PosterCatalogItem[] = Array.from({ length: SUPABASE_LIBRARY_MAX }, (_, i) => {
  const id = String(i + 1);
  const idNum = i + 1;
  const meta = META_BY_ID[id] || {};
  // Rank is optional preference (lower = higher). If not provided in JSON or overrides, leave undefined.
  const rank = (typeof meta.rank === 'number' ? meta.rank : undefined) ?? (RANK_BY_ID[id] !== undefined ? RANK_BY_ID[id] : undefined);
  const labelsRaw = (Array.isArray(meta.labels) && meta.labels.length ? meta.labels : (LABELS_BY_ID[id] && LABELS_BY_ID[id]!.length ? LABELS_BY_ID[id]! : defaultLabelsForId(idNum)));
  const labels = labelsRaw.filter((l) => ALLOWED_LABELS.includes(l));
  const rating = typeof meta.note === 'number' ? meta.note : 0;
  const ratingCount = typeof meta.ratingCount === 'number' ? meta.ratingCount : 0;
  const title = (typeof meta.title === 'string' && meta.title.trim()) ? meta.title.trim() : `Poster ${id}`;
  return {
    id,
    title,
    styleName: 'Neoma',
    priceCents: 4499,
    imageUrl: buildImageUrl(id, true),
    imageOnlyUrl: buildImageUrl(id, false),
    rating,
    ratingCount,
    stripePriceId: '',
    stylePrompt: VINTAGE_APLATS_STYLE,
    labels,
    rank,
  };
}).sort((a, b) => {
  const ra = typeof a.rank === 'number' ? a.rank : Number.POSITIVE_INFINITY;
  const rb = typeof b.rank === 'number' ? b.rank : Number.POSITIVE_INFINITY;
  if (ra !== rb) return ra - rb;
  return Number(a.id) - Number(b.id);
});

export function findPosterById(id: string | null | undefined): PosterCatalogItem | null {
  if (!id) return null;
  return posterCatalog.find((p) => p.id === id) || null;
}



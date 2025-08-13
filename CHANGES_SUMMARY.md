# Résumé des modifications - Système de tentatives

## Vue d'ensemble

Ce projet a été modifié pour implémenter un nouveau système de gestion des tentatives qui permet :

- **3 tentatives** pour les visiteurs anonymes (au lieu d'1)
- **3 tentatives** pour les utilisateurs gratuits (avec récupération des tentatives utilisées avant inscription)
- **15 tentatives** pour les utilisateurs payants
- **Récupération automatique** des tentatives lors de la création de compte

## Fichiers modifiés

### 1. Nouveaux composants créés

#### `src/components/AttemptsCounter.tsx`

- Composant qui affiche le nombre de tentatives restantes
- Gère les visiteurs anonymes et les utilisateurs connectés
- Affiche une barre de progression colorée selon le pourcentage restant
- S'adapte au statut de paiement de l'utilisateur

### 2. Composants modifiés

#### `src/components/PromptBar.tsx`

- Ajout du composant `AttemptsCounter` au-dessus de la barre de prompt
- Import de `useNavigate` pour la navigation
- Affichage des tentatives restantes en temps réel

#### `src/components/UpgradeModal.tsx`

- Adaptation du modal selon le type d'utilisateur (anonyme vs connecté)
- Messages et boutons personnalisés selon le contexte
- Utilisation du hook `useAuth` pour détecter le statut

#### `src/pages/Account.tsx`

- Ajout d'une section "Account Status" avec le compteur de tentatives
- Affichage du statut de paiement (Free vs Premium)
- Bouton d'upgrade pour les utilisateurs non payés
- Interface améliorée avec des icônes et animations

#### `src/pages/Pricing.tsx`

- Mise à jour des limites affichées (3 au lieu de 5 pour le plan gratuit)
- Mise à jour du plan Pro (15 au lieu de 100 tentatives)

### 3. Fonction Edge modifiée

#### `supabase/functions/generate-posters/index.ts`

- Logique de vérification des tentatives mise à jour
- Gestion des 3 tentatives pour les visiteurs anonymes
- Comptage correct des tentatives utilisées
- Mise à jour de la table `visitor_user_links` avec `generation_count`

### 4. Migrations SQL créées

#### `supabase/migrations/001_update_handle_new_user.sql`

- Fonction `handle_new_user` mise à jour pour récupérer automatiquement les tentatives
- Initialisation des nouveaux utilisateurs avec 3 tentatives gratuites
- Calcul des tentatives restantes basé sur l'utilisation précédente

#### `supabase/migrations/002_update_claim_visitor_posters.sql`

- Fonction `claim_visitor_posters` simplifiée et compatible
- Gestion de la récupération manuelle des tentatives si nécessaire

#### `supabase/migrations/003_update_decrement_generations.sql`

- Fonction `decrement_generations` améliorée avec gestion d'erreurs
- Logs de débogage ajoutés

## Nouvelles fonctionnalités

### 1. Compteur de tentatives en temps réel

- Affichage visuel du nombre de tentatives restantes
- Barre de progression colorée (vert, jaune, rouge)
- Mise à jour automatique après chaque génération

### 2. Gestion intelligente des tentatives

- Les visiteurs anonymes ont 3 tentatives
- Les utilisateurs gratuits récupèrent leurs tentatives non utilisées
- Les utilisateurs payants ont 15 tentatives par mois

### 3. Récupération automatique

- Lors de la création de compte, les tentatives utilisées sont automatiquement récupérées
- Les posters générés avant inscription sont associés au compte
- Calcul automatique des tentatives restantes

### 4. Interface utilisateur améliorée

- Modal d'upgrade adaptatif selon le contexte
- Page de compte avec informations détaillées
- Indicateurs visuels clairs pour le statut

## Structure de données

### Table `visitor_user_links`

- Nouveau champ `generation_count` pour compter les tentatives utilisées
- Champ `last_generated_at` pour le suivi temporel

### Table `profiles`

- Champ `generations_remaining` géré automatiquement
- Champ `is_paid` pour distinguer les utilisateurs gratuits et payants

### Table `visitor_posters`

- Association automatique des posters aux comptes utilisateurs
- Conservation de l'historique des générations

## Logique métier

### 1. Visiteurs anonymes

```
Tentatives disponibles = 3 - tentatives_utilisées
Si tentatives_restantes > 0 → autoriser la génération
Sinon → afficher le modal d'upgrade
```

### 2. Utilisateurs gratuits

```
Tentatives_initiales = 3
Tentatives_utilisées_avant_inscription = generation_count_visiteur
Tentatives_restantes = MAX(0, 3 - tentatives_utilisées_avant_inscription)
```

### 3. Utilisateurs payants

```
Tentatives_disponibles = 15
Décrémentation automatique après chaque génération
```

## Sécurité et validation

### 1. Vérifications côté serveur

- Validation des tentatives restantes avant génération
- Protection contre la manipulation côté client
- Gestion des erreurs et exceptions

### 2. Politiques d'accès

- Fonctions SQL avec `SECURITY DEFINER`
- Vérification des permissions utilisateur
- Isolation des données entre utilisateurs

## Tests et validation

### 1. Tests automatisés

- Vérification du comptage des tentatives
- Test de la récupération automatique
- Validation des limites et blocages

### 2. Tests manuels

- Test des visiteurs anonymes
- Test de création de compte
- Test des utilisateurs payants
- Vérification de l'interface utilisateur

## Déploiement

### 1. Migrations

- Appliquer les migrations SQL dans l'ordre
- Vérifier la création des fonctions et triggers
- Tester les nouvelles fonctionnalités

### 2. Application

- Redémarrer l'application après les migrations
- Vérifier que les composants s'affichent correctement
- Tester le flux complet de génération

## Maintenance

### 1. Monitoring

- Surveiller les logs des fonctions Edge
- Vérifier la cohérence des données
- Suivre l'utilisation des tentatives

### 2. Évolutions futures

- Possibilité d'ajouter des plans intermédiaires
- Système de renouvellement automatique des tentatives
- Analytics d'utilisation et de conversion

## Support et dépannage

### 1. Problèmes courants

- Compteur qui ne s'affiche pas
- Tentatives non comptées
- Échec de la récupération automatique

### 2. Solutions

- Vérification des migrations SQL
- Test des fonctions individuellement
- Validation de la cohérence des données

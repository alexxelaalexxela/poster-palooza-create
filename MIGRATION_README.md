# Migration Guide - Mise à jour du système de tentatives

Ce guide explique comment appliquer les migrations nécessaires pour mettre à jour le système de gestion des tentatives des utilisateurs.

## Vue d'ensemble des changements

1. **Visiteurs anonymes** : 3 tentatives au lieu d'1
2. **Utilisateurs gratuits** : 3 tentatives (récupération des tentatives utilisées avant inscription)
3. **Utilisateurs payants** : 15 tentatives par mois
4. **Récupération automatique** des tentatives lors de la création de compte

## Fichiers de migration

### 1. `supabase/migrations/001_update_handle_new_user.sql`

- Met à jour la fonction `handle_new_user` pour initialiser correctement les tentatives
- Récupère automatiquement les tentatives des visiteurs anonymes
- Initialise les nouveaux utilisateurs avec 3 tentatives gratuites

### 2. `supabase/migrations/002_update_claim_visitor_posters.sql`

- Met à jour la fonction `claim_visitor_posters` pour la compatibilité
- Gère la récupération manuelle des tentatives si nécessaire

### 3. `supabase/migrations/003_update_decrement_generations.sql`

- Améliore la fonction `decrement_generations` avec une meilleure gestion d'erreurs
- Ajoute des logs pour le débogage

## Comment appliquer les migrations

### Option 1 : Via l'interface Supabase

1. Allez dans votre projet Supabase
2. Naviguez vers "SQL Editor"
3. Exécutez chaque fichier de migration dans l'ordre

### Option 2 : Via la CLI Supabase

```bash
# Dans le dossier supabase/
supabase db push
```

### Option 3 : Manuellement

1. Ouvrez chaque fichier de migration
2. Copiez le contenu SQL
3. Collez-le dans l'éditeur SQL de Supabase
4. Exécutez chaque migration

## Vérification

Après avoir appliqué les migrations, vérifiez que :

1. **La fonction `handle_new_user`** est bien mise à jour
2. **La fonction `claim_visitor_posters`** est compatible
3. **La fonction `decrement_generations`** fonctionne correctement

## Test des nouvelles fonctionnalités

1. **Test visiteur anonyme** :

   - Créez un nouveau visiteur
   - Vérifiez qu'il peut générer 3 posters
   - Vérifiez qu'il est bloqué après la 3ème génération

2. **Test création de compte** :

   - Créez un compte avec un visiteur qui a utilisé 2 tentatives
   - Vérifiez qu'il a 1 tentative restante (3 - 2 = 1)

3. **Test utilisateur payant** :
   - Vérifiez qu'un utilisateur payant a 15 tentatives
   - Testez la décrémentation des tentatives

## Structure de la base de données

### Table `profiles`

- `id` : UUID de l'utilisateur
- `email` : Email de l'utilisateur
- `generations_remaining` : Nombre de tentatives restantes
- `is_paid` : Statut de paiement (boolean)

### Table `visitor_user_links`

- `visitor_id` : Identifiant du visiteur anonyme
- `user_id` : UUID de l'utilisateur (NULL si anonyme)
- `generation_count` : Nombre de tentatives utilisées
- `last_generated_at` : Date de dernière génération

### Table `visitor_posters`

- `visitor_id` : Identifiant du visiteur
- `url` : URL de l'image générée
- `user_id` : UUID de l'utilisateur (NULL si anonyme)

## Dépannage

### Erreur "function does not exist"

- Vérifiez que les migrations ont été appliquées dans l'ordre
- Vérifiez que les fonctions sont bien créées dans le schéma `public`

### Erreur de permissions

- Assurez-vous que les fonctions ont les bonnes permissions (`SECURITY DEFINER`)
- Vérifiez les politiques RLS si nécessaire

### Problèmes de comptage

- Vérifiez que la logique de récupération des tentatives fonctionne
- Testez avec des cas limites (0, 1, 2, 3 tentatives utilisées)

## Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans la console Supabase
2. Testez les fonctions individuellement
3. Vérifiez la cohérence des données dans les tables

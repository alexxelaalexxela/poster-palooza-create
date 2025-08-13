# Guide de test du système de tentatives

Ce guide vous aide à tester que le nouveau système de gestion des tentatives fonctionne correctement.

## Prérequis

1. Avoir appliqué toutes les migrations SQL
2. Avoir redémarré l'application
3. Avoir un navigateur en mode incognito pour tester les visiteurs anonymes

## Test 1 : Visiteur anonyme

### Étape 1 : Test des 3 tentatives

1. Ouvrez l'application dans un onglet incognito
2. Vérifiez que le compteur affiche "3/3 tentatives restantes"
3. Générez un premier poster → doit afficher "2/3 tentatives restantes"
4. Générez un deuxième poster → doit afficher "1/3 tentatives restantes"
5. Générez un troisième poster → doit afficher "0/3 tentatives restantes"

### Étape 2 : Test du blocage

1. Essayez de générer un 4ème poster
2. Vérifiez que le modal d'upgrade s'affiche
3. Vérifiez que le message indique "Créez votre compte !"

## Test 2 : Création de compte avec récupération

### Étape 1 : Préparation

1. Notez l'ID du visiteur anonyme (via les outils de développement)
2. Utilisez 2 tentatives sur ce visiteur
3. Vérifiez qu'il reste 1 tentative

### Étape 2 : Création de compte

1. Créez un compte avec l'email du visiteur
2. Vérifiez que le profil est créé avec `generations_remaining = 1`
3. Vérifiez que les posters générés sont associés au compte

### Étape 3 : Vérification

1. Connectez-vous au compte
2. Vérifiez que le compteur affiche "1/3 tentatives restantes"
3. Générez un poster → doit afficher "0/3 tentatives restantes"

## Test 3 : Utilisateur payant

### Étape 1 : Simulation du paiement

1. Connectez-vous à un compte existant
2. Via l'interface Supabase, mettez `is_paid = true` et `generations_remaining = 15`
3. Rafraîchissez l'application

### Étape 2 : Test des 15 tentatives

1. Vérifiez que le compteur affiche "15/15 générations restantes"
2. Générez plusieurs posters
3. Vérifiez que le compteur décrémente correctement
4. Vérifiez que l'utilisateur peut générer jusqu'à 15 posters

## Test 4 : Cas limites

### Test avec 0 tentative restante

1. Créez un utilisateur avec `generations_remaining = 0`
2. Essayez de générer un poster
3. Vérifiez que l'erreur "Limit reached" est retournée

### Test avec visiteur sans historique

1. Créez un nouveau visiteur anonyme
2. Vérifiez qu'il peut générer 3 posters
3. Vérifiez que le compteur fonctionne correctement

## Test 5 : Interface utilisateur

### Vérification du compteur

1. Vérifiez que le composant `AttemptsCounter` s'affiche
2. Vérifiez que les couleurs changent selon le pourcentage :
   - Vert : > 66% des tentatives restantes
   - Jaune : 33-66% des tentatives restantes
   - Rouge : < 33% des tentatives restantes

### Vérification des modales

1. Testez le modal d'upgrade pour les visiteurs anonymes
2. Testez le modal d'upgrade pour les utilisateurs connectés
3. Vérifiez que les messages et boutons sont appropriés

## Test 6 : Base de données

### Vérification des tables

1. Vérifiez que `visitor_user_links.generation_count` est correctement incrémenté
2. Vérifiez que `profiles.generations_remaining` est correctement décrémenté
3. Vérifiez que les liens entre visiteurs et utilisateurs sont corrects

### Vérification des fonctions

1. Testez `decrement_generations` manuellement
2. Testez `claim_visitor_posters` manuellement
3. Vérifiez que `handle_new_user` se déclenche correctement

## Dépannage

### Problème : Compteur ne s'affiche pas

- Vérifiez que le composant `AttemptsCounter` est bien importé
- Vérifiez les erreurs dans la console du navigateur
- Vérifiez que les requêtes Supabase fonctionnent

### Problème : Tentatives non comptées

- Vérifiez que la fonction `generate-posters` met à jour `visitor_user_links`
- Vérifiez que la fonction `decrement_generations` fonctionne
- Vérifiez les logs dans la console Supabase

### Problème : Récupération des tentatives échoue

- Vérifiez que `handle_new_user` se déclenche
- Vérifiez que les métadonnées `visitor_id_to_claim` sont bien passées
- Vérifiez que la logique de calcul des tentatives restantes est correcte

## Validation finale

Après tous les tests, vérifiez que :

✅ Les visiteurs anonymes ont 3 tentatives  
✅ Les utilisateurs gratuits ont 3 tentatives (avec récupération)  
✅ Les utilisateurs payants ont 15 tentatives  
✅ Le compteur s'affiche correctement  
✅ Les modales d'upgrade sont appropriées  
✅ La base de données est cohérente  
✅ Les fonctions SQL fonctionnent correctement

## Commandes utiles

### Vérifier les fonctions dans Supabase

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public';
```

### Vérifier les triggers

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

### Vérifier les données d'un visiteur

```sql
SELECT * FROM visitor_user_links WHERE visitor_id = 'VOTRE_VISITOR_ID';
```

### Vérifier le profil d'un utilisateur

```sql
SELECT * FROM profiles WHERE id = 'UUID_UTILISATEUR';
```

# Readme

## Docker CLI

* build: ´dcub´
* run:   ´dcu´
* stop:  ´dcs´

## React CLI

* run the server: ´npm run dev´

------------------------------------------------------------------------------------------------------------------------
# IDEA -----------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------
### Phase 1 : Backend - L'Entité User et la base de données (Dans `focusboard-api`)

1. **Créer l'entité User :**
* On va utiliser la commande magique de Symfony : `php bin/console make:user`.
* On va choisir `username` (ou `email`, comme tu préfères) comme identifiant, et on va lui dire de hasher le mot de passe.


2. **Lier la Board au User :**
* On va modifier ton entité actuelle `src/Entity/Board.php`.
* On ajoute une relation (`ManyToOne`) : Une `Board` appartient à un `User`, et un `User` peut avoir plusieurs `Boards`.
* On lance `php bin/console make:migration` puis `php bin/console doctrine:migrations:migrate` pour mettre à jour ta base de données MySQL.



### Phase 2 : Backend - L'Authentification JWT

1. **Installer le bundle JWT :**
* API Platform gère la donnée, mais pas la connexion en elle-même. On va utiliser le bundle standard pour ça : `composer require lexik/jwt-authentication-bundle`.


2. **Configurer `security.yaml` :**
* On va créer une route `/api/login_check`.
* Quand React enverra le `username` et le `password` sur cette route, Symfony va vérifier si c'est correct et renvoyer un "Token" (une longue chaîne de caractères cryptée).


3. **Sécuriser les Boards :**
* Dans API Platform, on va ajouter une restriction pour que lorsqu'on appelle `GET /api/boards`, l'API ne renvoie **que** les boards du `User` actuellement connecté au lieu de toutes les boards de la base.
* On fera en sorte que lors d'un `POST /api/boards`, le backend associe automatiquement la nouvelle board au User connecté.



### Phase 3 : Frontend - Connexion et Sécurité (Dans `focusboard-front`)

1. **La Page de Login :**
* Créer un nouveau composant `src/pages/Login.jsx` avec un simple formulaire (Username / Password).


2. **Stocker le Token :**
* Quand l'utilisateur se connecte avec succès, on récupère le fameux Token et on le stocke dans le navigateur (le `localStorage` est le plus simple pour commencer).


3. **L'Intercepteur de requêtes :**
* Actuellement, ton React fait des appels API (sûrement avec `fetch` ou `axios`).
* Il va falloir modifier ces appels pour "attacher" le Token à chaque requête, en ajoutant un header : `Authorization: Bearer <ton_token>`. Sinon, API Platform bloquera l'accès.


4. **Protéger les routes (React Router) :**
* Si l'utilisateur n'a pas de Token, on le redirige automatiquement vers la page `/login`.

 commencer par le backend (Phase 1) : on crée le `User`, on modifie la `Board`, et on vérifie que la base de données est propre. Tu es chaud pour lancer quelques commandes `bin/console` ?
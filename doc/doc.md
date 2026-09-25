# Documentation sécurité — Backend NestJS

## 1. Contexte

Ce document retrace le travail réalisé sur le backend `cybersecu-nest-exo-master`, depuis la récupération du projet jusqu'aux corrections et tests de sécurité effectués sur la branche `lucas-security`.

### Dépôt

- Repository : `cybersecu-nest-exo-master`
- Branche de travail : `lucas-security`
- Branche principale : `main`

### Répartition

- Jean : hachage des mots de passe avec bcrypt
- Isabelle : rôles et guards backend
- Christophe : permissions/guards frontend
- Soreangsey : cookies JWT frontend et XSS
- Lucas : secrets/.env, audit JWT backend, dépendances, SQL injection, rate limiting, CORS, tests et documentation.

---

# 2. Récupération et fusion du backend

Le dépôt backend a été cloné dans :

```text
Desktop/
└── cybercollab/
    └── backend/
        └── cybersecu-nest-exo-master/
```

Les travaux backend des autres membres ont ensuite été intégrés.

La branche d'Isabelle :

```text
origin/feature/backend-auth-guards
```

a été fusionnée.

Un conflit est apparu dans :

```text
src/auth/auth.service.ts
```

Il a été résolu avec :

```powershell
git checkout --ours src/auth/auth.service.ts
```

Puis les fichiers ont été ajoutés et commités.

Commit de fusion :

```text
4932e9d merge backend auth guards
```

L'historique contenait également le travail de Jean sur bcrypt :

```text
bf3c8cf bcrypt added...
```

Le backend dispose donc de l'authentification JWT, des guards et du hachage bcrypt.

---

# 3. Audit des dépendances

Installation des dépendances :

```powershell
npm install
```

L'audit npm initial indiquait :

```text
5 vulnerabilities
2 low
1 moderate
2 high
```

Les dépendances impliquées comprenaient notamment :

- `tmp`
- `external-editor`
- `inquirer`
- `@nestjs/mau`
- `undici`

Un test de :

```powershell
npm audit fix --force
```

a été effectué.

Cette commande a modifié notamment `@nestjs/mau` et réduit le nombre de vulnérabilités, mais cette modification forcée était indépendante du travail de sécurité et pouvait introduire une modification incompatible.

La modification a donc été annulée.

### Décision

Ne pas utiliser `npm audit fix --force` sans vérifier précisément les conséquences.

L'audit npm devra être repris dans la phase finale.

---

# 4. Découverte du problème PostgreSQL

La configuration initiale de `src/app.module.ts` contenait des identifiants directement dans le code :

```ts
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'jonson',
  database: 'CSBack',
  autoLoadEntities: true,
  synchronize: true,
})
```

### Problème

Le mot de passe PostgreSQL était écrit en clair dans le code source.

Il devait être déplacé dans une variable d'environnement.

---

# 5. Vérification de PostgreSQL

Le service PostgreSQL utilisé était :

```text
postgresql-x64-18
```

PostgreSQL n'écoutait pas sur le port 5432.

La configuration réelle indiquait :

```text
listen_addresses = '*'
port = 5000
```

Le serveur écoutait donc sur le port :

```text
5000
```

La base `CSBack` n'existait pas initialement.

---

# 6. Mise en place de `.env`

Le package NestJS Config a été installé :

```powershell
npm install @nestjs/config
```

Un fichier `.env` a été créé avec :

```env
DB_HOST=localhost
DB_PORT=5000
DB_USERNAME=postgres
DB_PASSWORD=TON_VRAI_MOT_DE_PASSE_POSTGRES
DB_DATABASE=CSBack
JWT_SECRET=TON_SECRET_JWT
```

Les vraies valeurs secrètes ne doivent pas être placées dans ce document.

Le `.gitignore` contenait déjà :

```text
.env
```

Le fichier `.env` doit donc rester hors du dépôt Git.

---

# 7. Correction de TypeORM

`src/app.module.ts` utilise désormais `ConfigModule` et `ConfigService`.

```ts
ConfigModule.forRoot({
  isGlobal: true,
}),
```

La connexion TypeORM a été transformée en configuration asynchrone :

```ts
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: Number(configService.get<string>('DB_PORT')),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    autoLoadEntities: true,
    synchronize: true,
  }),
}),
```

Le mot de passe PostgreSQL n'est donc plus écrit dans le code.

---

# 8. Création de la base

La base a été créée avec :

```powershell
& "C:\Program Files\PostgreSQL8in\createdb.exe" -U postgres -p 5000 CSBack
```

Après cela, NestJS a démarré correctement et TypeORM a créé les tables.

Les tables principales vérifiées étaient :

```text
user
item
```

### Remarque

`synchronize: true` est conservé pour le développement, mais devra être réévalué avant une utilisation en production. Des migrations sont préférables en production.

---

# 9. Création de la branche de travail

Afin de ne pas travailler directement sur `main` :

```powershell
git switch -c lucas-security
```

La branche actuelle est :

```text
lucas-security
```

La branche principale reste :

```text
main
```

---

# 10. Commit de la sécurisation de la base

Les fichiers concernés étaient :

```text
package.json
package-lock.json
src/app.module.ts
```

Commit :

```text
2fbd14a security: move database config to environment
```

État de l'historique :

```text
2fbd14a (HEAD -> lucas-security) security: move database config to environment
4932e9d (main) merge backend auth guards
```

---

# 11. Audit JWT initial

Une recherche a été réalisée dans `src` pour identifier les éléments JWT :

```powershell
Get-ChildItem -Recurse -File src |
  Select-String -Pattern "JwtModule|JwtService|signAsync|sign\(|verify|verifyAsync|jwt|expiresIn|secret"
```

Les fichiers concernés étaient notamment :

```text
src/auth/auth.module.ts
src/auth/auth.service.ts
src/auth/constants.ts
src/auth/jwt-auth.guard.ts
src/auth/types.ts
```

---

# 12. Problème du secret JWT

Le secret JWT était initialement écrit directement dans :

```text
src/auth/constants.ts
```

avec :

```ts
export const jwtConstants = {
  secret: 'cybersecu-todo-jwt-secret',
};
```

### Problème

Le secret était présent dans le code source.

Un secret JWT ne doit pas être versionné dans le dépôt.

---

# 13. Déplacement du secret JWT dans `.env`

La variable suivante a été ajoutée au `.env` :

```env
JWT_SECRET=TON_SECRET_JWT
```

Le secret n'est plus destiné à être stocké dans le code source.

Une première tentative utilisant directement :

```ts
process.env.JWT_SECRET
```

a provoqué l'erreur :

```text
Error: secretOrPrivateKey must have a value
```

Le problème venait du chargement/configuration de la variable au moment où le module JWT était initialisé.

---

# 14. Correction avec `ConfigService`

`src/auth/auth.module.ts` utilise maintenant `JwtModule.registerAsync()` :

```ts
JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    secret: configService.getOrThrow<string>('JWT_SECRET'),
    signOptions: { expiresIn: '1h' },
  }),
}),
```

Cela permet à NestJS de récupérer correctement :

```text
JWT_SECRET
```

depuis `.env`.

---

# 15. Correction du `JwtAuthGuard`

Le guard utilisait initialement :

```ts
verifyAsync(token, {
  secret: jwtConstants.secret
});
```

Il utilise maintenant `ConfigService` :

```ts
const payload = await this.jwtService.verifyAsync(token, {
  secret: this.configService.getOrThrow<string>('JWT_SECRET'),
});
```

Le constructeur contient :

```ts
constructor(
  private readonly jwtService: JwtService,
  private readonly configService: ConfigService,
) {}
```

Le secret utilisé pour signer et vérifier les tokens provient donc de la même variable d'environnement.

---

# 16. Vérification de compilation

Après les corrections JWT :

```text
Found 0 errors.
```

et :

```text
Nest application successfully started
```

Les routes d'authentification étaient disponibles :

```text
POST /auth/register
POST /auth/login
```

---

# 17. Création d'un utilisateur de test

La table `user` était initialement vide.

Un utilisateur a donc été créé via :

```text
POST /auth/register
```

avec des données de test.

Le mot de passe a été enregistré sous forme de hash bcrypt :

```text
$2b$...
```

Le mot de passe en clair n'est donc pas stocké en base.

---

# 18. Test du login

Un premier test de login a échoué avec :

```text
500 Internal server error
```

Le terminal NestJS a permis d'identifier :

```text
Error: secretOrPrivateKey must have a value
```

Cette erreur a conduit à la correction de `JwtModule.registerAsync()`.

Après correction, le login fonctionne et renvoie :

```text
access_token
```

---

# 19. Test d'une route protégée

Le token généré a été conservé localement dans PowerShell :

```powershell
$response = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"lucas-test@test.com","password":"Test1234!"}'

$token = $response.access_token
```

Puis :

```powershell
Invoke-RestMethod -Method Get `
  -Uri "http://localhost:3000/item" `
  -Headers @{ Authorization = "Bearer $token" }
```

La requête a fonctionné sans retourner de `401`.

La chaîne complète est donc validée :

```text
POST /auth/login
        ↓
bcrypt.compare()
        ↓
JWT signé avec JWT_SECRET
        ↓
Authorization: Bearer <token>
        ↓
JwtAuthGuard
        ↓
JWT vérifié avec JWT_SECRET
        ↓
GET /item
        ↓
accès autorisé
```

---

# 20. Vérification du payload JWT

Le payload du JWT a été décodé localement.

Résultat :

```json
{
  "sub": 1,
  "role": "user",
  "iat": 1790305619,
  "exp": 1790309219
}
```

Le token contient :

- `sub` : identifiant utilisateur
- `role` : rôle utilisateur
- `iat` : date de création
- `exp` : expiration

Le mot de passe n'est pas présent dans le JWT.

La différence entre `exp` et `iat` est de :

```text
3600 secondes = 1 heure
```

La durée correspond donc bien à :

```ts
signOptions: { expiresIn: '1h' }
```

---

# 21. Résultat de l'audit JWT

| Élément | État |
|---|---|
| Création JWT | ✅ |
| Expiration | ✅ 1 heure |
| Payload | ✅ `sub` + `role` |
| Mot de passe dans le JWT | ✅ absent |
| Vérification JWT | ✅ |
| `JwtAuthGuard` | ✅ |
| Secret JWT codé en dur | ❌ corrigé |
| Secret dans `.env` | ✅ |
| Login testé | ✅ |
| Route protégée testée | ✅ |

### Conclusion

Le JWT backend a été audité, corrigé et testé.

Le secret JWT n'est plus stocké directement dans le code source.

Le même secret issu de `.env` est utilisé pour signer et vérifier les tokens.

---

# 22. Problème découvert : hash bcrypt renvoyé par l'API

Lors de l'inscription, la réponse API a montré le champ :

```text
password: $2b$...
```

Il s'agit du hash bcrypt, pas du mot de passe en clair.

Cependant, ce hash ne devrait pas être renvoyé au client.

### Correction à prévoir

Les réponses de l'API doivent supprimer le champ :

```text
password
```

avant de retourner l'utilisateur au frontend.

Cette correction reste à effectuer.

---

# 23. État actuel

## Terminé

- [x] Récupération du backend
- [x] Fusion des travaux backend
- [x] bcrypt intégré
- [x] Guards JWT intégrés
- [x] Protection des routes
- [x] Audit initial des dépendances
- [x] Identification des secrets en dur
- [x] Installation de `@nestjs/config`
- [x] Création de `.env`
- [x] Déplacement des identifiants PostgreSQL dans `.env`
- [x] Configuration TypeORM avec `ConfigService`
- [x] Création de la base `CSBack`
- [x] Création de la branche `lucas-security`
- [x] Déplacement du secret JWT dans `.env`
- [x] Configuration `JwtModule.registerAsync()`
- [x] Modification du `JwtAuthGuard`
- [x] Test de l'inscription
- [x] Test du login
- [x] Test d'une route protégée avec JWT
- [x] Vérification du payload JWT
- [x] Vérification de l'expiration à 1 heure

## À faire

- [ ] Corriger le renvoi du hash bcrypt dans les réponses API
- [ ] Tester les injections SQL
- [ ] Mettre/tester le rate limiting
- [ ] Vérifier/configurer CORS
- [ ] Refaire l'audit final des dépendances
- [ ] Tests de sécurité globaux
- [ ] Documentation finale
- [ ] Commit des dernières corrections
- [ ] Push de `lucas-security`
- [ ] Pull Request vers `main`

---

# 24. Commits importants

```text
4932e9d merge backend auth guards
```

Fusion des travaux d'authentification et guards backend.

```text
2fbd14a security: move database config to environment
```

Déplacement de la configuration sensible PostgreSQL vers `.env`.

Branche actuelle :

```text
lucas-security
```

Branche principale :

```text
main
```

---

# 25. Vérifications avant le push

Avant de pousser la branche, vérifier :

```powershell
git status
```

Puis :

```powershell
git ls-files .env
```

La commande ne doit rien retourner.

Vérifier les commits propres à la branche :

```powershell
git log --oneline --decorate main..lucas-security
```

Vérifier les différences :

```powershell
git diff main..lucas-security --stat
```

Ne jamais faire :

```powershell
git add .env
```

Les secrets PostgreSQL et JWT doivent rester hors du dépôt.

---

# 26. Suite du travail

Ordre prévu :

1. Corriger la fuite du hash bcrypt.
2. Tester les injections SQL.
3. Mettre en place/tester le rate limiting.
4. Vérifier CORS.
5. Refaire l'audit final des dépendances.
6. Effectuer les tests globaux.
7. Commit des corrections.
8. Push de `lucas-security`.
9. Créer la Pull Request vers `main`.

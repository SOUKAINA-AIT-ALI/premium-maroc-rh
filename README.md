# Suivi des Périodes d’Essai — Groupe Premium Maroc

Application interne destinée au suivi des périodes d’essai des collaborateurs du Groupe Premium Maroc. Elle réunit dans un même espace le travail de l’Assistante RH et celui des Responsables hiérarchiques : création des dossiers, planification des évaluations, saisie des fiches officielles, suivi des échéances et décision finale.

## Fonctionnalités principales

### Authentification

- Connexion par adresse e-mail et mot de passe.
- Séparation des accès selon deux rôles : **Assistante RH** et **Responsable hiérarchique**.
- Authentification par JWT envoyé dans l’en-tête `Authorization` des requêtes.
- Jeton conservé uniquement en mémoire dans le navigateur, et non dans `localStorage`.
- Déconnexion automatique et retour à la page de connexion lorsque le jeton est absent ou expiré.
- Changement de mot de passe depuis le profil du Responsable.

Le nouveau mot de passe doit contenir entre 8 et 72 caractères, avec au moins une majuscule, une minuscule et un chiffre.

### Espace Assistante RH

L’Assistante RH peut :

- consulter le tableau de bord de suivi des collaborateurs ;
- rechercher un collaborateur ;
- voir la prochaine échéance et le statut de son évaluation ;
- créer un collaborateur et l’affecter à un Responsable hiérarchique ;
- consulter la fiche détaillée d’un collaborateur ;
- suivre les deux phases obligatoires de son évaluation ;
- consulter les fiches d’évaluation remplies ;
- ajouter une note interne RH sur une évaluation ;
- enregistrer la décision finale après la deuxième évaluation ;
- générer le document de décision et déposer sa version signée ;
- consulter et enrichir le répertoire des Responsables.

### Espace Responsable

Le Responsable hiérarchique peut :

- consulter uniquement les collaborateurs qui lui sont affectés ;
- voir les compteurs de son équipe et des évaluations à traiter ;
- consulter la liste complète de son équipe ;
- afficher ses évaluations regroupées en **À faire**, **À venir** et **Terminées** ;
- repérer clairement les évaluations en retard ;
- ouvrir et remplir la fiche officielle d’évaluation ;
- soumettre une évaluation et enregistrer automatiquement sa date de réception ;
- consulter son nom et son adresse e-mail ;
- modifier son propre mot de passe.

Un Responsable ne peut pas consulter ou modifier le dossier d’un collaborateur rattaché à un autre Responsable.

## Cycle d’une période d’essai

Lors de la création d’un collaborateur, les dates sont calculées automatiquement à partir de la date d’embauche :

| Étape | Calcul |
|---|---|
| Évaluation de phase 1 | Date d’embauche + 2 mois |
| Fin de période 1 | Date d’embauche + 3 mois |
| Évaluation de phase 2 | Date d’embauche + 5 mois |
| Fin de période 2 | Date d’embauche + 6 mois |

Chaque évaluation suit ensuite ce cycle :

1. **Non échue / À venir** : la date d’évaluation n’est pas encore atteinte.
2. **En cours** : le jour de l’échéance, un e-mail est envoyé au Responsable avec un lien direct vers la fiche.
3. **En cours pendant 7 jours** : le Responsable peut compléter et soumettre la fiche.
4. **Évaluée / Terminée** : la fiche a été soumise et la date de réception est enregistrée.
5. **En retard** : aucune réponse n’a été reçue à l’expiration du délai de 7 jours.

La vérification automatique est programmée chaque jour à **08:00**. L’horaire peut être modifié avec la propriété `app.evaluations.deadline-cron`.

## Fiche officielle d’évaluation

Le formulaire reprend la grille officielle **PS07PR02IN02FO02**, notamment :

- l’évaluation des objectifs ;
- les compétences professionnelles et techniques ;
- les aptitudes personnelles et le comportement professionnel ;
- les bonnes pratiques QSE ;
- les appréciations générales, points forts et axes d’amélioration ;
- la recommandation et le bloc de validation finale.

La version imprimable est isolée des sidebars de l’application. Elle conserve les bandeaux rouges, répète l’en-tête sur chaque page et est mise en forme pour une impression sur quatre pages.

## Technologies utilisées

### Frontend

- React 19
- TypeScript
- Vite 8
- Lucide React pour les icônes
- Vitest pour les tests

### Backend

- Java 21
- Spring Boot 4
- Spring Web et Validation
- Spring Security avec JWT
- Spring Data JPA
- Spring Mail
- MariaDB
- Maven Wrapper

## Organisation du projet

```text
premium-maroc-rh/
├── frontend/                   Interface React/TypeScript
│   ├── public/                 Ressources publiques
│   ├── src/
│   │   ├── components/         Écrans et composants visuels
│   │   ├── api.ts              Accès à l’API
│   │   ├── AuthContext.tsx     Session utilisateur en mémoire
│   │   ├── App.tsx             Navigation principale
│   │   ├── index.css           Styles écran et impression
│   │   └── types.ts            Modèles TypeScript
│   └── package.json
├── backend-spring/             API Spring Boot
│   ├── .mvn/                   Fichiers du Maven Wrapper
│   ├── src/main/java/          Code applicatif backend
│   ├── src/main/resources/     Configuration
│   ├── src/test/               Tests backend
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
├── .gitignore
└── README.md
```

## Prérequis

Installer les outils suivants :

- **Git** ;
- **Java JDK 21** ;
- **Node.js 22 LTS** ou une version compatible avec Vite 8, avec npm ;
- **MariaDB** en service local ou distant.

Il n’est pas nécessaire d’installer Maven globalement : le projet contient `mvnw` et `mvnw.cmd`.

Vérification rapide sous PowerShell :

```powershell
git --version
java -version
node --version
npm --version
```

## Préparation de MariaDB

Créer une base vide en utilisant un compte MariaDB autorisé :

```sql
CREATE DATABASE premium_rh
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Par défaut, le backend essaie de se connecter avec les valeurs suivantes :

```text
URL       : jdbc:mariadb://127.0.0.1:3306/premium_rh
Utilisateur : root
Mot de passe : vide
```

Ces valeurs sont adaptées à certains environnements locaux seulement. Pour une autre configuration, définir les variables avant de lancer le backend :

```powershell
$env:DB_URL = "jdbc:mariadb://127.0.0.1:3306/premium_rh"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "VOTRE_MOT_DE_PASSE_MARIADB"
$env:JWT_SECRET = "UNE_CLE_LONGUE_ALEATOIRE_D_AU_MOINS_32_OCTETS"
```

Les variables définies ainsi restent valables uniquement dans le terminal PowerShell courant.

Au démarrage, la structure des tables est mise à jour par l’application avec `spring.jpa.hibernate.ddl-auto=update`.

## Configuration du frontend

L’API est appelée par défaut à l’adresse `http://localhost:8080`. Pour utiliser une autre adresse, créer le fichier local `frontend/.env.local` :

```dotenv
VITE_API_URL=http://localhost:8080
```

Les fichiers `.env` et `.env.local` sont ignorés par Git afin d’éviter de publier une configuration sensible.

## Lancement du projet sous Windows

Ouvrir **deux terminaux PowerShell** à la racine du projet.

### 1. Démarrer le backend

```powershell
cd backend-spring
.\mvnw.cmd spring-boot:run
```

Le backend est disponible sur :

```text
http://localhost:8080
```

Vérification de santé :

```text
http://localhost:8080/api/health
```

### 2. Démarrer le frontend

Dans le deuxième terminal :

```powershell
cd frontend
npm install
npm run dev
```

Ouvrir ensuite :

```text
http://localhost:5173
```

## Lancement sous Linux ou macOS

Backend :

```bash
cd backend-spring
./mvnw spring-boot:run
```

Frontend :

```bash
cd frontend
npm install
npm run dev
```

## Configuration de l’envoi automatique des e-mails

L’envoi SMTP est désactivé par défaut. Pour l’activer, configurer un serveur SMTP avant le démarrage du backend :

```powershell
$env:MAIL_ENABLED = "true"
$env:MAIL_FROM = "no-reply@votre-domaine.ma"
$env:FRONTEND_URL = "http://localhost:5173"
$env:SPRING_MAIL_HOST = "smtp.votre-domaine.ma"
$env:SPRING_MAIL_PORT = "587"
$env:SPRING_MAIL_USERNAME = "UTILISATEUR_SMTP"
$env:SPRING_MAIL_PASSWORD = "MOT_DE_PASSE_SMTP"
```

Selon le fournisseur SMTP, il peut également être nécessaire d’activer STARTTLS :

```powershell
$env:SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH = "true"
$env:SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE = "true"
```

Lorsqu’une évaluation arrive à échéance, l’e-mail contient :

- le nom du collaborateur ;
- la phase concernée ;
- la date d’échéance ;
- la date limite de réponse ;
- un lien direct vers la fiche d’évaluation.

Si le SMTP est désactivé ou si l’envoi échoue, aucun e-mail réel n’est envoyé. Consulter les journaux du backend pour identifier la cause.

## Tests et vérifications

### Backend

Sous Windows :

```powershell
cd backend-spring
.\mvnw.cmd test
```

Sous Linux ou macOS :

```bash
cd backend-spring
./mvnw test
```

### Frontend

```powershell
cd frontend
npm install
npm test -- --run
npm run lint
npm run build
```

Lors de la dernière vérification du projet :

- backend : **11 tests réussis**, 0 échec, 0 erreur ;
- frontend : **23 tests réussis**, 0 échec ;
- build frontend : réussi.

## Endpoints principaux de l’API

Toutes les routes, sauf la connexion et le contrôle de santé, nécessitent un JWT valide.

| Méthode | Endpoint | Accès | Utilité |
|---|---|---|---|
| `GET` | `/api/health` | Public | Vérifier que l’API fonctionne |
| `POST` | `/api/auth/login` | Public | Se connecter et recevoir un JWT |
| `POST` | `/api/auth/change-password` | Utilisateur connecté | Modifier son propre mot de passe |
| `GET` | `/api/responsables` | RH | Lister les Responsables |
| `GET` | `/api/responsables/{id}` | RH ou Responsable concerné | Consulter un Responsable |
| `POST` | `/api/responsables` | RH | Créer un Responsable |
| `GET` | `/api/employes` | RH ou Responsable | Lister les collaborateurs autorisés |
| `GET` | `/api/employes/{id}` | RH ou Responsable affecté | Consulter un collaborateur |
| `POST` | `/api/employes` | RH | Créer un collaborateur et ses deux évaluations |
| `GET` | `/api/evaluations` | RH ou Responsable | Lister les évaluations autorisées |
| `GET` | `/api/evaluations/{id}` | RH ou Responsable affecté | Consulter une évaluation |
| `PUT` | `/api/evaluations/{id}` | Responsable affecté | Soumettre la fiche d’évaluation |
| `PATCH` | `/api/evaluations/{id}/note-rh` | RH | Modifier la note interne RH |
| `GET` | `/api/decisions` | RH | Lister les décisions finales |
| `POST` | `/api/decisions` | RH | Créer une décision finale |
| `POST` | `/api/decisions/{id}/document-signe` | RH | Déposer un document signé |
| `GET` | `/api/decisions/{id}/document` | RH | Obtenir le document de décision |
| `GET` | `/api/decisions/{id}/document-signe` | RH | Télécharger le document signé |

Une tentative d’accès sans authentification renvoie une réponse `401`. Une tentative authentifiée mais interdite renvoie une réponse `403` explicite.

## Sécurité et préparation d’un déploiement

Avant un déploiement réel :

1. définir une valeur forte et stable dans `JWT_SECRET` ;
2. utiliser un compte MariaDB dédié avec des droits limités ;
3. ne jamais versionner les mots de passe ou secrets SMTP ;
4. désactiver les données initiales avec `APP_SEED_ENABLED=false` ;
5. remplacer ou supprimer tous les comptes locaux créés pendant le développement ;
6. configurer HTTPS et un domaine autorisé pour le frontend ;
7. adapter l’origine CORS actuellement prévue pour `http://localhost:5173` ;
8. sauvegarder la base MariaDB et le dossier des documents signés.

En l’absence de `JWT_SECRET`, une clé temporaire est générée au démarrage. Cela convient uniquement au développement : tous les jetons deviennent invalides à chaque redémarrage du backend.

Les documents signés sont enregistrés localement dans `backend-spring/uploads/decisions-signees`. Ce dossier est ignoré par Git et doit être sauvegardé séparément en environnement réel. La taille maximale d’un envoi est de 4 Mo.

## Fichiers à ne pas publier

Le fichier `.gitignore` exclut notamment :

- `frontend/node_modules/` ;
- `frontend/dist/` ;
- `backend-spring/target/` ;
- `backend-spring/uploads/` ;
- les fichiers `.env` et `.env.local` ;
- les fichiers temporaires des IDE et de l’automatisation navigateur.

Avant chaque envoi vers Git, vérifier :

```powershell
git status
git diff --cached
```

## Dépannage rapide

### Le frontend indique qu’il ne peut pas joindre le serveur

- vérifier que le backend est lancé sur le port `8080` ;
- ouvrir `http://localhost:8080/api/health` ;
- vérifier la valeur de `VITE_API_URL`.

### Le backend ne démarre pas

- vérifier `java -version` et confirmer Java 21 ;
- vérifier que MariaDB est démarré ;
- vérifier le nom de la base, l’utilisateur et le mot de passe ;
- vérifier qu’aucun autre programme n’utilise le port `8080`.

### La commande Maven n’est pas reconnue

Utiliser le wrapper fourni :

```powershell
.\mvnw.cmd test
```

Il ne faut pas utiliser obligatoirement une installation globale avec `mvn test`.

### Les e-mails ne partent pas

- confirmer que `MAIL_ENABLED=true` ;
- vérifier les paramètres SMTP ;
- vérifier l’adresse `MAIL_FROM` ;
- consulter les messages du terminal backend ;
- vérifier que le fournisseur SMTP autorise l’authentification utilisée.

## Utilisation

Projet destiné à un usage interne du Groupe Premium Maroc. Les données personnelles, documents signés et informations d’évaluation doivent être manipulés conformément aux règles internes de confidentialité et de sécurité.

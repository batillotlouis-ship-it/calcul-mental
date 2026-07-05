# Calcul mental

Appli d'entraînement quotidien au calcul mental (2min30, 6 niveaux progressifs, difficulté adaptative).
Toutes les données (profil, historique) restent stockées en local sur l'appareil de l'élève (localStorage) — pas de serveur, pas de compte.

## Déployer sur Vercel — étapes précises

### 1. Prérequis
- Un compte GitHub (gratuit) : github.com
- Un compte Vercel (gratuit) : vercel.com — inscription "Continue with GitHub"
- Node.js installé sur ton ordinateur (nodejs.org, prends la version LTS)

### 2. Tester en local (optionnel mais recommandé)
Ouvre un terminal dans ce dossier `calcul-mental/` et lance :
```bash
npm install
npm run dev
```
Ça ouvre l'appli sur `http://localhost:5173` — vérifie que tout marche avant de déployer.

### 3. Mettre le code sur GitHub
Toujours dans le dossier `calcul-mental/` :
```bash
git init
git add .
git commit -m "Première version"
```
Puis sur github.com : "New repository" → nomme-le `calcul-mental` → ne coche aucune case (pas de README/gitignore, ils existent déjà) → "Create repository".
GitHub t'affiche ensuite des commandes à copier-coller, du type :
```bash
git remote add origin https://github.com/TON-PSEUDO/calcul-mental.git
git branch -M main
git push -u origin main
```
Exécute-les dans ton terminal.

### 4. Déployer sur Vercel
1. Va sur vercel.com, connecté avec ton compte GitHub.
2. Clique "Add New..." → "Project".
3. Trouve et sélectionne le dépôt `calcul-mental` dans la liste → "Import".
4. Vercel détecte automatiquement "Vite" comme framework — ne change rien aux réglages.
5. Clique "Deploy".
6. Après 30-60 secondes, Vercel te donne une URL du type `calcul-mental-xxxx.vercel.app`.

C'est cette URL que tu donnes à tes élèves. Elle est stable, gratuite, et t'appartient.

### 5. Mettre à jour l'appli plus tard
Si tu modifies le code (toi-même ou en redemandant à Claude), il suffit de repousser sur GitHub :
```bash
git add .
git commit -m "Description du changement"
git push
```
Vercel redéploie automatiquement à chaque push, aucune manip supplémentaire côté Vercel.

### 6. Domaine personnalisé (optionnel)
Si tu as un nom de domaine (ex: `calcul.louisbatillot.fr`), dans le projet Vercel : Settings → Domains → ajoute ton domaine et suis les instructions DNS affichées.

## Limite à connaître
Les données (profil, meilleurs scores) sont stockées uniquement sur l'appareil de chaque élève (localStorage du navigateur). Si un élève change de téléphone ou vide le cache de son navigateur, son historique est perdu. Il n'y a pas de classement partagé entre élèves avec cette version.

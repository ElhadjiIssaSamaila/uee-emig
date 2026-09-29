# Site de l'UEE — Union des Élèves de l'EMIG

Site officiel pour publier les activités de l'UEE (titre, date, lieu, photos),
commenter une activité, consulter la galerie complète et présenter le bureau
exécutif (une "gestion" par année, avec ses 7 postes).

- **Frontend** : JavaScript (React + Vite)
- **Backend** : Python (FastAPI)
- **Base de données** : PostgreSQL

## 1. Arborescence

```
uee-emig/
  backend/     API FastAPI + connexion PostgreSQL
  frontend/    Site React (public + tableau de bord admin)
```

## 2. Préparer la base de données PostgreSQL

Tu as dit avoir déjà installé PostgreSQL. Crée juste la base et l'utilisateur :

```sql
-- Dans psql (invite "postgres=#")
CREATE DATABASE uee_emig;
CREATE USER uee_user WITH PASSWORD 'uee_password';
GRANT ALL PRIVILEGES ON DATABASE uee_emig TO uee_user;
```

Adapte le nom de la base, l'utilisateur et le mot de passe si tu préfères
autre chose : tu les retrouveras dans `backend/.env` à l'étape suivante.

## 3. Lancer le backend (API)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # sous Windows : venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Ouvre .env et vérifie DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, SECRET_KEY

uvicorn app.main:app --reload --port 8000
```

Au premier lancement, l'API :
- crée automatiquement les tables dans PostgreSQL ;
- crée le compte administrateur avec l'e-mail/mot de passe défini dans `.env`.

Pour remplir le site avec des activités et un bureau de démonstration
(les photos que tu as fournies sont déjà copiées dans `backend/uploads/activities/`) :

```bash
python -m app.seed
```

L'API est alors disponible sur **http://localhost:8000** (documentation
interactive sur http://localhost:8000/docs).

## 4. Lancer le frontend (site)

Dans un second terminal :

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:8000 par défaut
npm run dev
```

Le site est alors disponible sur **http://localhost:5173**.

## 5. Se connecter à l'espace administrateur

Va sur `http://localhost:5173/admin/connexion` et connecte-toi avec
l'e-mail/mot de passe défini dans `backend/.env` (`ADMIN_EMAIL` /
`ADMIN_PASSWORD`). Depuis le tableau de bord tu peux :

- **Activités** : publier une nouvelle activité (titre, date, lieu,
  description, plusieurs photos), ajouter des photos à une activité
  existante, supprimer une activité.
- **Bureau** : créer une nouvelle gestion (mandat annuel) et remplir les
  7 postes (SG, SG/A, SCP, SCAA, SCAS, SCACS, SCTG), chacun avec nom,
  prénom, option et photo.
- **Commentaires** : voir tous les commentaires laissés par les visiteurs
  et en supprimer si nécessaire (ils sont publiés directement sur le site,
  sans validation préalable).

## 6. Ce que voit un visiteur (sans compte)

- **Accueil** : fil chronologique des activités publiées.
- **Fiche d'une activité** : description complète, carrousel de photos qui
  défile automatiquement, et un formulaire pour laisser un commentaire
  (visible immédiatement sur la page).
- **Galerie** : toutes les photos de toutes les activités, cliquables en
  plein écran.
- **Bureau** : onglets par année de gestion, avec les 7 postes du bureau.

## 7. Mettre le site en ligne (production)

Ceci fonctionne en local pour le développement. Pour le mettre en ligne :

- Backend : héberger l'API FastAPI (ex. un VPS avec `gunicorn`/`uvicorn`
  derrière Nginx, ou une plateforme comme Railway/Render) et pointer
  `DATABASE_URL` vers ta base PostgreSQL de production.
- Frontend : `npm run build` dans `frontend/` génère un dossier `dist/`
  à déposer sur n'importe quel hébergement statique (Nginx, Netlify,
  Vercel...), en réglant `VITE_API_URL` vers l'URL publique de l'API.
- Change impérativement `SECRET_KEY` et `ADMIN_PASSWORD` avant la mise en
  ligne.

## 8. Notes techniques

- Authentification admin par JWT (`python-jose` + `passlib`/`bcrypt`).
- Les photos envoyées sont stockées dans `backend/uploads/` et servies par
  l'API sur `/uploads/...`.
- `backend/app/seed.py` est optionnel : il sert uniquement à démarrer avec
  du contenu d'exemple, tu peux le sauter si tu préfères tout créer depuis
  le tableau de bord.

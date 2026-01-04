## Mini Sports Platform

## Live link- https://sports-mini-platform.netlify.app/


<img width="1885" height="1082" alt="Screenshot 2026-01-04 204051" src="https://github.com/user-attachments/assets/8edcf065-6d3b-4e02-bae5-df00581c6cce" />

```
```
**Live Frontend URL (for testing):** [https://sports-mini-platform.netlify.app/](https://sports-mini-platform.netlify.app/)

**Live Backend URL (for testing):** [https://sports-mini-platform.vercel.app/](https://sports-mini-platform.vercel.app/)

A minimal sports/games platform with authentication, a games list, and favorites support.

**Contents**

- Backend: [backend](backend)
- Frontend: [frontend](frontend)

**Quick Links**

- Backend entry: [backend/server.js](backend/server.js)
- Frontend entry: [frontend/src/App.jsx](frontend/src/App.jsx)

## Setup Project backend

Prerequisites:

- Node.js 18+ and npm

- PostgreSQL (or a hosted Postgres like Neon)

- JWT(web token)

- Bcrypt (Hashing Passwords)

Backend
## Environment

Create a `.env` file in the `backend` folder (see `.env.example`). Required variables:

- `PORT` - backend port (default 5000)

##  Environment Variables backend
+Create a `.env` file in the `backend/` directory:
+

+PORT=5000

+JWT_SECRET=your_secret_key

+DB_URL=postgresql://user:password@localhost:5432/dbname

```bash
cd backend
npm install
# start server (or use nodemon if installed)
node server.js
```

The backend will auto-create `users` and `favorites` tables on startup (see `backend/db.js`).

## Setup Project frontend
Prerequisites:

- React JS 18+
- Vite
- Tailwind CSS



## Environment

Create a `.env` file in the `frontend` folder (see `.env.example`). Required variables:


##  Environment Variables frontend
+Create a `.env` file in the `backend/` directory:
+env

+VITE_API_BASE_URL=http://localhost:5000 

```bash
cd frontend
npm install
npm run dev
```

Open the frontend at the address shown by Vite (usually http://localhost:5173) and the backend at http://localhost:5000 by default.



```


Assessment Checklist & Implementation Status

- 2.1 User Authentication: implemented

  - Register: `POST /auth/register` (hashes passwords with bcrypt)
  - Login: `POST /auth/login` (returns JWT)
  - JWT used to protect favorites and games access

- 2.2 List Matches / Games: implemented

  - Data source: `backend/matches.json` (seeded mock data)
  - Games endpoint: `GET /games` (returns seeded games/matches)
  - Fields: `id`, `sport`, `league`, `team_a`, `team_b`, `start_time`, `provider`, `image`

- 2.3 Filter Functionality: implemented

  - Filter by sport and provider via query params: `GET /games?sport=Cricket&provider=Evolution`
  - Frontend offers button/tabs UI for sport and provider filtering

- 2.4 Favorite a Match / Game: implemented
  - Favorites persisted in Postgres `favorites` table
  - Endpoints: `POST /favorites/:gameId`, `DELETE /favorites/:gameId`, `GET /favorites`
  - Frontend heart button to toggle and a "Show Favorites" filter

Data Source

- Option used: Mock / Seeded Data — `backend/matches.json` contains seeded games/matches.

Backend Requirements

- Node.js + Express
- RESTful APIs with proper HTTP status codes and basic error handling
- Database: PostgreSQL (see `backend/db.js`)

API Endpoints (summary)

Authentication

- POST /auth/register — register new user
  - body: { name, email, password }
- POST /auth/login — login user
  - body: { email, password }
  - response: { token }

Games

- GET /games — list all games (supports filters)
  - optional query: `?sport=Cricket` and/or `?provider=Evolution`
- GET /matches — legacy endpoint (same data)

Favorites (authenticated)

- GET /favorites — returns array of favorited game IDs for the user
- POST /favorites/:gameId — add game to favorites
- DELETE /favorites/:gameId — remove game from favorites

Notes on authentication: include header `Authorization: Bearer <token>` for favorites endpoints.

Tech Stack

- Backend: Node.js, Express, PostgreSQL (pg), JWT, bcrypt
- Frontend: React, Vite, Axios, Tailwind CSS

Database
The backend uses a Postgres DB defined by `DB_URL`. The app will create these tables automatically:

- `users` (id, name, email, password, created_at)
- `favorites` (id, user_id, match_id, created_at)

Running examples
Fetch games (all):

```bash
curl http://localhost:5000/games
```

Fetch games filtered by sport:

```bash
curl "http://localhost:5000/games?sport=Cricket"
```

Add favorite (authenticated):

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" http://localhost:5000/favorites/1
```

Frontend Notes

- Pages: `Login`, `Register`, `Games`
- UI includes loading states, empty states, error alerts, and responsive layout

Bonus Features (status)

- Search: implemented
- Pagination/infinite scroll:  implemented
- Protected routes: implemented (`ProtectedRoute` component)
- Docker: provided
- Unit tests: not provided
- Deployment:  provided




```

## Docker Setup

This repository includes Dockerfiles and a `docker-compose.yml` to run the full stack locally (Postgres + backend + frontend).

Quick start using Docker Compose:

```bash
# from repository root
docker-compose build
docker-compose up
```

Services:

- `db` — Postgres (port 5432)
- `backend` — Node/Express (port 5000)
- `frontend` — built app served by nginx (exposed on host port 5173 mapping to container port 80)

Environment: the compose file sets a default `DB_URL` to `postgresql://postgres:postgres@db:5432/authdb`. You can override by creating an env file and passing it to `docker-compose` or editing `docker-compose.yml`.

Notes:

- The backend will create DB tables when it connects to Postgres.
- After containers are up, the frontend will be available at http://localhost:5173 and backend at http://localhost:5000.

---





Notes

- The backend reads game data from `backend/matches.json`. For production, move games to a DB or external API.
- `backend/db.js` automatically creates tables on startup.

---


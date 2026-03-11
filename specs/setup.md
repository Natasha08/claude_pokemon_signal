# Setup

## Prerequisites
- [mise](https://mise.jdx.dev/) — manages Node.js version
- PostgreSQL running locally

## First-time setup
```bash
mise install          # install Node.js
npm install           # install dependencies
createdb hello_world  # create the database
cp .env.example .env  # copy env template — fill in values
npm run migrate       # create tables
```

## Environment variables
Copy `.env.example` to `.env`. Never commit `.env` — it is gitignored.

| Variable       | Description                                      | Default   |
|----------------|--------------------------------------------------|-----------|
| `DATABASE_URL` | Postgres connection string                       | required  |
| `JWT_SECRET`   | Long random string for signing session JWTs      | required  |
| `PORT`         | Port for the API server                          | `3001`    |

## Running

In two separate terminals:

```bash
npm run server   # API server on http://localhost:3001
npm run dev      # Vite frontend on http://localhost:5173
```

## All commands

| Command            | Description                              |
|--------------------|------------------------------------------|
| `npm run dev`      | Start Vite frontend (port 5173)          |
| `npm run server`   | Start Express API server (port 3001)     |
| `npm run migrate`  | Create database tables                   |
| `npm run build`    | Production build                         |

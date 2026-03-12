# Setup

## Prerequisites
- [mise](https://mise.jdx.dev/) — manages Node.js version
- PostgreSQL running locally

## First-time setup
```bash
mise install          # install Node.js
npm install           # install dependencies
npm run setup         # install git hooks
cp .env.example .env  # copy env template — fill in values
createdb claude_pokemon  # create the database
npm run migrate       # create tables
```

## Environment variables
Copy `.env.example` to `.env`. Never commit `.env` — it is gitignored.

| Variable       | Description                                      | Default   |
|----------------|--------------------------------------------------|-----------|
| `DATABASE_URL` | Postgres connection string                       | `postgres://localhost/claude_pokemon` |
| `JWT_SECRET`   | Long random string for signing session JWTs      | required  |
| `PORT`         | Port for the API server                          | `3001`    |
| `ORIGIN`       | Allowed CORS origin for the frontend             | `http://localhost:5173` |

## Running

In two separate terminals:

```bash
npm run server   # API server on http://localhost:3001
npm run dev      # Vite frontend on http://localhost:5173
```

## Git hooks

A pre-commit hook blocks commits that change code files without also touching a `specs/` file. This enforces keeping specs in sync with the code.

The hook source lives at `scripts/pre-commit` and is installed by `npm run setup`. To bypass in a genuine exception: `git commit --no-verify`.

## All commands

| Command            | Description                              |
|--------------------|------------------------------------------|
| `npm run setup`    | Install git hooks (run once after clone) |
| `npm run dev`      | Start Vite frontend (port 5173)          |
| `npm run server`   | Start Express API server (port 3001)     |
| `npm run migrate`  | Create database tables                   |
| `npm run build`    | Production build                         |

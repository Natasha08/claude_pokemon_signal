# Hello World

## Prerequisites

- [mise](https://mise.jdx.dev/) — manages Node.js version
- PostgreSQL running locally

## Setup

```bash
mise install          # install Node.js
npm install           # install dependencies
cp .env.example .env  # copy env template
```

Edit `.env` and fill in `DATABASE_URL`, `JWT_SECRET`, and optionally `PORT`.

```bash
createdb hello_world  # create the database (if it doesn't exist)
npm run migrate       # create tables
```

## Running

In two separate terminals:

```bash
npm run server   # API server on http://localhost:3001
npm run dev      # Vite frontend on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173).

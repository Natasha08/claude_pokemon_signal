# Hello World

## Prerequisites

- [mise](https://mise.jdx.dev/) — manages Node.js version
- PostgreSQL running locally

## Setup

```bash
mise install          # install Node.js
npm install           # install dependencies
npm run setup         # install git hooks
cp .env.example .env  # copy env template — fill in values
createdb hello_world  # create the database
npm run migrate       # create tables
```

## Environment variables

| Variable       | Description                                 | Default                 |
|----------------|---------------------------------------------|-------------------------|
| `DATABASE_URL` | Postgres connection string                  | required                |
| `JWT_SECRET`   | Long random string for signing session JWTs | required                |
| `PORT`         | Port for the API server                     | `3001`                  |
| `ORIGIN`       | Allowed CORS origin for the frontend        | `http://localhost:5173` |

## Running

In two separate terminals:

```bash
npm run server   # API server on http://localhost:3001
npm run dev      # Vite frontend on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173).

# App Spec

## Overview
A full-stack web app with user authentication.

## Stack

### Frontend
- React (with hooks)
- React Router for navigation
- Tailwind CSS for styling
- shadcn/ui for components

### Backend
- Node.js + Express API server (`server/`)
- PostgreSQL via `postgres` (postgres.js)
- Passwords hashed with `bcryptjs`
- Sessions via JWT stored in an httpOnly cookie (`session`)

## Specs
- [Screens](./screens.md)
- [API](./api.md)
- [Database](./database.md)
- [Setup](./setup.md)

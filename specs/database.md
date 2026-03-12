# Database

PostgreSQL. Run `npm run migrate` to create tables.

## Table: `users`

| Column        | Type        | Notes         |
|---------------|-------------|---------------|
| id            | SERIAL PK   |               |
| username      | TEXT UNIQUE | required      |
| password_hash | TEXT        | bcrypt hash   |
| created_at    | TIMESTAMPTZ | default NOW() |

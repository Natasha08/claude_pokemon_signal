# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment

This project uses [mise](https://mise.jdx.dev/) to manage tooling. Run `mise install` to install the declared tool versions.

- **Runtime:** Node.js (latest, via `mise.toml`)

## Fresh clone setup

If the user asks you to set up the project locally, read `specs/setup.md` and follow the instructions there. Ask the user for any required values that have no default (e.g. `JWT_SECRET`). After setup is complete, ask the user if they'd like you to run the API server and frontend for them.

## Spec
Read the spec in `/specs/app.md` to build the app

**Keep specs up to date:** Any time you change behavior, UI, API shapes, database schema, or environment variables, update the relevant spec files in `/specs/` in the same commit.

**Environment variables:** Any time a new environment variable is added, update both `.env.example` and `specs/setup.md` in the same commit.

## Memory

Memory files live in `~/.claude/projects/-Users-natashaosborne-Projects-Engineering-hello-world/memory/`.

**When to update memory:**
- After any prompt that builds something or edits files — add an entry to `build_history.md` with the original prompt and a summary of what changed
- When the project state changes (new pages, routes, dependencies, commands) — update `project_state.md`
- When the user gives feedback on how to collaborate — add to `feedback.md`

**What to include in build_history entries:**
- The exact prompt the user sent
- Bullet list of files created or modified and what changed

## Commit messages

Each commit message should include:
- A short subject line summarizing the change
- A blank line
- The exact prompt the user entered that led to the changes
- A bullet list of files changed and what changed in each

When the prompt is a short reply to something Claude suggested (e.g. "yes", "do that", "can't i automate that"), add a sentence of context explaining what the user was responding to.

Example:
```
Add ORIGIN env var for CORS config

Prompt: "I need an environment variable for origin then. written similar to PORT, default to localhost, and add it to .env"

- server/index.js: added ORIGIN constant from process.env.ORIGIN, used in CORS origin config
- .env: added ORIGIN=http://localhost:5173
```

## last save point
claude --resume 3168e7e9-4b5e-4369-a981-6ab8da14734f

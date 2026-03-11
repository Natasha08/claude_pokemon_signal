# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment

This project uses [mise](https://mise.jdx.dev/) to manage tooling. Run `mise install` to install the declared tool versions.

- **Runtime:** Node.js (latest, via `mise.toml`)

## Spec
Read the spec in `/specs/app.md` to build the app

## Memory

Memory files live in `~/.claude/projects/-Users-natashaosborne-Projects-Engineering-hello-world/memory/`.

**When to update memory:**
- After any prompt that builds something or edits files — add an entry to `build_history.md` with the original prompt and a summary of what changed
- When the project state changes (new pages, routes, dependencies, commands) — update `project_state.md`
- When the user gives feedback on how to collaborate — add to `feedback.md`

**What to include in build_history entries:**
- The exact prompt the user sent
- Bullet list of files created or modified and what changed

## last save point
claude --resume e9af5f8f-818b-4053-9628-d3d02e3cd57e

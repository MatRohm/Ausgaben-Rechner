# Agent Instructions

> This file is shared by Claude Code and opencode. Claude Code reads it directly;
> opencode loads it through the root `AGENTS.md` symlink and reads the skills from
> `.claude/skills` natively.

This repository contains a Vue 3 + TypeScript frontend and an Express +
TypeScript backend with a SQLite database.

## General behavior

- Inspect the existing implementation before making changes.
- Follow existing naming, structure, and coding patterns.
- Make the smallest change necessary to satisfy the task.
- Do not introduce new npm packages unless necessary.
- Do not modify unrelated files.
- Do not suppress compiler or type-checker warnings without explaining why.

## Planning

- Always start a task with a plan, and present it fast: explore only as much
  as the plan needs, then state briefly what will change, which files are
  affected, and how the change will be verified.
- In the plan, suggest a beads issue that documents it (the plan in the
  issue's design field), so the decision survives the session.
- Do not create the beads issue preemptively. Create it only once the user
  has agreed to the plan or explicitly asked for the issue.
- When creating the issue, put the plan into the design field
  (`--design` / `--design-file`) and keep the description to what the issue
  is about and why (`--description`); do not put the plan into the
  description.

## TypeScript / Vue / Express guidelines

- Follow the repository's `.editorconfig` (2-space indent, LF line endings).
- Prefer strict TypeScript; avoid `any` unless necessary.
- Use the Vue 3 Composition API (`<script setup lang="ts">`).
- Keep the frontend layered consistently: API calls in `src/client/src/api.ts`,
  shared state in `src/client/src/composables/`, pages in `src/client/src/views/`,
  reusable pieces in `src/client/src/components/`.
- Keep the backend layered consistently: routes in `src/server/src/routes/`,
  data access in `src/server/src/repository.ts`, types in `src/server/src/types.ts`.
- Amounts are stored as integer cents (`amountCents`) to avoid floating-point
  errors.

## Validation

After modifying code, run:

    npm run build

If a command fails:

1. Read the error.
2. Determine whether the failure was caused by your changes.
3. Fix problems caused by your changes.
4. Run the relevant command again.

Do not claim that a change works unless it has been built/tested,
or explicitly state that validation could not be performed.

## Git

- Whenever a coding task is finished, you are allowed to commit the work
  in sensible, separate commits.
- **Do not push to remotes without explicit permission from the user** —
  pushing happens only when the user asks for it.
- Commit messages must follow Conventional Commits **and end with the tracked
  issue id** (e.g. `feat: show the week view as a tree (ausgaben-a3f2dd)`); both
  are enforced by the shared `commit-msg` hook (see README.md for the setup).

## Before creating new code

Before creating a new:

- component
- view
- route
- composable
- repository function
- API endpoint

search the repository for an existing equivalent.

Prefer reusing or extending existing components over creating duplicates.

## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Issues live in a local Dolt
database; sync uses `refs/dolt/data` on the git remote; `.beads/issues.jsonl` is a
passive export. The `beads` skill has the full workflow.

### Quick Reference

```bash
bd prime                # Load the full workflow context
bd ready                # Find available work
bd show <id>            # View issue details
bd update <id> --claim  # Claim work
bd close <id>           # Complete work
```

### Rules

- Run `bd prime` at the start of every session and whenever beads context is
  missing or stale (Claude Code loads it automatically through its SessionStart
  hook; opencode does not).
- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown
  TODO lists.
- Use `bd remember` for persistent knowledge — do NOT create ad hoc memory files
  such as MEMORY.md.
- Every task commit must have a beads issue associated with it; if none is
  given, create the one suggested in the plan once the user has agreed to it
  (see Planning). Committing against a closed issue is allowed when a fix for
  that issue is needed.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is
subordinate to explicit user, repository, and orchestrator instructions.

1. **Propose issues for remaining work** - Suggest beads for anything that needs
   follow-up; create them once the user agrees.
2. **Run quality gates** (if code changed) - `npm run build`.
3. **Update issue status** - Close finished work, update in-progress items.
4. **Handle git/sync**:

   ```bash
   git status

   # only with explicit approval:
   bd dolt push
   git push
   ```

5. **Hand off** - Summarize changes, validation, issue status, and any blocked
   sync/commit/push step.

**Critical rules:**

- Explicit user or orchestrator instructions override this Beads guidance.
- Do not commit or push without clear authority from the current user request.

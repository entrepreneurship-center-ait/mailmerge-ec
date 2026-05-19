# Domain Docs

## Layout

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root.

## Consumer Rules

- Skills read `CONTEXT.md` for project domain language, architecture, and conventions
- Skills read `docs/adr/` for past architectural decisions
- If `CONTEXT.md` does not exist, skills should infer domain from codebase structure
- If `docs/adr/` does not exist, skills should not assume prior decisions

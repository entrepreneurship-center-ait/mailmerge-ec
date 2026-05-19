# Issue Tracker: GitHub

This repo uses GitHub Issues for tracking work.

## Workflow

- Issues are created, updated, and queried using the `gh` CLI
- Skills like `to-issues`, `triage`, `to-prd` interact with GitHub Issues via `gh`
- The repo remote is: `https://github.com/entrepreneurship-center-ait/mailmerge-ec.git`

## Commands

- `gh issue create` — create new issue
- `gh issue list` — list issues
- `gh issue view <number>` — view issue details
- `gh issue edit <number> --add-label <label>` — apply labels
- `gh issue close <number>` — close issue

## Conventions

- Issues should be self-contained and actionable
- Use `ready-for-agent` label for fully-specified, AFK-ready issues
- Use `ready-for-human` for issues needing human implementation context

## Problem Statement

As a Google Workspace user, I need to send personalized emails to participants listed in spreadsheets, but currently lack a centralized dashboard to manage campaigns, templates, and sending — forcing manual, error-prone workflows.

## Solution

A web-based mailmerge dashboard that ingests participant data from CSV/Excel uploads or Google Sheets sync, provides a Gmail-like rich text editor with placeholder personalization, and sends emails via Gmail API with tracking, scheduling, and per-recipient status monitoring — all hosted free on Vercel with Supabase backend.

## User Stories

1. As a single user, I want to sign in with my Google institution account, so that I can securely access the dashboard
2. As a campaign manager, I want to create named campaigns, so that I can organize different email sends
3. As a campaign manager, I want to upload CSV/Excel files with participant data, so that I can quickly import recipient lists
4. As a campaign manager, I want to connect a Google Sheet, so that participant data syncs automatically
5. As a campaign manager, I want to write email templates using a Gmail-like rich text editor, so that I can format emails professionally
6. As a campaign manager, I want to insert {{placeholder}} variables (e.g., {{name}}, {{date}}), so that each email is personalized
7. As a campaign manager, I want to add inline images and file attachments to my email templates, so that emails are complete and professional
8. As a campaign manager, I want to preview emails with sample participant data, so that I can verify personalization before sending
9. As a campaign manager, I want to send emails immediately or schedule for later, so that I can control timing
10. As a campaign manager, I want to see real-time sending progress, so that I know how the campaign is proceeding
11. As a campaign manager, I want to see per-recipient status (sent/failed/bounced), so that I can track delivery
12. As a campaign manager, I want to view error messages for failed sends, so that I can troubleshoot issues
13. As a campaign manager, I want to configure sending rate limits, so that I respect Gmail API quotas
14. As a campaign manager, I want to manage multiple campaigns, so that I can track history and reuse templates
15. As a user, I want to search and filter participants, so that I can find specific recipients quickly

## Implementation Decisions

### Tech Stack
- **Frontend:** Next.js (React) with App Router, deployed on Vercel free tier
- **Backend:** Next.js API routes (serverless functions)
- **Database:** Supabase (PostgreSQL) on free tier
- **Email:** Gmail API with OAuth2 for Google Workspace institution email
- **Rich Text Editor:** TipTap or Slate.js for Gmail-like compose experience
- **Styling:** Tailwind CSS with shadcn/ui components

### Database Schema
- **campaigns** — id, name, template_html, template_text, status, created_at, scheduled_at, sent_at
- **participants** — id, campaign_id, email, name, custom_fields (JSONB), status, sent_at, error_message
- **user_settings** — id, google_oauth_token, rate_limit_delay, created_at

### Modules
1. **Auth** — Google OAuth2 single-user sign-in via NextAuth or Supabase Auth
2. **Campaign Management** — CRUD for campaigns with template storage
3. **Data Ingestion** — CSV/Excel parsing (xlsx/csv-parser) + Google Sheets API sync
4. **Email Editor** — TipTap-based rich text with placeholder insertion, inline images, file attachments
5. **Sending Engine** — Sequential Gmail API sending with configurable delay (1-2s), error handling, retry logic
6. **Dashboard UI** — Campaign list, detail view, participant table, progress indicator, settings page
7. **Scheduler** — Supabase scheduled functions or cron for delayed sends

### API Contracts
- POST /api/campaigns — create campaign
- POST /api/campaigns/:id/participants — upload/import participants
- POST /api/campaigns/:id/send — trigger immediate send
- POST /api/campaigns/:id/schedule — schedule for later
- GET /api/campaigns/:id/progress — real-time progress polling
- GET /api/campaigns/:id/participants — list with filtering

### Sending Strategy
Sequential sending with configurable 1-2 second delay between emails. Respects Gmail API rate limits (500-2000/day depending on Workspace tier). For 500 emails, ~15 minutes total.

### Template Rendering
Placeholder substitution via regex: `{{field_name}}` replaced with participant data. Supports nested fields from custom_fields JSONB.

## Testing Decisions

### What to Test
- **Sending Engine** — rate limiting, error handling, retry logic, Gmail API integration mocking
- **Data Ingestion** — CSV/Excel parsing edge cases, Google Sheets sync, validation
- **Template Rendering** — placeholder substitution, missing field handling, HTML sanitization

### Testing Approach
- Unit tests for deep modules (sending engine, data parsing, template rendering)
- Integration tests for API routes
- Smoke tests for UI components
- Only test external behavior, not implementation details

### Tools
- Vitest for unit tests
- Playwright for E2E smoke tests

## Out of Scope

- Open/click tracking (privacy concerns, v2 candidate)
- Multi-user support with role-based permissions (single-user v1)
- WYSIWYG template builder with drag-and-drop (v2 candidate)
- Custom domain email sending (Gmail API only for v1)
- Bulk unsubscribe management (v2 candidate)
- Email analytics dashboard beyond per-recipient status (v2 candidate)

## Further Notes

- Free-tier constraints: Vercel (100GB bandwidth), Supabase (500MB DB, 2GB bandwidth), Gmail API (500-2000 sends/day)
- Google OAuth consent screen may require verification for institution account
- Consider implementing send dry-run mode for testing templates before actual sends

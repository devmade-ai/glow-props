# Project Docs Status

Tracks which documentation exists per project and what's outstanding.
Updated by AI assistants when docs are added or reviewed.

## Status Key

- Yes = doc exists and is mirrored in `public/projects/{name}/`
- No = doc does not exist in the source repo
- Scrubbed = doc exists but was edited to remove sensitive content (private repos)

## User-Facing Projects

| Project | Repo | README | User Guide | Testing Guide | Tutorial | Notes |
|---------|------|--------|------------|---------------|----------|-------|
| budgy-ting | public | Yes | Yes | Yes | Yes | All docs complete |
| canva-grid | public | Yes | Yes | Yes | Yes | All docs complete |
| graphiki | private | Scrubbed | Yes | Yes | Yes | README: removed git clone URL, Getting Started, dev commands, project structure, configuration, internal doc links. |
| model-pear | public | Yes | **No** | **No** | **No** | Missing user guide, testing guide, tutorial |
| see-veo | public | Yes | **No** | **No** | **No** | Missing user guide, testing guide, tutorial |
| few-lap | private | Scrubbed | Yes | Scrubbed | Yes | README: removed env vars, local URLs, project structure. Testing guide: removed SQL queries, database setup. |
| synctone | private | Scrubbed | Yes | Yes | Yes | README: removed database schema, local URLs, setup commands, RLS details. |
| sun-sea-o | private | Scrubbed | Yes | Yes | **No** | README: removed env vars, localhost, setup commands, project structure, internal doc refs. No TutorialModal in source. |

## Internal Tools

| Project | Repo | README | User Guide | Testing Guide | Tutorial | Notes |
|---------|------|--------|------------|---------------|----------|-------|
| repo-tor | public | Yes | Yes | Yes | No | No tutorial (dashboard tool) |
| tool-till-tees | private | Scrubbed | Scrubbed | Yes | No | README: removed env vars, deployment details, SMTP config. User guide: removed env var table, service role references. |
| glow-props | public | N/A | N/A | N/A | N/A | This repo — README is the project README, not a mirrored doc. |
| canva-grid-assets | public | Yes | **No** | **No** | **No** | Supporting repo — minimal docs expected. |

## Outstanding Work

### Missing docs (should be created in source repos)

1. **model-pear** — Needs User Guide, Testing Guide, and Tutorial
2. **see-veo** — Needs User Guide, Testing Guide, and Tutorial

### Scrubbing notes (what was removed from private repos)

When updating mirrored docs from private repos, always remove:
- Environment variable names and values (SUPABASE_URL, API keys, SMTP credentials)
- Database connection strings (postgresql://, localhost URLs)
- Local development URLs (127.0.0.1, localhost port numbers)
- Database schema details (CREATE TABLE, migrations, RLS policy SQL)
- Deployment commands and infrastructure details
- Supabase Studio URLs and SQL editor references

Keep:
- Feature descriptions and user-facing behavior
- Tech stack (high-level, no version pinning)
- Data/privacy information
- API endpoint documentation (paths and descriptions, not auth implementation details)
- UI test scenarios and regression checklists

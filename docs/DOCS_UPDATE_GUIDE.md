# Docs Update Guide

Process for updating project documentation mirrored in glow-props.

## Before Starting: Get the Full Repo List

Always start by listing all repos with the authenticated API — never rely on
cached lists, projects.json, or memory.

```bash
curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" \
  "https://api.github.com/user/repos?per_page=100" \
  | python3 -c "
import sys,json
for r in sorted(json.load(sys.stdin), key=lambda x: x['name']):
    print(f'  {r[\"name\"]:25s} private={r[\"private\"]}')"
```

Compare against what's in `public/projects/` to find any missing.

## When to Update

- When a project's README, User Guide, Testing Guide, or Tutorial changes
- When a new project is added to the portfolio
- When a project's status changes (active, discontinued, public/private)
- When a project moves hosting (e.g., GitHub Pages to Vercel)
- Periodically to keep mirrored docs fresh

## How to Update an Existing Project

### 1. Fetch the latest doc from the source repo

```bash
curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" \
  "https://api.github.com/repos/devmade-ai/{repo}/contents/{path}" \
  | python3 -c "import sys,json,base64; print(base64.b64decode(json.load(sys.stdin)['content']).decode(),end='')" \
  > /tmp/{filename}
```

Common paths:
- `README.md`
- `docs/USER_GUIDE.md`
- `docs/TESTING_GUIDE.md`
- TutorialModal location varies per project (see PROJECT_DOCS_STATUS.md)

### 2. Review for sensitive content (private repos only)

Scan for and remove:
- Environment variable names and values (SUPABASE_URL, API keys, SMTP credentials)
- Database connection strings (postgresql://, localhost URLs)
- Local development URLs (127.0.0.1, localhost port numbers)
- Database schema details (CREATE TABLE, migrations, RLS policies, SQL)
- Deployment commands and infrastructure config
- Git clone URLs to private repos
- Project structure / file tree (reveals internal architecture)
- Internal documentation links (BACKEND_SPEC, MIGRATION_GUIDE, etc.)

Keep:
- Feature descriptions and user-facing behavior
- High-level tech stack (no version pinning)
- Data/privacy information
- API endpoint docs (paths and descriptions, not auth implementation)
- UI test scenarios and regression checklists

### 3. Copy to the project directory

```bash
cp /tmp/{filename} public/projects/{project-name}/{filename}
```

### 4. Update meta.json if needed

If new docs were added, update the `docs` flags:
```json
{
  "docs": {
    "readme": true,
    "userGuide": true,
    "testingGuide": true,
    "tutorial": true
  }
}
```

Also verify `liveUrl` is still correct — projects may move hosting.

### 5. Update PROJECT_DOCS_STATUS.md

Mark the doc as updated in the status table. Update the "Last mirrored" date.

### 6. Rebuild and verify

```bash
./node_modules/.bin/vite build
```

Verify the project detail page loads correctly at `project.html?name={project-name}`.

## Adding a New Project

1. List all repos (see "Before Starting" above) to confirm the project exists
2. Create `public/projects/{name}/` directory
3. Create `meta.json` with all metadata fields (use an existing project as template):
   - name, title, description, category, badge, status, repo (public/private)
   - liveUrl (verify it's the current live URL, all apps use Vercel except glow-props)
   - repoUrl (only for public repos — never expose private repo URLs)
   - tech, audience, useCases, dataPrivacy, docs
4. Fetch and scrub docs (README, USER_GUIDE, TESTING_GUIDE)
5. Extract tutorial content into `TUTORIAL.md` if the project has a TutorialModal
6. Add a card to `index.html`:
   - User-facing projects go in the `card-grid` under `#projects`
   - Internal tools go in the list under `#tools`
7. Add a row to `README.md` project table
8. Add a row to `docs/PROJECT_DOCS_STATUS.md`
9. Rebuild and verify

## Updating Live URLs

When a project moves hosting:

1. Update `liveUrl` in `public/projects/{name}/meta.json`
2. Update the URL in the card in `index.html`
3. Update the URL in the project table in `README.md`
4. All live app URLs should have a trailing slash for consistency

## Project Classification

| Category | Description | Where on site |
|----------|-------------|---------------|
| user-facing | End-user applications | Projects section (card grid) |
| internal | Infrastructure, tools, supporting repos | Internal Tools section (list) |
| discontinued | No longer maintained | Not listed (plant-fur, coin-zapp) |

## File Structure per Project

```
public/projects/{name}/
  meta.json           # Metadata (title, description, audience, use cases, privacy, status)
  README.md           # Project overview (scrubbed for private repos)
  USER_GUIDE.md       # How to use the app (if exists)
  TESTING_GUIDE.md    # Test scenarios and regression checklist (if exists)
  TUTORIAL.md         # In-app tutorial steps as markdown (if exists)
```

## Private Repos

Currently private: graphiki, few-lap, synctone, tool-till-tees, sun-sea-o, four-ems

These repos have their docs mirrored with sensitive content removed. When updating:
1. Always fetch the latest version from the source repo
2. Compare with the previous scrubbed version to see what changed
3. Apply the same scrubbing rules (see section 2 above)
4. Note what was scrubbed in PROJECT_DOCS_STATUS.md

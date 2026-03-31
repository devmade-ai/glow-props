# Docs Update Guide

Process for updating project documentation mirrored in glow-props.

## When to Update

- When a project's README, User Guide, Testing Guide, or Tutorial changes
- When a new project is added to the portfolio
- When a project's status changes (active, discontinued, public/private)
- Periodically to keep mirrored docs fresh

## How to Update

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
- TutorialModal varies per project (see PROJECT_DOCS_STATUS.md)

### 2. Review for sensitive content (private repos only)

Scan for and remove:
- Environment variable names and values
- Database connection strings and localhost URLs
- Database schema details (SQL, migrations, RLS policies)
- Deployment commands and infrastructure config
- API keys, secrets, tokens, passwords
- SMTP/email configuration details

Keep:
- Feature descriptions and user-facing behavior
- High-level tech stack
- Data/privacy information
- API endpoint docs (paths, not auth implementation)
- UI test scenarios

### 3. Copy to the project directory

```bash
cp /tmp/{filename} public/projects/{project-name}/{filename}
```

### 4. Update meta.json if needed

If new docs were added, update `docs` in `meta.json`:
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

### 5. Update PROJECT_DOCS_STATUS.md

Mark the doc as updated in the status table.

### 6. Rebuild and verify

```bash
./node_modules/.bin/vite build
```

Verify the project detail page loads correctly at `project.html?name={project-name}`.

## Adding a New Project

1. Create `public/projects/{name}/` directory
2. Create `meta.json` with all metadata fields (see existing projects for template)
3. Copy and scrub docs (README, USER_GUIDE, TESTING_GUIDE)
4. Extract tutorial content into `TUTORIAL.md` if the project has a TutorialModal
5. Add a card to `index.html` in the appropriate section (Projects or Internal Tools)
6. Add a row to `docs/PROJECT_DOCS_STATUS.md`
7. Rebuild and verify

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

Currently private: graphiki, few-lap, synctone, tool-till-tees

These repos have their docs mirrored with sensitive content removed. When updating:
1. Always fetch the latest version from the source repo
2. Compare with the previous scrubbed version to see what changed
3. Apply the same scrubbing rules (see section 2 above)
4. Note what was scrubbed in PROJECT_DOCS_STATUS.md

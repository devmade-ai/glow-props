# Session Notes

## Worked on
Markdown rendering — fixing content truncation, copy UX, and replacing the custom regex parser with the `marked` library.

## Accomplished
- Added per-code-block copy buttons (Copy button top-right of each fenced code block)
- Added `user-select: text` on `.md-render` to ensure text is always selectable
- Diagnosed and fixed content truncation (multi-line code blocks broken by line-by-line paragraph regex)
- Diagnosed and fixed double-escaping of HTML entities in code blocks and table cells
- Replaced the entire hand-rolled regex markdown parser with `marked` v17 library
- Configured custom renderer: code block copy buttons, DaisyUI link/strong/code/table/checkbox styling
- Migrated from classic `<script src="markdown.js">` to `<script type="module" src="src/markdown.js">`
- Added `.md-render ol` CSS for numbered lists (marked correctly produces `<ol>`, old parser used `<ul>`)
- Added `.md-render em` CSS for italic text
- Updated stale CSS comment block to reference marked instead of regex replacements
- Deleted `public/markdown.js` (old regex parser)

## Current state
- Build clean, all 42 markdown files render correctly
- Zero double-escaped entities, all code block counts match
- Branch: `claude/implement-glowprops-8wcKx`

## Key context
- `src/markdown.js` is a Vite-bundled ES module that imports `marked` and exposes `window.md`
- project.html and pattern.html inline scripts are now `type="module"` (execute after markdown.js in document order)
- `theme.js` remains a classic script (intentional — must run synchronously for flash prevention)
- Custom renderer only overrides: code, codespan, table, link, strong, listitem. Everything else uses marked defaults.
- `marked` token text fields are raw — renderer must call `escapeHtml()` for code/codespan and `this.parser.parseInline(tokens)` for link/strong/table cells

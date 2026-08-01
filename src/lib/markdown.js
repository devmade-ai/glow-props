// Requirement: shared markdown renderer for the pattern/project pages AND the
//   build-time SSG pass — both must render identical HTML from the same
//   markdown, or the prerendered body and the mounted body disagree.
// Approach: marked with a custom renderer for DaisyUI classes and copy
//   buttons. This module is imported by entry-server.jsx in Node, so it must
//   stay browser-API-free at module level — clipboard helpers guard at call
//   time, not import time.
// Alternative: react-markdown — rejected, marked is the fleet standard and
//   the SSG pass needs the same renderer outside React.

import { marked } from 'marked';

// Requirement: Prevent javascript:/data: protocol injection in URLs.
//   Trust boundary: the markdown and meta.json this guards are repo-controlled
//   today, but they're fetched at runtime and rendered as HTML — the guard is
//   what keeps a compromised or mistaken doc from becoming script execution.
// Approach: Decode percent-encoded characters FIRST, then allowlist http(s)
//   and relative URLs. Protocol-relative (//evil.com) is rejected — it slips
//   past a naive "starts with /" relative check while pointing off-site.
export function isSafeUrl(url) {
  let decoded;
  try { decoded = decodeURIComponent(url); } catch { return false; }
  if (decoded.startsWith('//')) return false;
  if (/^https?:\/\//i.test(decoded)) return true;
  if (/^[a-z0-9]/i.test(decoded) && !/:/.test(decoded)) return true;
  if (decoded.startsWith('/') || decoded.startsWith('#') || decoded.startsWith('.')) return true;
  return false;
}

export function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Custom renderer — only the methods that need custom HTML; everything else
// uses marked's defaults. Copy buttons carry data-copy-code instead of inline
// onclick: the Markdown component (and SSG'd pages after mount) handle them
// via one delegated listener, so no window.* global is needed.
const renderer = {
  code({ text }) {
    return '<div class="code-block-wrap">' +
      '<button class="code-copy-btn" data-copy-code aria-label="Copy code">Copy</button>' +
      '<pre><code>' + escapeHtml(text) + '</code></pre>' +
      '</div>\n';
  },

  codespan({ text }) {
    return '<code class="text-xs bg-base-300/50 px-1.5 py-0.5 rounded">' + escapeHtml(text) + '</code>';
  },

  table({ header, rows }) {
    const ths = header.map((cell) => '<th>' + this.parser.parseInline(cell.tokens) + '</th>').join('');
    const trs = rows.map(
      (row) => '<tr>' + row.map((cell) => '<td>' + this.parser.parseInline(cell.tokens) + '</td>').join('') + '</tr>',
    ).join('');
    return '<div class="overflow-x-auto"><table><thead><tr>' + ths + '</tr></thead>' +
      '<tbody>' + trs + '</tbody></table></div>\n';
  },

  link({ href, tokens }) {
    if (!isSafeUrl(href)) return this.parser.parseInline(tokens);
    // Pattern docs cross-reference each other with bare filenames
    // ("TIMER_LEAKS.md"). Relative to a /patterns/<slug>/ page that resolves
    // to /patterns/<slug>/TIMER_LEAKS.md — a 404. Anchor them to the served
    // copies under <base>/patterns/ instead, where every doc actually lives.
    let resolved = href;
    if (/^[\w.-]+\.md$/i.test(href)) {
      resolved = import.meta.env.BASE_URL + 'patterns/' + href;
    }
    return '<a href="' + escapeHtml(resolved) + '" class="link link-primary">' +
      this.parser.parseInline(tokens) + '</a>';
  },

  // Explicit override so img src goes through the same URL guard as links —
  // marked's default renderer does not block javascript:/data: sources.
  image({ href, title, text }) {
    if (!isSafeUrl(href)) return escapeHtml(text || '');
    return '<img src="' + escapeHtml(href) + '" alt="' + escapeHtml(text || '') + '"' +
      (title ? ' title="' + escapeHtml(title) + '"' : '') +
      ' class="max-w-full rounded-lg" loading="lazy">';
  },

  strong({ tokens }) {
    return '<strong class="font-semibold">' + this.parser.parseInline(tokens) + '</strong>';
  },

  listitem(token) {
    const content = this.parser.parse(token.tokens, !!token.loose);
    if (token.task) {
      const checkedAttr = token.checked ? ' checked' : '';
      const checkedClass = token.checked ? ' checkbox-primary' : '';
      return '<li class="flex items-start gap-2"><input type="checkbox"' + checkedAttr +
        ' disabled class="checkbox checkbox-xs' + checkedClass + ' mt-1"> <span>' +
        content + '</span></li>\n';
    }
    return '<li>' + content + '</li>\n';
  },
};

marked.use({ renderer, gfm: true, breaks: false });

export function stripFrontmatter(text) {
  if (!text) return text;
  const t = text.replace(/\r\n/g, '\n');
  if (!t.startsWith('---\n')) return text;
  const end = t.indexOf('\n---\n', 4);
  if (end === -1) return text;
  return t.slice(end + 5);
}

export function renderMarkdown(text) {
  if (!text) return '';
  return marked.parse(stripFrontmatter(text));
}

// Shared clipboard helper — the full CASCADE from DEBUG_SYSTEM.md "Clipboard
// Utilities": ClipboardItem Blob works in contexts where writeText is blocked;
// writeText can reject even where navigator.clipboard exists (permissions
// policy, focus loss); the textarea covers mobile PWA webviews. Each failure
// falls through to the next method — never a dead-end branch.
export async function clipboardWrite(text) {
  try {
    const blob = new Blob([text], { type: 'text/plain' });
    await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
    return true;
  } catch { /* fall through */ }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch { /* fall through */ }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

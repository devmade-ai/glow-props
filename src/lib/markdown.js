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

// Requirement: Prevent javascript:/data: protocol injection in URLs
// Approach: Decode percent-encoded characters FIRST, then allowlist http(s)
//   and relative URLs.
export function isSafeUrl(url) {
  let decoded;
  try { decoded = decodeURIComponent(url); } catch { return false; }
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
    return '<a href="' + escapeHtml(href) + '" class="link link-primary">' +
      this.parser.parseInline(tokens) + '</a>';
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

// Shared clipboard helper — a CASCADE, not a branch: writeText can reject even
// where navigator.clipboard exists (permissions policy, focus loss), and a
// rejection must fall through to the textarea path (DEBUG_SYSTEM.md clipboard
// fallbacks, adapted).
export function clipboardWrite(text) {
  return new Promise((resolve) => {
    function fallbackCopy() {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        resolve(ok);
      } catch {
        resolve(false);
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => resolve(true), fallbackCopy);
    } else {
      fallbackCopy();
    }
  });
}

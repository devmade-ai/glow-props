// Requirement: Shared markdown renderer for project.html and pattern.html
// Approach: marked library with custom renderer for DaisyUI classes and copy buttons.
//   Replaces the hand-rolled regex parser which had structural bugs (multi-line code
//   blocks broken by line-by-line paragraph regex, double-escaping, raw < truncation).
// Alternative: Custom regex parser — rejected, fundamentally can't handle nesting/context.
// Alternative: markdown-it or remark — rejected, heavier than needed for this use case.

import { marked } from 'marked';

// Requirement: Prevent javascript:/data: protocol injection in URLs
// Approach: Decode percent-encoded characters FIRST, then allowlist http(s) and relative URLs.
function isSafeUrl(url) {
  var decoded;
  try { decoded = decodeURIComponent(url); } catch (e) { return false; }
  if (/^https?:\/\//i.test(decoded)) return true;
  if (/^[a-z0-9]/i.test(decoded) && !/:/.test(decoded)) return true;
  if (decoded.charAt(0) === '/' || decoded.charAt(0) === '#' || decoded.charAt(0) === '.') return true;
  return false;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Requirement: Custom renderer for DaisyUI styling and copy buttons
// Approach: Override only the methods that need custom HTML. Everything else
//   (paragraphs, headings, blockquotes, regular lists) uses marked's defaults.
//   Token text fields contain raw markdown — use this.parser.parseInline(token.tokens)
//   to get rendered HTML with inline formatting applied.
const renderer = {
  // Code blocks: wrap with copy button container. text is raw — must escape.
  code({ text }) {
    return '<div class="code-block-wrap">' +
      '<button class="code-copy-btn" onclick="window.md.copyCodeBlock(this)" aria-label="Copy code">Copy</button>' +
      '<pre><code>' + escapeHtml(text) + '</code></pre>' +
      '</div>\n';
  },

  // Inline code: custom classes. text is raw — must escape.
  codespan({ text }) {
    return '<code class="text-xs bg-base-300/50 px-1.5 py-0.5 rounded">' + escapeHtml(text) + '</code>';
  },

  // Tables: wrap in scrollable container. Cell tokens need inline parsing.
  table({ header, rows }) {
    const ths = header.map(function (cell) {
      return '<th>' + this.parser.parseInline(cell.tokens) + '</th>';
    }.bind(this)).join('');
    const trs = rows.map(function (row) {
      return '<tr>' + row.map(function (cell) {
        return '<td>' + this.parser.parseInline(cell.tokens) + '</td>';
      }.bind(this)).join('') + '</tr>';
    }.bind(this)).join('');
    return '<div class="overflow-x-auto"><table><thead><tr>' + ths + '</tr></thead>' +
      '<tbody>' + trs + '</tbody></table></div>\n';
  },

  // Links: validate URL, add DaisyUI link class. tokens need inline parsing for nested formatting.
  link({ href, tokens }) {
    if (!isSafeUrl(href)) return this.parser.parseInline(tokens);
    return '<a href="' + escapeHtml(href) + '" class="link link-primary">' +
      this.parser.parseInline(tokens) + '</a>';
  },

  // Bold: add semibold class. tokens need inline parsing for nested formatting.
  strong({ tokens }) {
    return '<strong class="font-semibold">' + this.parser.parseInline(tokens) + '</strong>';
  },

  // List items: use parseInline for content. Custom checkbox styling for task lists.
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

function stripFrontmatter(text) {
  if (!text) return text;
  var t = text.replace(/\r\n/g, '\n');
  if (!t.startsWith('---\n')) return text;
  var end = t.indexOf('\n---\n', 4);
  if (end === -1) return text;
  return t.slice(end + 5);
}

function renderMarkdown(text) {
  if (!text) return '';
  return marked.parse(stripFrontmatter(text));
}

// Cleanup tracking — pattern: docs/implementations/TIMER_LEAKS.md variant 4.
// Copy-feedback timers reset button text after 1500ms. The array lets the HMR
// dispose handler clear pending timers in one pass. Each timer also splices its
// own id on fire so the array stays bounded by pending count, not lifetime count.
var feedbackTimeouts = [];

function untrackFeedback(id) {
  var i = feedbackTimeouts.indexOf(id);
  if (i !== -1) feedbackTimeouts.splice(i, 1);
}

// Requirement: Copy markdown source with success/failure feedback
function copyMarkdown(text, buttonId) {
  if (!text) return;
  var btn = document.getElementById(buttonId);
  function showFeedback(msg) {
    if (btn) {
      btn.textContent = msg;
      var id = setTimeout(function () {
        untrackFeedback(id);
        btn.textContent = 'Copy markdown';
      }, 1500);
      feedbackTimeouts.push(id);
    }
  }
  clipboardWrite(text, showFeedback);
}

// Requirement: Copy individual code blocks with visual feedback
function copyCodeBlock(btn) {
  var code = btn.parentNode.querySelector('code');
  if (!code) return;
  function showFeedback(msg) {
    btn.textContent = msg;
    var id = setTimeout(function () {
      untrackFeedback(id);
      btn.textContent = 'Copy';
    }, 1500);
    feedbackTimeouts.push(id);
  }
  clipboardWrite(code.textContent, showFeedback);
}

// Shared clipboard helper — Clipboard API with execCommand fallback.
// A CASCADE, not a branch: writeText can reject even where navigator.clipboard
// exists (permissions policy, non-secure context, focus loss), and the old
// if/else reported "Copy failed" without ever trying the textarea path.
function clipboardWrite(text, showFeedback) {
  function fallbackCopy() {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      showFeedback(ok ? 'Copied!' : 'Copy failed');
    } catch (e) {
      showFeedback('Copy failed');
    }
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(function () { showFeedback('Copied!'); })
      .catch(fallbackCopy);
  } else {
    fallbackCopy();
  }
}

// Expose as global for inline scripts in project.html and pattern.html
window.md = {
  renderMarkdown: renderMarkdown,
  isSafeUrl: isSafeUrl,
  escapeHtml: escapeHtml,
  copyMarkdown: copyMarkdown,
  copyCodeBlock: copyCodeBlock,
};

// HMR teardown — pattern: docs/implementations/TIMER_LEAKS.md variant 4.
if (import.meta.hot) {
  import.meta.hot.dispose(function () {
    feedbackTimeouts.forEach(clearTimeout);
    feedbackTimeouts.length = 0;
  });
}

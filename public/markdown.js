// Requirement: Shared markdown renderer for project.html and pattern.html
// Approach: Single file loaded via <script src="markdown.js"> before page-specific scripts.
//   Exposes window.md with renderMarkdown, inlineMarkdown, isSafeUrl, escapeHtml, and copyMarkdown.
//   Styling handled by .md-render CSS classes in main.css — no inline class strings here.
// Alternative: Duplicate in each HTML file — rejected, 100+ lines duplicated with sync risk.
// Alternative: ES module import — rejected, both pages use classic inline scripts (not modules).

(function () {
  'use strict';

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Requirement: Prevent javascript:/data: protocol injection in URLs
  // Approach: Decode percent-encoded characters FIRST, then allowlist http(s) and relative URLs.
  // Alternative: Only check literal colons — rejected, percent-encoded colons (%3A) bypass that check.
  function isSafeUrl(url) {
    var decoded;
    try { decoded = decodeURIComponent(url.replace(/&amp;/g, '&')); } catch (e) { return false; }
    if (/^https?:\/\//i.test(decoded)) return true;
    if (/^[a-z0-9]/i.test(decoded) && !/:/.test(decoded)) return true;
    if (decoded.charAt(0) === '/' || decoded.charAt(0) === '#' || decoded.charAt(0) === '.') return true;
    return false;
  }

  // Requirement: Inline markdown formatting for doc content
  // Approach: Escape HTML entities FIRST to prevent XSS, then apply
  //   formatting replacements on the escaped text. Link hrefs are
  //   validated to reject javascript:/data: protocol injection.
  function inlineMarkdown(text) {
    var escaped = escapeHtml(text);
    return escaped
      .replace(/`([^`]+)`/g, '<code class="text-xs bg-base-300/50 px-1.5 py-0.5 rounded">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (m, label, href) {
        if (!isSafeUrl(href)) return label;
        return '<a href="' + href + '" class="link link-primary">' + label + '</a>';
      });
  }

  // Requirement: Render markdown to HTML with CSS classes from main.css
  // Approach: Regex-based parser outputs semantic HTML elements. Styling is handled
  //   by .md-render parent class in main.css — no inline class strings here.
  // Design: Each structural replacement applies inlineMarkdown() to its text captures
  //   immediately. This ensures HTML entities are escaped BEFORE injection into HTML,
  //   preventing raw < from creating broken elements that truncate rendering.
  //   Previous approach used a catch-all pass (/>([^<]+)</g) which:
  //     - Treated raw < as tag boundaries, passing them unescaped into innerHTML
  //     - Double-escaped code block content (already escaped by escapeHtml)
  //     - Double-processed table cells (already formatted by inlineMarkdown)
  function renderMarkdown(md) {
    if (!md) return '';
    // Normalize line endings — \r\n (Windows) breaks code block regex which expects \n
    var html = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Requirement: Protect code blocks from line-by-line regex processing
    // Approach: Extract fenced code blocks into an array and replace with single-line
    //   placeholders before running structural regexes (headings, lists, paragraphs).
    //   The paragraph regex uses /gm (multiline), processing each line independently.
    //   Without placeholders, multi-line code block content gets matched as paragraphs,
    //   breaking <pre><code> structure and double-escaping entities.
    // Alternative: Encode newlines as &#10; — rejected, some browsers render &#10;
    //   differently in <pre>, and copy-paste would include the entity.
    var codeBlocks = [];
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
      var idx = codeBlocks.length;
      codeBlocks.push(
        '<div class="code-block-wrap">' +
        '<button class="code-copy-btn" onclick="this.parentNode.querySelector(\'code\').textContent.trim() && md.copyCodeBlock(this)" aria-label="Copy code">Copy</button>' +
        '<pre><code>' + escapeHtml(code.trim()) + '</code></pre>' +
        '</div>'
      );
      return '<codeblock-' + idx + '>';
    });

    // Requirement: Protect tables from line-by-line regex processing
    // Tables are multi-line and must also be extracted before line-by-line regexes.
    var tableBlocks = [];
    html = html.replace(/^\|(.+)\|\s*\n\|[\s\-:|]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm, function (_, header, body) {
      var idx = tableBlocks.length;
      var ths = header.split('|').map(function (h) { return '<th>' + inlineMarkdown(h.trim()) + '</th>'; }).join('');
      var rows = body.trim().split('\n').map(function (row) {
        var tds = row.replace(/^\||\|$/g, '').split('|').map(function (d) { return '<td>' + inlineMarkdown(d.trim()) + '</td>'; }).join('');
        return '<tr>' + tds + '</tr>';
      }).join('');
      tableBlocks.push('<div class="overflow-x-auto"><table><thead><tr>' + ths + '</tr></thead><tbody>' + rows + '</tbody></table></div>');
      return '<tableblock-' + idx + '>';
    });

    // Line-by-line structural replacements — safe because code/table blocks are placeholders
    html = html
      .replace(/^#### (.+)$/gm, function (_, t) { return '<h4>' + inlineMarkdown(t) + '</h4>'; })
      .replace(/^### (.+)$/gm, function (_, t) { return '<h3>' + inlineMarkdown(t) + '</h3>'; })
      .replace(/^## (.+)$/gm, function (_, t) { return '<h2>' + inlineMarkdown(t) + '</h2>'; })
      .replace(/^# (.+)$/gm, function (_, t) { return '<h1>' + inlineMarkdown(t) + '</h1>'; })
      .replace(/^---+$/gm, '<hr>')
      .replace(/^> (.+)$/gm, function (_, t) { return '<blockquote>' + inlineMarkdown(t) + '</blockquote>'; })
      .replace(/^- \[x\] (.+)$/gm, function (_, t) { return '<li class="flex items-start gap-2"><input type="checkbox" checked disabled class="checkbox checkbox-xs checkbox-primary mt-1"> ' + inlineMarkdown(t) + '</li>'; })
      .replace(/^- \[ \] (.+)$/gm, function (_, t) { return '<li class="flex items-start gap-2"><input type="checkbox" disabled class="checkbox checkbox-xs mt-1"> ' + inlineMarkdown(t) + '</li>'; })
      .replace(/^  - (.+)$/gm, function (_, t) { return '<li class="ml-4">' + inlineMarkdown(t) + '</li>'; })
      .replace(/^- (.+)$/gm, function (_, t) { return '<li>' + inlineMarkdown(t) + '</li>'; })
      .replace(/^\d+\. (.+)$/gm, function (_, t) { return '<li>' + inlineMarkdown(t) + '</li>'; })
      .replace(/((?:<li class="ml-4">.*<\/li>\s*)+)/g, '<ul>$1</ul>')
      .replace(/((?:<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>')
      .replace(/((?:<li class="flex.*<\/li>\s*)+)/g, '<ul class="space-y-1 my-2">$1</ul>')
      .replace(/^(?!<[a-z/!])((?!<).+)$/gm, function (_, t) { return '<p>' + inlineMarkdown(t) + '</p>'; });

    // Restore code blocks and tables from placeholders
    html = html.replace(/<codeblock-(\d+)>/g, function (_, i) { return codeBlocks[parseInt(i)]; });
    html = html.replace(/<tableblock-(\d+)>/g, function (_, i) { return tableBlocks[parseInt(i)]; });

    return html;
  }

  // Requirement: Copy markdown with success/failure feedback
  // Approach: Try Clipboard API first, fall back to deprecated execCommand.
  //   Calls showFeedback callback with 'Copied!' or 'Copy failed'.
  function copyMarkdown(text, buttonId) {
    if (!text) return;
    var btn = document.getElementById(buttonId);
    function showFeedback(msg) {
      if (btn) {
        btn.textContent = msg;
        setTimeout(function () { btn.textContent = 'Copy markdown'; }, 1500);
      }
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(function () { showFeedback('Copied!'); })
        .catch(function () { showFeedback('Copy failed'); });
    } else {
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
  }

  // Requirement: Copy individual code blocks with visual feedback
  // Approach: Read textContent from sibling <code>, use Clipboard API with execCommand fallback.
  //   Button text changes to "Copied!" briefly, then reverts.
  function copyCodeBlock(btn) {
    var code = btn.parentNode.querySelector('code');
    if (!code) return;
    var text = code.textContent;
    function showFeedback(msg) {
      btn.textContent = msg;
      setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(function () { showFeedback('Copied!'); })
        .catch(function () { showFeedback('Failed'); });
    } else {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        showFeedback(ok ? 'Copied!' : 'Failed');
      } catch (e) {
        showFeedback('Failed');
      }
    }
  }

  // Expose as global — both project.html and pattern.html use classic inline scripts
  window.md = {
    renderMarkdown: renderMarkdown,
    inlineMarkdown: inlineMarkdown,
    isSafeUrl: isSafeUrl,
    escapeHtml: escapeHtml,
    copyMarkdown: copyMarkdown,
    copyCodeBlock: copyCodeBlock
  };
})();

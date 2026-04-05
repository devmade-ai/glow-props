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
  function renderMarkdown(md) {
    if (!md) return '';
    var html = md
      // Requirement: Per-code-block copy buttons so users can copy snippets without opening raw file
      // Approach: Wrap each <pre> in a relative container with an absolute-positioned copy button.
      //   Button uses onclick handler that finds the sibling <code> element and copies its textContent.
      // Alternative: Select-all on click — rejected, doesn't work reliably on mobile
      .replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
        return '<div class="code-block-wrap">' +
          '<button class="code-copy-btn" onclick="this.parentNode.querySelector(\'code\').textContent.trim() && md.copyCodeBlock(this)" aria-label="Copy code">Copy</button>' +
          '<pre><code>' + escapeHtml(code.trim()) + '</code></pre>' +
          '</div>';
      })
      .replace(/^\|(.+)\|\s*\n\|[\s\-:|]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm, function (_, header, body) {
        var ths = header.split('|').map(function (h) { return '<th>' + escapeHtml(h.trim()) + '</th>'; }).join('');
        var rows = body.trim().split('\n').map(function (row) {
          var tds = row.replace(/^\||\|$/g, '').split('|').map(function (d) { return '<td>' + inlineMarkdown(d.trim()) + '</td>'; }).join('');
          return '<tr>' + tds + '</tr>';
        }).join('');
        return '<div class="overflow-x-auto"><table><thead><tr>' + ths + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
      })
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^---+$/gm, '<hr>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^- \[x\] (.+)$/gm, '<li class="flex items-start gap-2"><input type="checkbox" checked disabled class="checkbox checkbox-xs checkbox-primary mt-1"> $1</li>')
      .replace(/^- \[ \] (.+)$/gm, '<li class="flex items-start gap-2"><input type="checkbox" disabled class="checkbox checkbox-xs mt-1"> $1</li>')
      .replace(/^  - (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/((?:<li class="ml-4">.*<\/li>\s*)+)/g, '<ul>$1</ul>')
      .replace(/((?:<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>')
      .replace(/((?:<li class="flex.*<\/li>\s*)+)/g, '<ul class="space-y-1 my-2">$1</ul>')
      .replace(/^(?!<[a-z])((?!<).+)$/gm, '<p>$1</p>');

    html = html.replace(/>([^<]+)</g, function (m, content) {
      return '>' + inlineMarkdown(content) + '<';
    });

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

---
slug: build-output-rewriting
title: Rewriting Built Output
badge: Convention
description: Rules for any step that rewrites emitted files — fail loud, count matches, and never let a token sit inside a comment.
tags:
  - build
  - deploy
  - tripwires
order: 13
---

# Rewriting Built Output

Almost every app in this fleet rewrites its own emitted files. Icon `<link>`
tags get a `?v=` hash appended. A landing page's markup is injected into the
mount point. Per-route meta is swapped at the edge. A theme colour is
substituted from CSS. A prerenderer clones one HTML file into twelve.

These look like different jobs. They fail the same seven ways, and this document
is those seven — collected because they were learned separately, in five repos,
by shipping each of them.

**Related patterns:**
- [PWA_ICON_CACHE_BUST.md](PWA_ICON_CACHE_BUST.md) — where the fail-loud literal
  rule was first written down, for icon `<link>` rewriting
- [DISCOVERABILITY.md](DISCOVERABILITY.md) — the prerender / inject / edge-rewrite
  recipes these rules apply to

## Why this is its own document

The rules are not about icons or about SEO. Those are simply where each was
learned. Keeping them next to one use makes the next person rediscover them at
the other, which is exactly what happened: the "fail loud on a missing literal"
rule lived in the icon doc for months while a mount-point injection shipped
without it.

Everything below is a real defect from a real deploy, not a hypothetical.

## 1. Fail loud on a missing literal

A replacement whose target is absent does nothing, and doing nothing looks
identical to success.

```js
if (!html.includes(MOUNT)) {
  throw new Error(
    `[seo-landing] mount point literal not found: ${MOUNT}\n` +
    'Update MOUNT to match, or the built page ships with no crawlable body text.',
  )
}
```

Someone reformats a tag — single quotes, reordered attributes, a renamed id —
and the build still exits 0. The symptom surfaces weeks later as a stale icon,
an empty body, or a generic card, with nothing connecting it to the edit that
caused it.

The error message must name the literal *and* what breaks without it. "Literal
not found" sends the reader to the wrong file.

## 2. Count the matches — one is not the default

`String.replace` with a string argument replaces the **first** occurrence.
`replaceAll` replaces every one. Both are wrong by default, because neither
asserts how many you expected.

- **More than one, and you wanted all of them:** the same `href` legitimately
  appears twice (`apple-touch-icon` and `apple-touch-startup-image`), and
  single-replace silently ships the second un-versioned.
- **More than one, and you wanted the real one:** the extra occurrence is inside
  a comment (see rule 3), and single-replace hits the comment instead.

Assert the count before substituting. Where the emitted document must contain
exactly one of something — a `<title>`, a canonical, a JSON-LD block — assert
that on the **output** as well:

```js
const count = html.split(literal).length - 1
if (count !== 1) fail(`${page}: ${count} × ${label}, expected exactly 1`)
```

Two `<title>` elements is a defect that reads as fine: the first wins, and a
`grep` finds the right one.

## 3. A comment is not a comment to a string operation

This is the rule that cost the most, twice, in opposite directions.

**Reading a comment gives a wrong report.** A `<head>` full of
Requirement/Approach comments quotes tag literals, because that is how you
explain a tag. A regex checking `<meta name="description">` matched the
*commented* copy, found no `content` attribute on it, and reported the
description as empty in production. It was not — a compliant parser saw exactly
one, correct. A downstream repo was "fixed" for a defect that did not exist.

**Writing into a comment gives a wrong page.** A comment in a SvelteKit
`app.html` explained where the head comes from and named the placeholder
literally. The framework substitutes that token with a plain string replace:

```html
<!-- No static <title> here. Each route sets its own, which %sveltekit.head% injects below … -->
                                                          ↑ the ENTIRE head landed HERE
```

Zero titles and zero modulepreloads on all three prerendered pages, live. The
commit whose only purpose was giving those pages titles took them away.

Both directions, one root cause: **string operations have no idea what a comment
is** — and neither does `grep`, which is why `curl … | grep '<title>'` reassured
me through both incidents.

Two rules follow:

```js
// Reading: strip comments before any regex touches the markup.
const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '')

// Writing: no substituted token may appear inside a comment.
const offenders = (src.match(/<!--[\s\S]*?-->/g) ?? [])
  .flatMap((c) => c.match(/%[A-Za-z_][A-Za-z0-9_.]*%/g) ?? [])
if (offenders.length) fail(`comment contains ${offenders.join(', ')}`)
```

Applies to `%sveltekit.*%`, Vite's `%VITE_*%`, `<%= %>`, `{{ }}`, and any
literal in a plugin's replacement table. **Name the token in prose instead.**

## 4. Assert the output, not the input

The input is what you wrote. The output is what ships, and they diverge.

A repo asserted its head tags against `+html.tsx` for months while Expo Router's
export injected react-helmet's empty `<title data-rh="true"></title>` as the
*first* element in `<head>`. First-wins made the empty one the document title.
The source was correct throughout; `grep '<title>'` over `dist/` found the real
one; only *counting* the elements in the emitted file showed two.

Read `dist/`. Where the framework's output is the thing under test, testing the
source is testing your own intentions.

Corollary: **a `dist/`-level check is only worth as much as the build behind
it.** Rebuild before trusting it, and rebuild *between* fault injections, or the
check never sees the fault.

## 5. The deploy must run the step

Adding a step to `package.json` does not add it to the deploy if the host has
its own build command.

Two repos wired a post-export fix into `npm run build`; Vercel runs
`vercel.json`'s `buildCommand`, a hand-copied duplicate of the same pipeline.
The step was absent from it. Both deploys went green and shipped nothing, and
the defect the step existed to fix was still live afterwards.

The asymmetry is the part worth remembering: `buildCommand` is capped at **256
characters**. One repo's synced pipeline came to 260 and was rejected outright,
surfacing the duplication in a single deploy. The other's was 198 and would have
sat there indefinitely. **A hazard that only announces itself once the string
gets long enough is not one you can rely on noticing.**

In order of preference:

1. **Delegate** — `"buildCommand": "npm run build"`. One definition.
2. **Delegate and gate** — `"npm run build && npm test"`.
3. **Omit it** — the host runs `npm run build` anyway. One less line.
4. **If you must spell it out**, assert the two agree, with the checker in
   *both* commands — one wired into only one reproduces the bug it exists to
   catch — and placed **first**, so a divergence costs a second rather than a
   full build.

## 6. Edge rewriting fails open

`HTMLRewriter.on(selector, handler)` is a **no-op** when the selector matches
nothing. No error, no warning. Rename a targeted element and every route
silently ships the fallback while the machinery reports success.

Build-time injection can throw; edge rewriting cannot. So the guard has to live
at source level: assert the template still carries every element the rewriter
targets, and **parse the selector list out of the rewriter** rather than
duplicating it — a second copy is a second thing to forget.

```js
const selectors = [...workerSrc.matchAll(/\.on\(\s*'([^']+)'/g)].map((m) => m[1])
```

Make an unparseable selector a **failure**, not a skip. When a `div#root`
selector was added to a checker that only understood `tag` and `tag[attr=…]`,
it refused to run and said so — "an unparsed selector is an unchecked one, and
unchecked is exactly the state this script exists to prevent." That is the
behaviour to copy.

## 7. Ordering is load-bearing, so write it down

When one pass reads a file and another writes it, the order is part of the
contract and nothing enforces it.

A prerenderer read `dist/index.html` into `base`, cloned it per article, then
wrote the home page's body back over `dist/index.html`. Reversing those two —
writing the home page first — stamps the home index into the middle of every
cloned article page. Nothing about the code says so; both orders run clean.

State it in a comment at the point of the write, and assert the consequence:
the article pages must *not* contain the home copy. A test that only checks
"the home page has a body" passes on the broken order.

## Tripwire checklist

- [ ] Every replacement throws when its literal is absent, naming what breaks
- [ ] Match counts are asserted, not assumed — on the input and on the output
- [ ] Comments are stripped before any regex reads markup
- [ ] No substituted token appears inside a comment in any template
- [ ] Assertions read the **built** output, after a fresh build
- [ ] The deploy's build command runs every step the repo defines
- [ ] Edge rewriters have a source-level guard, with selectors parsed not copied
- [ ] An unparseable selector fails rather than skips
- [ ] Read/write ordering is commented, and its consequence asserted
- [ ] Every rule above has been fault-injected once — a tripwire nobody has seen
      fail is a tripwire nobody knows is wired up

## Key lessons

- **Doing nothing looks exactly like succeeding.** Every failure here is silent
  by construction; none of them turn a build red on their own.
- **`grep` does not know what a comment is.** Neither does `String.replace`.
  Both reassured me through the two worst incidents in this document.
- **Verify the path production takes, not the artifact you changed.** A local
  build proves your script works. It says nothing about whether the deploy runs
  it, or whether the URL a crawler requests serves what the build emitted.

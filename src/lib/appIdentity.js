// Requirement: the app's installed name is written down once, not repeated in
//   every place that has to say it out loud.
// Approach: two constants imported by all three writers — the web-app manifest
//   in vite.config.js (the definition), and the two install surfaces that quote
//   it back to the user (src/lib/pwa.js steps, src/components/InstallModal.jsx
//   heading).
// Why: the rename to gp-props changed the manifest name and left three string
//   literals behind saying "Glow Props". The browser builds its install menu
//   entry FROM the manifest, so those steps told the user to look for a menu
//   item that did not exist — at the exact moment they were trying to install.
//   Nothing could have caught it: three unrelated files agreeing by hand is not
//   a checkable property. One import makes them agree by construction.
// Alternatives:
//   - A tripwire asserting the literals match the manifest: rejected — it gates
//     a disagreement that shouldn't be expressible, the same reasoning
//     src/lib/structuredData.js records for the SEO nodes.
//   - Reading the built manifest at runtime: rejected — the copy has to render
//     before any manifest fetch resolves, and it would not help the build side.
//
// No DOM and no Node APIs: imported by vite.config.js (Node), by browser
// bundles, and — through InstallModal — by the SSR entry's graph.

/** Manifest `name`: the full label, used where there is room for it. */
export const APP_NAME = 'Props — Projects & Patterns';

/**
 * Manifest `short_name`: what the browser puts in its own install menu entry
 * and under the home-screen icon. Any step quoting that entry must use THIS,
 * verbatim — it is the string the user is being told to look for.
 */
export const APP_SHORT_NAME = 'Props';

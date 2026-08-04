---
slug: timer-leaks
title: Timer & Subscription Cleanup
badge: Convention
description: Mandatory cleanup contract for every setTimeout, setInterval, addEventListener, and subscribe call. Nested-timeout array, AbortController, per-effect dispose, HMR-safe guards.
tags:
  - Cleanup contracts
  - AbortController
  - HMR-safe listeners
order: 11
---

# Timer & Subscription Cleanup

Every timer, interval, event listener, and subscription is a resource that keeps its callback alive. If the component or module that created it goes away (unmount, HMR reload, route change, bundle teardown) without releasing it, the callback keeps running against stale state, holds references that can't be GC'd, and — in the nested case — can spawn new work on a dead tree. This pattern defines the contract and five concrete shapes that cover every real case.

**Related patterns:**
- [EVENT_BUS.md](EVENT_BUS.md) — `bus.on()` returns an unsubscribe fn; callers must store and invoke it
- [DEBUG_SYSTEM.md](DEBUG_SYSTEM.md) — `subscribeDebugLog()` follows the same pub/sub contract; errors during cleanup route to `debugAdd()`
- [PWA_SYSTEM.md](PWA_SYSTEM.md) — service worker update checks and `beforeinstallprompt` listeners are long-lived and HMR-sensitive

## The Rule

Every `setTimeout`, `setInterval`, `addEventListener`, `subscribe`, or any handle-returning registration needs a matching release call (`clearTimeout`, `clearInterval`, `removeEventListener`, `unsubscribe`, etc.) reachable from the owning scope's teardown. No exceptions for "it only fires once" — the unmount can happen before the fire.

## Variants

### 1. Nested timeouts (React useEffect)

A timeout callback that sets another timeout is the classic leak source. Clearing only the outer one leaves the inner orphaned. Track every id in an array the cleanup can drain.

```tsx
useEffect(() => {
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  const outer = setTimeout(() => {
    animateIn();
    const inner = setTimeout(() => save(), 500);
    timeouts.push(inner);
  }, 300);
  timeouts.push(outer);

  return () => timeouts.forEach(clearTimeout);
}, [value]);
```

- **Why an array, not two refs:** nested depth can change as logic evolves. An array scales without rewriting the cleanup.
- **Why push before the callback runs:** `timeouts.push(outer)` runs synchronously right after `setTimeout` returns the id. Pushing inside the callback would race with unmount.

### 2. Single-shot timer / interval (React useEffect)

Single id, no nesting. A local `const` is enough — the closure captures it.

```tsx
useEffect(() => {
  const id = setInterval(poll, 5000);
  return () => clearInterval(id);
}, [enabled]);
```

If the timer is driven by an event handler (not a useEffect), store the id on a `useRef` so the handler and the component's unmount effect can both reach it:

```tsx
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleStart = () => {
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = setTimeout(fire, 500);
};

useEffect(() => {
  return () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
}, []);
```

### 3. AbortController for fetch + multiple listeners

`AbortController` is the correct cleanup primitive when you have a fetch, an event listener, or several of both that should all tear down together. It beats juggling per-listener removals.

```tsx
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/me', { signal: controller.signal })
    .then(r => r.json())
    .then(setUser)
    .catch(e => {
      if (e.name !== 'AbortError') throw e;
    });

  window.addEventListener('focus', refresh, { signal: controller.signal });
  window.addEventListener('online', refresh, { signal: controller.signal });

  return () => controller.abort();
}, []);
```

- **One signal, many targets:** modern `addEventListener` accepts `{ signal }` and self-removes on abort.
- **`AbortError` is expected:** always filter it out of fetch error paths; it isn't a failure.

### 4. Plain-module singletons — export `dispose()`

Module-level resources that live outside React (analytics init, a WebSocket manager, a cross-tab sync listener) should expose a named teardown instead of relying on garbage collection.

```ts
let socket: WebSocket | null = null;
const listeners = new Set<(msg: string) => void>();

export function init() {
  if (socket) return;
  socket = new WebSocket(URL);
  socket.onmessage = (e) => listeners.forEach(fn => fn(e.data));
}

export function subscribe(fn: (msg: string) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);  // unsubscribe handle
}

export function dispose() {
  socket?.close();
  socket = null;
  listeners.clear();
}
```

- **`subscribe()` returns its own undo** — callers don't need to know how the set is stored.
- **`dispose()` is idempotent** — safe to call in tests, HMR hooks, SSR teardown.

### 5. HMR-safe global listener guard

Hot-reload re-evaluates modules but doesn't run a cleanup for the old copy. A module that attaches a global listener at top level will double-subscribe on every HMR cycle until the page refreshes. Guard with a well-known flag on `window`.

```ts
declare global {
  interface Window {
    __authListenerAttached?: boolean;
  }
}

if (typeof window !== 'undefined' && !window.__authListenerAttached) {
  window.__authListenerAttached = true;
  window.addEventListener('storage', handleStorageSync);
}
```

- **Per-concern flag name** — `__<featureName>Attached` so two modules don't collide.
- **SSR-safe** — the `typeof window` guard prevents errors in Node.
- **Pair with `import.meta.hot`** if your framework exposes it:

```ts
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener('storage', handleStorageSync);
    window.__authListenerAttached = false;
  });
}
```

### 6. `requestAnimationFrame` — only the looping form needs cancelling

A one-shot rAF is not a leak:

```ts
// Fine. Schedules exactly one callback; nothing accumulates.
requestAnimationFrame(() => firstFocusable.focus());
```

This is the dominant legitimate use — focus after a dialog opens, measure after
layout — and it appears in most fleet repos. The callback runs once on the next
frame and is gone. Cancelling it buys nothing.

The form that does need cancelling keeps itself alive, or stores its id so
something *can* cancel it:

```ts
let rafId: number;
function tick() {
  rafId = requestAnimationFrame(tick);   // re-arms itself — must be cancellable
}
useEffect(() => {
  tick();
  return () => cancelAnimationFrame(rafId);
}, []);
```

Rule: **cancel a rAF whose id you store or whose callback re-arms it; leave a
bare one-shot alone.**

### 7. Subscription handles release with `.remove()`, not `removeEventListener`

React Native's `AppState` and `Linking`, and most SDK emitters, return a
subscription object rather than expecting a symmetric removal call:

```ts
useEffect(() => {
  const sub = AppState.addEventListener('change', onChange);
  return () => sub.remove();      // correct — there is no removeEventListener here
}, []);
```

Capture the return value. An `addEventListener` whose result is discarded on
these APIs cannot be released at all.

### 8. Service workers are exempt from the module-level rule

`self.addEventListener('install' | 'activate' | 'fetch' | …)` at module scope is
the only correct shape in a service worker. There is no HMR, no import graph to
dispose, and the listeners *are* the worker's lifecycle. Do not add a dispose
block, and exclude service workers from the tripwire.

## Tripwire notes

Three things a static checker for this pattern gets wrong unless it is told not
to — all three found by running the fleet tripwire across every repo:

1. **Accept the release verb as a callback reference, not just a call.**
   Variant 1 above ends `return () => timeouts.forEach(clearTimeout)`. A
   `/\bclearTimeout\s*\(/` regex does not match that, so the check fails the
   pattern it exists to enforce. Match `\bclearTimeout\s*[(,)\]]`.
2. **Read the extensions the repo actually uses.** A checker that walks only
   `.js/.mjs/.jsx` reports OK on a TypeScript, Vue or Svelte codebase while
   examining almost nothing. Include `.ts/.tsx/.vue/.svelte`.
3. **Same-file pairing is the contract, and it has a known blind spot.** It
   cannot see a *mismatched* pair — a file containing both `setInterval` and
   `clearInterval` passes even when they refer to different timers, and it
   cannot see a registration that lands after teardown has already run (an
   interval created inside a `.then()` that resolves post-unmount). Those need
   reading, not grepping. The checker is a floor, not a proof.

## Key Lessons

1. **Every registration pairs with a release.** Grep the codebase for `setTimeout|setInterval|addEventListener|\.subscribe(` — every hit needs a matching clear/remove/unsubscribe reachable from the owner's teardown.
2. **Nested timeouts are the leak you'll actually ship.** The outer-cleanup-only bug passes happy-path tests: if unmount happens *before* outer fires, inner is never scheduled and the cleanup looks fine. The leak only surfaces when unmount lands *between* outer-fire and inner-fire — a timing window most tests don't exercise. Use the array pattern every time a callback schedules more work.
3. **`AbortController` consolidates cleanup.** If a useEffect has more than one subscription, prefer a single signal over per-listener removals — fewer places to forget.
4. **Module-level singletons need a named dispose.** Don't rely on GC; unit tests, HMR, and SSR all need deterministic teardown.
5. **HMR double-subscribes are invisible in production but eat battery in dev.** A global listener guard costs one line and prevents a confusing class of "why does this fire N times?" bugs.
6. **Event handlers that start timers need two cleanup paths** — the handler's own reset (re-triggering the timer should clear the previous one) and the component's unmount (abort any in-flight timer). Both use the same ref.
7. **`setTimeout` used as a timing fix is a separate hack.** The `hacks` trigger calls this out separately — if you reach for `setTimeout(fn, 0)` or `setTimeout(fn, 100)` to "wait for the DOM", the correct primitive is `requestAnimationFrame`, a state-driven effect, or an event callback. This pattern is about cleanup hygiene for *legitimate* timers, not a justification for their overuse.

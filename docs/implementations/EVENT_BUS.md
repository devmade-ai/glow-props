# Event Bus

Generic typed event bus factory for service-layer pub/sub. Each service creates its own bus with a typed event union and a catch-all "changed" event that fires automatically on every emission. Per-listener error isolation prevents one throwing subscriber from breaking others.

**Dependencies:** None (uses debugLog for error reporting)

## When to Use

Use when multiple services or modules need internal event-driven communication:
- Graph/data layer notifying UI of mutations (node created, deleted, updated)
- Workspace changes triggering sidebar refresh
- Any service that currently copy-pastes its own `listeners` Map + `emit` + `subscribe` boilerplate

Do **not** use for:
- Cross-tab communication (use `storage` events or BroadcastChannel)
- Debug logging (use debugLog's own pub/sub)
- One-off callbacks (just pass a function)

## Factory (`eventBus.ts`)

```typescript
// Requirement: Shared event bus factory for service-layer pub/sub
// Approach: Generic factory that creates a type-safe event emitter with a
//   wildcard "changed" event that fires on every emission. Each listener is
//   wrapped in try/catch so one throwing subscriber cannot break others.
// Alternatives considered:
//   - Per-service copy-paste: Rejected — caused consistency drift (one service
//     was missing error handling that others had)
//   - Third-party event library (mitt, EventEmitter3): Rejected — tiny surface
//     area, not worth a dependency for <30 lines of logic

import { debugAdd } from './debugLog'

type EventCallback = (payload: unknown) => void

export interface EventBus<T extends string> {
  /** Subscribe to an event. Returns an unsubscribe function. */
  on: (event: T, callback: EventCallback) => () => void
  /** Emit an event. Also fires the changedEvent (if the emitted event isn't it). */
  emit: (event: T, payload?: unknown) => void
}

/**
 * Create a typed event bus with a catch-all "changed" event.
 *
 * @param serviceName - Label for error logging (e.g. "graphService")
 * @param changedEvent - The wildcard event that fires on every emission
 */
export function createEventBus<T extends string>(
  serviceName: string,
  changedEvent: T
): EventBus<T> {
  const listeners = new Map<T, Set<EventCallback>>()

  function on(event: T, callback: EventCallback): () => void {
    if (!listeners.has(event)) listeners.set(event, new Set())
    listeners.get(event)!.add(callback)
    return () => listeners.get(event)?.delete(callback)
  }

  function emit(event: T, payload?: unknown): void {
    listeners.get(event)?.forEach((cb) => {
      try {
        cb(payload)
      } catch (err) {
        debugAdd('global', 'error', `[${serviceName}] Listener error on ${event}`, {
          error: String(err),
        })
      }
    })
    // Auto-fire the catch-all event on every emission (unless it IS the catch-all)
    if (event !== changedEvent) {
      listeners.get(changedEvent)?.forEach((cb) => {
        try {
          cb(payload)
        } catch (err) {
          debugAdd('global', 'error', `[${serviceName}] Listener error on ${changedEvent}`, {
            error: String(err),
          })
        }
      })
    }
  }

  return { on, emit }
}
```

## Usage Pattern

### 1. Define events as a typed union

Each service defines its own event union with a catch-all "changed" event at the end:

```typescript
// graphService.ts
type GraphEvent =
  | 'node:created' | 'node:updated' | 'node:deleted'
  | 'arc:created'  | 'arc:updated'  | 'arc:deleted'
  | 'data:changed'

// workspaceService.ts
type WorkspaceEvent =
  | 'workspace:created' | 'workspace:updated' | 'workspace:deleted'
  | 'workspace:changed'
```

### 2. Create the bus — export `on`, keep `emit` private

```typescript
const bus = createEventBus<GraphEvent>('graphService', 'data:changed')

// Public — consumers subscribe
export const on = bus.on

// Private — only the service emits
const emit = bus.emit
```

This encapsulation ensures consumers can only subscribe, never emit. Each service owns its own events.

### 3. Emit specific events after mutations

```typescript
// Single-item mutations — emit a specific event with the entity as payload
export async function createNode(data: NodeInput): Promise<Node> {
  const node = await db.nodes.add(data)
  emit('node:created', node)
  return node
}

export async function deleteNode(id: string): Promise<void> {
  await db.nodes.delete(id)
  emit('node:deleted', { id })
}

// Bulk mutations — emit just the catch-all to avoid N separate events
export async function importNodes(nodes: NodeInput[]): Promise<void> {
  await db.nodes.bulkAdd(nodes)
  emit('data:changed')
}
```

### 4. Subscribe in React components

The `on` function returns an unsubscribe function — ideal for `useEffect` cleanup:

```typescript
import { on as onGraphEvent } from '../services/graphService'

// Reload everything when anything changes (catch-all)
useEffect(() => {
  return onGraphEvent('data:changed', () => {
    loadGraphData()
  })
}, [])

// React to a specific event
useEffect(() => {
  return onGraphEvent('node:created', (payload) => {
    const node = payload as Node
    addNodeToCanvas(node)
  })
}, [])
```

## How the Catch-All Works

Emitting any specific event (e.g. `'node:created'`) automatically also fires the catch-all event (`'data:changed'`). This means:

- **Granular subscribers** listen to specific events: `on('node:created', ...)`
- **Broad subscribers** listen to the catch-all: `on('data:changed', ...)`

A component that just needs "refresh when anything changes" subscribes once to the catch-all. A component that needs to animate a specific addition subscribes to `'node:created'`. Both work without the emitter knowing about either.

## Key Lessons

1. **Export `on`, keep `emit` private.** Services own their events. If consumers can emit, event sources become untraceable and testing becomes impossible.
2. **Try/catch per listener.** One throwing subscriber must not break other subscribers or the emitting service. Route errors to the debug system, not console.
3. **`Set` for listeners.** Prevents duplicate registrations (same callback added twice) and provides O(1) removal via the returned unsubscribe function.
4. **The catch-all event eliminates polling.** Without it, a sidebar component would need to subscribe to every individual event. With it, one subscription covers all mutations.
5. **Don't use for cross-component React state.** If the subscriber needs to trigger a React re-render, the event callback should call a state setter or Zustand action — not try to pass data through the event system. The bus is for notification, not state management.
6. **One bus per service.** Don't create a single global bus for the whole app — event name collisions become inevitable and the type union becomes unmanageable.
7. **`Map<event, Set<callback>>` is the right data structure.** Listeners are partitioned by event type, so emit only iterates callbacks for the relevant event + the catch-all. No filtering required.
8. **~30 lines — no library needed.** mitt and EventEmitter3 solve the same problem but add a dependency for trivial logic. The factory pattern here is smaller than their API surface.

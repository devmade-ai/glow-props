# Graphiki

A visual graph-based knowledge workspace. Build, explore, and analyze networks of ideas, people, companies, concepts — anything with relationships.

Graphiki runs entirely in your browser as a Progressive Web App. No server, no account, no data leaves your device.

## Features

- **Graph visualization** — Interactive force-directed graph powered by Cytoscape.js. Click, drag, zoom, pan. Touch-friendly.
- **Multiple workspaces** — Create isolated workspaces for different projects. Each workspace has its own nodes, arcs, and views. Demo workspace included.
- **Label-based classification** — Organize items with flexible labels (e.g., "Person", "Company", "Concept"). No rigid schemas.
- **Properties** — Attach structured key-value data to any item (dates, numbers, text, booleans).
- **Markdown content** — Every node supports rich markdown content with GitHub Flavored Markdown.
- **Query engine** — Visual query builder with boolean logic (AND/OR/NOT), label filters, property filters, relationship traversal, pipeline steps, and hop expansion. Advanced text mode available.
- **Connect mode** — Define two independent queries and discover how their results connect across the graph via bidirectional traversal.
- **Timeline view** — Switch from graph to a vertical timeline ordered by any date property. Multi-date field selection supported.
- **Import/export** — Import from JSON with optional semantic merge review. Export your full graph as JSON with title-based arc references for clean roundtrips.
- **Semantic duplicate detection** — Sentence-transformer embeddings (all-MiniLM-L6-v2 via Web Worker) detect near-duplicate nodes and arcs by meaning, not just exact title match. Used during import ("Smart Matching") and as a standalone scanner from the menu.
- **AI label suggestions** — Zero-shot NLI classification suggests relevant labels when creating or editing nodes. Candidate labels sourced from your workspace's existing vocabulary.
- **Graph analysis** — Degree centrality, betweenness centrality, PageRank, connected components, shortest path, clustering coefficient. Results visualized directly on the graph.
- **Bulk operations** — Multi-select nodes (Ctrl/Cmd+click), then bulk edit labels/properties or bulk delete.
- **Import undo** — Pre-import snapshots let you revert an import with one click.
- **Context menu** — Right-click (or long-press on mobile) for quick actions: create, connect, delete.
- **Offline-first PWA** — Install on any device. Works without internet. User-controlled updates.
- **Demo data** — Ships with a tech industry dataset (~109 nodes, ~143 arcs covering companies, people, legal cases, and relationships) so you can explore immediately.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Framework | React + Vite |
| Graph visualization | Cytoscape.js |
| Storage | IndexedDB via Dexie.js |
| Markdown | react-markdown + remark-gfm |
| ML/Embeddings | Hugging Face Transformers (all-MiniLM-L6-v2 via ONNX Web Worker) |
| ML/Label suggestions | Hugging Face Transformers (xtremedistil-l6-h256 via ONNX Web Worker) |
| PWA | vite-plugin-pwa (Workbox) |

## Data Model

Graphiki uses a property graph model where both nodes and arcs (edges) are first-class entities:

- **Workspaces** — Isolated containers for graph data. Each workspace has its own nodes, arcs, and views.
- **Nodes** — Items with a title, markdown content, labels, and key-value properties.
- **Arcs** — Directed relationships between nodes, also with labels and properties.
- **Labels** — Flexible classification tags (e.g., `["Person", "CEO"]`). Multiple labels per item.
- **Properties** — Flat key-value pairs for structured data (`{ "founded": 2019, "hq": "San Francisco" }`).

No schema layer. Classification is driven entirely by labels.

## Documentation

- [User Guide](USER_GUIDE.md)
- [Testing Guide](TESTING_GUIDE.md)
- [Tutorial](TUTORIAL.md)

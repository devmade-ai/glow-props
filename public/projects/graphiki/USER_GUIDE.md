# Graphiki — User Guide

A plain-language guide for using Graphiki, the visual knowledge workspace.

---

## What Is Graphiki?

Graphiki helps you map out relationships between things — people, companies, ideas, events, or anything else. You create **items** and draw **connections** between them, then explore the result as an interactive graph or timeline.

Everything stays on your device. No account needed, no data sent to any server.

---

## Getting Started

### First Visit

When you first open Graphiki, you'll see:
1. A **Quick Tour** walkthrough explaining the main features (7 short steps)
2. A **Demo** workspace pre-loaded with real tech industry data — companies, people, acquisitions, and more

You can revisit the Quick Tour anytime from the header.

### Workspaces

Workspaces keep your projects separate. Each workspace has its own items, connections, and views.

- **Create a workspace**: Click "+ New Workspace" on the landing page, type a name, and click Create
- **Open a workspace**: Click "Open" on any workspace card
- **Rename**: Click "Rename" on a card, edit the name, then Save
- **Delete**: Click "Delete" on a card and confirm. This permanently removes the workspace and everything in it — there is no undo

To return to the workspace list from inside a workspace, click the back arrow in the header.

---

## Creating Items and Connections

### Add an Item

1. Click the **"+ New Item"** button in the toolbar
2. Enter a title (required)
3. Optionally add labels (comma-separated, like "Person, CEO")
4. Click Create

The new item appears on the graph and its details open automatically.

### Label Suggestions

When you type a title, Graphiki can suggest relevant labels based on the item's name. Click any suggestion to add it. This uses a small AI model (~13MB, downloaded once on first use).

### Connect Two Items

1. Right-click an item (or long-press on mobile)
2. Choose **"Connect to..."**
3. Search for and select the target item
4. Optionally name the relationship (e.g., "founded", "works at")
5. Click Connect

### Edit an Item or Connection

1. Click any item or connection on the graph
2. A detail panel opens (side panel on desktop, bottom sheet on mobile)
3. Click **"Edit"** to modify the title, labels, properties, or content
4. Click **"Save"** when done — changes are saved immediately

### Delete Items

- **Single item**: Right-click → "Delete" → confirm
- **Multiple items**: Hold Ctrl (or Cmd on Mac) and click several items, then right-click → "Delete N items"
- Deleting an item also removes all its connections

---

## Exploring Your Graph

### Graph View

The default view shows your items as circles connected by lines. You can:
- **Pan**: Click and drag the background
- **Zoom**: Scroll wheel or pinch on mobile
- **Move items**: Drag them to rearrange
- **Select**: Click an item to see its details
- **Multi-select**: Ctrl/Cmd+Click to select several items at once

Items are color-coded by their first label.

### Timeline View

Switch to Timeline using the tabs at the top (Graph | Timeline). The timeline shows your items sorted by date, newest first.

- Choose which date fields to display using the checkboxes at the top
- Items with multiple dates (e.g., "founded" and "acquired") appear at each date
- Items without dates are shown in a separate "Excluded" section
- Click any entry to see its details

### Searching and Filtering

The query builder at the top lets you filter your graph. Add filters like:
- **Has label**: Show only items with a specific label (e.g., "Company")
- **Property**: Filter by a property value (e.g., "founded > 2010")
- **Title contains**: Search for items by name
- **Connected by**: Find items connected by specific types of relationships

You can combine filters with AND ("Match all") or OR ("Match any"). Add multiple steps to progressively narrow results — the output of each step feeds into the next.

After searching, use **hop expansion** (0–3 hops) to also show neighbors of your results.

### Connect Mode

Want to see how two groups relate? Switch to **Connect** mode:
1. Define query A (e.g., "label:Person")
2. Define query B (e.g., "label:Company")
3. Set the maximum number of hops between them
4. Click Search

The graph highlights how the two groups connect, with bridge items shown in orange.

---

## Import and Export

### Exporting Your Data

1. Open the menu (hamburger icon) → **"Export"**
2. Click **"Download JSON"**
3. A `.json` file is saved to your device

This is your backup. Keep it safe — it's the only way to recover data if you clear your browser.

### Importing Data

1. Open the menu → **"Import"**
2. Upload a `.json` file or paste JSON text
3. Optionally enable **Smart Matching** to detect duplicates by meaning (downloads ~80MB model on first use). You can skip this step — all items will be treated as new.
4. Review the results: accept or reject each item
5. Click **"Import"** to add accepted items to your workspace

After importing, you can click **"Undo Import"** to revert everything. This undo is only available until you refresh the page.

### Import Format

To prepare data for import, open the menu → **"Import Conventions"**. This shows the expected JSON format with a copy button — paste it into an AI assistant alongside your raw data to get properly formatted output.

---

## Finding Duplicates

If your workspace has grown and you suspect duplicate items:

1. Open the menu → **"Find Duplicates"**
2. Adjust the similarity threshold if needed
3. Click **"Scan"** (downloads ~80MB model on first use)
4. Review the detected pairs with similarity scores
5. For each pair, choose which item to keep — connections are automatically re-pointed

---

## Graph Analysis

Open the menu → **"Analysis"** to run algorithms on your graph:

| Algorithm | What it tells you |
|-----------|------------------|
| **Degree Centrality** | Which items have the most connections |
| **Betweenness Centrality** | Which items act as bridges between groups |
| **PageRank** | Which items are most "important" (like Google's ranking) |
| **Connected Components** | Whether your graph has disconnected clusters |
| **Shortest Path** | The shortest route between any two items |
| **Clustering Coefficient** | How tightly connected each item's neighbors are |

Results appear directly on the graph — important items grow larger, paths are highlighted, and clusters get distinct colors.

---

## Bulk Editing

Select multiple items (Ctrl/Cmd+Click), then use the detail panel to:
- **Add or remove labels** across all selected items at once
- **Set a property** on all selected items
- **Delete** all selected items

---

## Installing as an App

Graphiki works as a Progressive Web App — you can install it on your device for offline use.

- **Chrome, Edge, Brave**: An "Install" banner appears. Click "Install" to add Graphiki to your home screen or app launcher.
- **Safari, Firefox**: Click "How to Install" for step-by-step instructions specific to your browser.

Once installed, Graphiki works without an internet connection. Updates are checked every hour — when one is available, an "Update Available" button appears in the header.

---

## Tips

- **Right-click** (or long-press on mobile) for quick actions on any item
- **Click connected items** in the detail panel to navigate between them
- **Use labels generously** — they're the primary way to organize and search your graph
- **Export regularly** — your data lives only in your browser. An export is your backup.
- The **"dbg" pill** in the bottom corner is a developer tool (alpha phase). You can ignore it.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Escape | Close any panel or dialog |
| Enter | Submit forms (create, connect, rename) |
| Ctrl/Cmd+Click | Toggle multi-selection |
| Tab / Shift+Tab | Navigate within dialogs |

---

## Troubleshooting

**My data disappeared after clearing browser data**
Graphiki stores everything in your browser's local database (IndexedDB). Clearing browser data, switching browsers, or using private/incognito mode will remove your data. Always keep an exported JSON backup.

**The graph layout changed to a grid**
For performance, graphs with 500+ items automatically switch to a simpler grid layout. This is normal.

**Smart Matching or Find Duplicates is slow the first time**
These features download a ~80MB AI model on first use. After that, it's cached by your browser and loads quickly.

**I can't install the app**
Installation works best on Chrome, Edge, or Brave. On Safari and Firefox, follow the manual installation instructions shown in the "How to Install" guide.

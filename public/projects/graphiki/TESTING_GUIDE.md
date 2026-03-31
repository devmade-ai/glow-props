# Testing Guide — Manual Test Scenarios

Manual test scenarios for QA across browsers and devices. Updated when features change.

---

## Core Workflows

### Create and Connect Nodes
1. Open a workspace (or create a new one)
2. Click "+ New Item", enter a title, add a label (e.g., "Person")
3. Verify node appears on the graph
4. Right-click the node → "Connect to..." → pick another node
5. Verify arc appears on the graph and in the detail drawer connections section

### Search and Filter
1. Open the query builder
2. Add a filter by label (e.g., "Company")
3. Click Search — verify only matching nodes shown
4. Add a second filter, toggle AND/OR — verify logic applies
5. Use hop expansion (1–3) — verify neighbors appear
6. Clear search — verify full graph restored

### Connect Mode (Dual Query)
1. Switch to Connect mode in the query builder
2. Define Group A (e.g., label:Person) and Group B (e.g., label:Company)
3. Set max hops, run query
4. Verify color coding: blue (A), green (B), orange (bridge), amber (path arcs)

### Import JSON
1. Open Import modal from burger menu
2. Upload a valid JSON file
3. Review merge screen — accept/reject duplicates and conflicts
4. Verify imported nodes and arcs appear in workspace
5. Use Undo Import — verify workspace restored to pre-import state

### Import JSON (Paste)
1. Open Import modal from burger menu
2. Click "Or paste JSON data" toggle
3. Paste valid JSON with nodes and connections
4. Verify merge review screen appears
5. Accept items and verify they appear in workspace

### Export JSON
1. Open Export modal from burger menu
2. Export current workspace
3. Verify downloaded file contains nodes and arcs with version envelope

### Analysis
1. Open Analysis modal from burger menu
2. Run each algorithm (degree centrality, betweenness, PageRank, components, shortest path, clustering)
3. Verify results table populates and graph visualization updates (sizing, coloring, path highlights)

### Timeline View
1. Switch to Timeline view
2. Select a date property — verify items grouped by month, newest first
3. Select multiple date properties — verify nodes appear at each date point
4. Verify excluded items section shows nodes without date values

### Label Suggestions
1. Open a workspace with some labeled nodes
2. Click "+ New Item", enter a title (e.g., "Tim Cook")
3. Click "Suggest Labels" button below the label input
4. First time: verify model download progress bar (~13MB)
5. Verify suggestion badges appear (e.g., "Person", "Company")
6. Click a suggestion badge — verify it's added to the label input
7. Click "Dismiss" — verify suggestions disappear
8. Edit an existing node → enter edit mode
9. Click "Suggest Labels" — verify suggestions appear based on title + content
10. Close modal/drawer — verify no errors (worker cleanup via ref counting)
11. Test with empty workspace — verify default labels suggested (Person, Company, etc.)
12. Disable `enableLabelSuggestions` in config — verify button doesn't appear

### Workspaces
1. From workspace manager, create a new workspace
2. Verify it appears in the list, can be renamed, opened, and deleted
3. Verify Demo workspace exists with seed data on first visit
4. Verify deleting a workspace removes all its nodes, arcs, and views

---

## Cross-Browser Checks

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile
- [ ] iOS Safari
- [ ] Android Chrome

---

## PWA

### Install
- [ ] Chrome/Edge: native install prompt works
- [ ] Safari iOS: "How to Install" modal with correct instructions
- [ ] Firefox: "How to Install" modal with correct instructions

### Offline
- [ ] App loads without network after first visit
- [ ] All CRUD operations work offline
- [ ] Service worker update prompt appears when new version deployed

---

## Accessibility

- [ ] Tab navigation through all modals (focus trap working)
- [ ] Escape key closes modals
- [ ] ARIA roles present on context menu, drawer, view switcher, modals
- [ ] Mobile bottom sheet: swipe-to-dismiss, body scroll lock
- [ ] Touch targets ≥ 44px on mobile

---

## Tutorial

- [ ] Tutorial shows on first visit (clean localStorage)
- [ ] Tutorial steps match current UI features
- [ ] "Quick Tour" button in header reopens tutorial
- [ ] Skip and navigation work correctly

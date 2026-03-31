# Testing Guide

## UI Test Scenarios

### Home Screen — Bottom Sheet

1. **Load app** — Map fills entire screen, bottom sheet shows at half-height with search bar visible
2. **Drag handle up** — Sheet expands to near full screen, more stations visible
3. **Drag handle down** — Sheet collapses to peek (handle + header visible), full map visible
4. **Flick up quickly** — Sheet snaps to next position up
5. **Flick down quickly** — Sheet snaps to next position down
6. **Rotate device / resize browser** — Sheet adjusts to new screen size, stays at current snap position

### Home Screen — Search

7. **Type address** — Suggestions appear after 2+ characters, debounced 300ms
8. **Tap suggestion** — Map centers on location, stations load for that area
9. **Tap GPS crosshair** — Button turns teal, loads stations near your location
10. **Clear search** — Tap X in search bar, text clears

### Home Screen — Filters

11. **Tap fuel type chip** — Chip highlights, stations filter to that fuel type
12. **Tap radius chip** — Chip highlights, search radius changes
13. **Scroll station list down** — Filters auto-hide (animated collapse)
14. **Scroll station list up** — Filters reappear (animated expand)
15. **Tap Reset** — Fuel type cleared, radius reset to 10 km
16. **Close and reopen app** — Fuel type and radius preferences are preserved

### Home Screen — Station List

17. **Default sort** — Stations sorted by cheapest price first
18. **Tap "Nearest"** — Stations re-sort by distance
19. **Tap "Cheapest"** — Stations re-sort by price
20. **No results with filters** — Empty state shows "Try widening your search" + Reset Filters button
21. **No results without filters** — Empty state shows "Try searching a different location"

### Station Detail

22. **Tap station card** — Navigate to detail view with prices, directions, amenities
23. **Prices show staleness** — Green dot (today), yellow dot (this week), warning icon (outdated)
24. **Tap Get Directions** — Opens native maps app with navigation
25. **Pull to refresh** — Reloads station data

### Dark/Light Theme

26. **Hamburger menu, theme toggle** — Theme switches, all screens update
27. **Close and reopen app** — Theme preference preserved

### PWA (Web Only)

28. **First visit on Chrome** — Install banner appears at bottom after service worker registers
29. **Tap "Install"** — Browser install prompt appears
30. **Tap "Not now"** — Banner dismissed, preference saved (won't show again)
31. **Safari iOS** — "How to Install" button shows step-by-step instructions
32. **Update available** — Update banner appears at top with "Update now" button

### Admin

33. **Hamburger menu, Admin** — Admin station list loads
34. **Search stations** — Filters by name, brand, address, city
35. **Tap Edit** — Station edit form loads with current data
36. **Edit name/address, Save** — Toast confirms success
37. **Edit price, Save** — Price upserted, toast confirms
38. **Tap Deactivate** — Confirmation dialog, station status changes, toast confirms
39. **Tap Activate** — Station re-activated, appears in public search again

### Accessibility

40. **Screen reader on bottom sheet handle** — Announces "Station list panel" with expand/collapse hints
41. **Screen reader increment/decrement actions** — Sheet snaps between positions

### Error Handling

42. **Turn off network, search address** — Error message "Search failed. Check your connection and try again."
43. **Slow network on search** — Request times out after 8 seconds, error shown

## Regression Checklist

- [ ] Home screen: map fills background, bottom sheet overlays with stations
- [ ] Bottom sheet: drag up/down/flick all work, 3 snap positions
- [ ] Filters: collapse on scroll down, expand on scroll up
- [ ] Fuel type + radius preferences persist across sessions
- [ ] Default sort is cheapest
- [ ] Station detail: prices, directions, pull-to-refresh all work
- [ ] Dark/light theme toggle works and persists
- [ ] PWA install prompt appears on Chromium browsers
- [ ] Admin: station list, edit, price editor, activate/deactivate
- [ ] Error feedback shown on network failure

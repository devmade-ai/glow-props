# User Guide

## Overview

FuelHunt is a fuel station finder for South Africa. It helps you find the cheapest fuel near you by showing stations on a map and in a draggable list, sorted by price or distance.

## Home Screen

### Map + Station List

The home screen shows a full-screen map with stations marked by their cheapest price. A draggable list overlays the bottom of the screen:

- **Swipe the list up** to browse more stations
- **Swipe the list down** to see the full map
- The list starts at half-screen height — you can see both the map and a few stations

### Searching for Stations

**By address:** Type an address or area name in the search bar at the top of the list. Suggestions appear as you type — tap one to search that area.

**By GPS:** Tap the crosshair button to use your current location. The button turns teal when GPS is active. GPS is only requested when you tap — the app won't ask for location permission on startup.

**Clear search:** Tap the X button in the search bar to clear your search text.

### Filtering Results

**Fuel type:** Tap a fuel type chip (ULP 93, ULP 95, Diesel, etc.) to filter stations that sell that fuel. Tap it again to deselect.

**Search radius:** Tap a distance chip (5, 10, 15, 25, or 50 km) to change how far to search.

**Reset filters:** Tap the "Reset" button to clear the fuel type filter and reset the radius to default (10 km).

Filters auto-hide when you scroll the station list down, and reappear when you scroll up.

### Sorting

Use the **Nearest** / **Cheapest** toggle above the station list:
- **Cheapest** (default): Stations with the lowest prices appear first
- **Nearest**: Closest stations appear first

### Your Preferences are Saved

Your selected fuel type and search radius are remembered between visits — you don't need to set them each time.

## Station Detail

Tap any station card to see its full details:

- **All fuel prices** with freshness indicators:
  - Green dot = updated today
  - Yellow dot = updated this week
  - Warning icon = outdated (more than 7 days old)
- **Price trend arrows** next to each fuel price:
  - Green down arrow = price dropped since last update
  - Red up arrow = price went up
  - No arrow = price unchanged or no previous data
- **Price history chart** — a 30-day bar chart showing how prices have changed over time. Select different fuel types to compare.
- **Get Directions** — opens your phone's maps app (Apple Maps or Google Maps) with navigation to the station
- **Share** — send the station details to friends via your phone's share menu, or copy to clipboard
- **Phone number** — tap to call the station
- **Amenities** — convenience store, car wash, ATM, etc.
- **Operating hours** — day-by-day schedule

Pull down to refresh the station's data.

## Dark / Light Mode

Tap the hamburger menu (three lines) in the top-right corner, then tap the theme toggle to switch between dark and light mode. Your preference is saved.

## Installing as an App (PWA)

FuelHunt works as a web app, but you can install it on your phone's home screen for a native app experience:

**Chrome / Edge / Brave:** An "Install" banner appears at the bottom — tap "Install" and follow the prompts.

**Safari (iPhone/iPad):** Tap Share → "Add to Home Screen" → "Add".

**Firefox (Android):** Tap the three-dot menu → "Install" → "Install" again.

Tap "Not now" to dismiss the install prompt. You can still use FuelHunt in the browser.

## Admin (Station Management)

Access admin via the hamburger menu → "Admin". You'll need to sign in with an admin email and password.

### Station List

- **Search** stations by name, brand, address, or city
- **Activate/Deactivate** stations to show or hide them from public search
- Pull down to refresh the list

### Editing a Station

Tap any station to open its edit form:

- **Details** — name, brand, address, city, postal code, phone number
- **Coordinates** — latitude and longitude (for map placement)
- **Prices** — inline editing per fuel type
- **Active/Inactive toggle** — control whether the station appears in public search

### Bulk Price Update

Tap "Bulk Price Update" on the station list screen. This is for regulated fuel types where the government sets a single national price each month:

1. Select a regulated fuel type (e.g., ULP 93, ULP 95, Diesel 50ppm)
2. Enter the new price per litre
3. Confirm — the price is applied to all active stations at once

### Bulk Import

Tap "Bulk Import" on the station list screen to add multiple stations at once:

1. Choose input method — paste JSON or upload a JSON file
2. Tap "Validate" to check the data for errors
3. Review the preview — valid stations show a green check, errors show in red
4. Tap "Import" to add the valid stations to the database

Each station in the JSON needs at minimum: name, address, city, latitude, and longitude.

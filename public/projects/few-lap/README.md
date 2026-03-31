# FuelHunt

Fuel station finder for South Africa. Find the cheapest fuel near you — search by location, filter by fuel type, and get directions.

## Status

MVP in active development. Full-screen map with draggable bottom sheet (Google Maps style), station detail, admin management, PWA support, dark/light theme, collapsible filters, and persisted preferences are implemented.

## Features

- Full-screen interactive map with station markers and clustering
- Google Maps-style draggable bottom sheet for browsing results
- Search by address/area or use GPS location
- Filter by fuel type (ULP 95, Diesel, etc.) and search radius
- Station detail view with fuel prices, trend indicators, and 30-day price history chart
- Admin panel for station management
- Dark/light theme with persisted preferences
- PWA support — installable, works offline
- Platform deep links to Apple Maps / Google Maps for directions

## Tech Stack

- **Frontend:** Expo (React Native) — iOS, Android, and Web from one codebase
- **Backend:** Supabase (PostgreSQL + PostGIS)
- **Maps:** Mapbox GL (native SDK + mapbox-gl JS on web with clustering)
- **PWA:** Service worker, install prompts, offline support
- **Navigation:** Platform deep links to Apple Maps / Google Maps

## Data & Privacy

- Station data (locations, prices) stored in Supabase cloud database
- User preferences (theme, filters) stored locally on device
- No user accounts required for browsing
- Admin features require authentication

## Documentation

- [User Guide](USER_GUIDE.md)
- [Testing Guide](TESTING_GUIDE.md)

# Four Ems

A self-hosted form builder that lets users create multi-page forms with conditional logic, collect responses, and embed forms in external sites. Built as a PWA with React/Vite, backed by Supabase for data and a Node backend on Vercel for email and integrations.

## Features

- **Multi-page forms** with customizable page navigation and progress bar
- **13 field types** — text, email, phone, number, date, select, radio, checkbox, checkbox group, textarea, rating, heading, hidden
- **Conditional logic** — show/hide fields and pages based on user answers
- **Drag-and-drop builder** — visual form editor with field palette, properties panel, and live preview
- **Response dashboard** — sortable/filterable submission table, detail panel, status management, CSV export
- **Embeddable forms** — iframe embed with auto-resize for external sites
- **PWA support** — installable app with offline detection and update prompts
- **Auto-save** — 2-second debounced save in the builder
- **Document-to-form import** — paste AI-generated JSON to create forms from documents

## Tech Stack

- **React 19** + TypeScript + Vite
- **Tailwind CSS** for styling
- **Zustand** for state management
- **dnd-kit** for drag-and-drop
- **React Router** for routing
- **Supabase** (PostgreSQL) for data
- **vite-plugin-pwa** for PWA support

## Documentation

- [User Guide](USER_GUIDE.md)
- [Testing Guide](TESTING_GUIDE.md)

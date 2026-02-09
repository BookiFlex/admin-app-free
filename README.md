# BookiFlex Admin Panel

Admin panel frontend for the [BookiFlex](https://wordpress.org/plugins/flavor-flavor/) WordPress booking plugin. Built with Vue 3 and Vite.

## Project Structure

```
packages/
├── admin-core/    # Shared library (components, composables, utilities)
└── admin-free/    # Free edition admin app
```

- **admin-core** — reusable components, API client, composables, and widgets shared across editions
- **admin-free** — the main admin panel application for the free version of the plugin

## Requirements

- Node.js (LTS)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev:free
```

The Vite dev server will start at `http://127.0.0.1:5173` with hot module replacement.

## Build

```bash
# Build all packages
npm run build:free

# Lint & format
npm run lint
npm run format
```

## How It Works

The admin panel is loaded inside WordPress as an SPA. In development mode, assets are served from the Vite dev server. In production, compiled assets are bundled into the plugin's `assets/` directory with a `manifest.json` for cache-busting.

## License

This project is licensed under the [GPLv2 or later](https://www.gnu.org/licenses/gpl-2.0.html).
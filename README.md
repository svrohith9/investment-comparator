# Investment Comparator

Compare real estate and stock market outcomes with deterministic, local estimates. This version runs without third-party data APIs so it can be used offline.

## Features

- Side-by-side real estate vs. benchmark index projections
- Local, deterministic heuristics for tax/appreciation/CAGR
- Interactive inputs with charted results
- Mobile-first, single-page flow

## Quick Start

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Project Structure

```
components/        UI screens and controls
services/          Local analysis and data utilities
App.tsx            App shell and view routing
types.ts           Shared TypeScript types
```

## Local Data Notes

The app does not call external APIs. Market data is derived from local heuristics in `services/api.ts`. If you want to plug in real data later, replace those functions with your data source and update the UI copy accordingly.

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build

## Contributing

See `CONTRIBUTING.md`.

## Security

See `SECURITY.md` for reporting guidelines.

## License

MIT, see `LICENSE`.

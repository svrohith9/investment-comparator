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
cp .env.example .env.local
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

## Inputs Modeled

- Real estate: price, down payment, loan term, interest, HOA, insurance, maintenance, taxes, appreciation
- Stocks: ticker, historical start date, CAGR derived from market data

## Market Data

This app uses Alpha Vantage for historical daily prices to compute CAGR from your selected start date.

Set your API key in `.env.local`:

```
VITE_ALPHA_VANTAGE_KEY=your_api_key_here
```

If the API key is missing or rate-limited, the app falls back to local default estimates.

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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Crypto Dash is a client-only React 19 + Vite app (plain JavaScript, no TypeScript) for browsing cryptocurrency data from the CoinGecko API.

## Commands

```bash
npm ci            # install exact locked versions
npm run dev       # dev server on http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build
npm run lint      # ESLint (flat config)
npx eslint src/App.jsx   # lint one file
```

There is no test framework. The README's `npm run Build` is a typo; npm script names are case-sensitive.

## Environment

`.env` is committed to git, and both values are inlined into the client bundle:

- `VITE_COINS_API_URL`: the `/coins/markets` endpoint. It **must already contain a query string** (`?vs_currency=usd`), because `useCoinList.js` appends further parameters starting with `&`.
- `VITE_COIN_API_URL`: the `/coins` base URL with **no** query string or trailing slash. `coin-details.jsx` appends `/{id}`, and `CoinChart.jsx` appends `/{id}/market_chart?...`.

Restart the dev server after changing `.env`. Requests go directly from the browser to CoinGecko with no key, proxy, or cache, so rate limiting is the usual cause of failed fetches.

## Architecture

Routing is declarative React Router v7, imported from `react-router` (not `react-router-dom`): `BrowserRouter` is in `main.jsx` and `Routes` in `App.jsx`. There are no loaders or data router. `BrowserRouter` means production hosting needs an SPA fallback to `index.html`.

Data is fetched in three independent places using `fetch` inside `useEffect`, with no shared API layer:

1. **`hooks/useCoinList.js`** fetches `/coins/markets` for `pages/home.jsx`. It takes a query fragment (`'per_page=10'`), or `null` to skip fetching. Home calls it twice: once for the main list and once, by `ids`, for the favorites view. Home owns the control state, which unmounts with the page, so returning to Home resets the controls and refetches the list.
2. **`pages/coin-details.jsx`** fetches one coin by the `:id` route param. It does not reuse the list, and the response shape differs: the list is flat (`coin.current_price`, `coin.image` as a string), while details are nested (`coin.market_data.current_price.usd`, `coin.image.large`).
3. **`components/CoinChart.jsx`** fetches 7 days of prices after the details have loaded.

Only `limit` triggers a main list refetch. The API request always uses `order=market_cap_desc`; filtering and sorting happen client-side in `pages/home.jsx`, so they only apply to the loaded coins (the top `limit`, or the favorites). A new sort option needs both an `<option>` in `SortSelector.jsx` and a matching `case` in `home.jsx`.

Favorites are coin IDs in `localStorage` (`crypto-dash:favorites`), managed by `hooks/useFavorites.js`, which syncs across tabs. The favorites view fetches by ID because a starred coin may be outside the top `limit`. `favoriteIds` in `home.jsx` is a snapshot of the IDs to fetch, kept separate from `favorites` so unstarring doesn't refetch. CoinGecko omits IDs it has no data for, so Home shows an `UnavailableCoinCard` for each requested favorite that wasn't returned; otherwise it couldn't be unstarred.

Chart.js is tree-shaken: scales, elements, and plugins must be registered with `ChartJS.register(...)` in `CoinChart.jsx` before use. The area fill is configured with `fill: true`, but the `Filler` plugin it needs is not registered.

Styling is one global stylesheet, `src/index.css`, except `not-found.jsx`, which uses an inline style object.

## Conventions

- Page files are kebab-case (`coin-details.jsx`); component files are PascalCase (`CoinCard.jsx`).
- Components are arrow functions with a default export, and source files use single quotes, including in JSX attributes.
- ESLint's `no-unused-vars` ignores variables matching `^[A-Z_]`.

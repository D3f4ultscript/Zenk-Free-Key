# Nodewatch

Nodewatch is a static FiveM server intelligence dashboard. It accepts a FiveM join code such as `96l8db` or a full `cfx.re/join/...` link and displays public server information.

## Cloudflare Pages deployment

Deploy this repository through Cloudflare Pages with these settings:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node.js version:** `20` or newer
- **Deploy command bei Wrangler/CI:** `npm run deploy`

Wichtig: Verwende nicht `npx wrangler deploy`. Das ist der Deploy-Befehl für normale Workers und führt bei diesem Pages-Projekt zu `Missing entry-point to Worker script`. Für dieses Projekt ist `npx wrangler pages deploy dist` beziehungsweise das hinterlegte Script `npm run deploy` korrekt.

The `functions/api/server/[code].js` Pages Function proxies the public FiveM endpoint server-side. This is required because direct browser requests are blocked by CORS. Keep the `functions` folder in the repository when connecting it to Cloudflare Pages; do not upload only the `dist` folder if you want live server lookups.

After deployment, test a URL such as `/` and search for `96l8db`. Cloudflare Pages will publish the frontend and the `/api/server/:code` function together.

## Local development

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Data scope

Only information exposed by the public FiveM server endpoint is shown. The app does not attempt to access private data, identifiers, passwords, or protected server resources.

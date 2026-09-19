# Deploying anurag-kushwaha.in with /invoice

Everything now lives under `~/Github/GARUNA/`:
- `GARUNA/site` — main portfolio (React 19 + Vite) → Vercel, domain root `/`
- `GARUNA/invoice-generator` — invoice app; its frontend build gets copied into
  `site/public/invoice/` (static, HashRouter — no server rewrite needed)
- `/api/*` on the domain → invoice-generator's Express + MongoDB backend → Render (free web service)

## 1. Build the invoice app locally (in Terminal, not through Claude — needs real npm registry access)

```bash
cd ~/Github/GARUNA/invoice-generator
npm install        # only if node_modules is missing/stale
npm run build       # outputs dist/
```

## 2. Copy the build into the site

```bash
rm -rf ~/Github/GARUNA/site/public/invoice
cp -r ~/Github/GARUNA/invoice-generator/dist ~/Github/GARUNA/site/public/invoice
```

Repeat steps 1–2 any time you change the invoice app. `site/public/invoice` gets copied
as-is into the site's build output, so it will be served at `anurag-kushwaha.in/invoice/`.

## 3. MongoDB Atlas (free)

1. Create a free account at mongodb.com/cloud/atlas, create an M0 (free) cluster.
2. Create a database user + password, and allow network access from anywhere (0.0.0.0/0)
   so Render can reach it.
3. Copy the connection string (`mongodb+srv://...`).

## 4. Backend on Render (free)

1. Push `GARUNA/invoice-generator` to its own GitHub repo (it isn't one yet — `git init` it if needed).
2. On render.com: New → Web Service → connect that repo.
   - Build command: `npm install`
   - Start command: `npm run server`
   - Add env var `MONGODB_URI` = your Atlas connection string
3. Deploy. Note the resulting URL, e.g. `https://invoice-api-xxxx.onrender.com`.
4. Free tier sleeps after ~15 min idle — first request after a while takes ~30s.

## 5. Wire up the domain

1. Edit `GARUNA/site/vercel.json` (already created) and replace
   `YOUR-RENDER-SERVICE.onrender.com` with your actual Render URL from step 4.
2. On vercel.com: New Project → import the `GARUNA/site` repo. Framework preset: Vite. Deploy.
3. In Vercel project settings → Domains, attach `anurag-kushwaha.in` (update your DNS
   registrar's records to point at Vercel, following Vercel's on-screen instructions).

## 6. Verify

- `anurag-kushwaha.in/` → portfolio
- `anurag-kushwaha.in/invoice/` → invoice app UI loads
- Inside the invoice app, creating/viewing an invoice should succeed (confirms
  `/api/*` → Render → Atlas is wired correctly)

Total cost: $0/month (Vercel Hobby + Render free web service + Atlas M0).

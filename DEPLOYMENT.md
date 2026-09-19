# Deploying anurag-kushwaha.in with /invoice

`GARUNA` is now a single monorepo (one git history, invoice-generator's
history preserved via a subtree merge):

- `GARUNA/site` — main portfolio (React 19 + Vite) → Vercel, domain root `/`
- `GARUNA/invoice-generator` — invoice app; its frontend build gets copied into
  `site/public/invoice/` (static, HashRouter — no server rewrite needed)
- `/api/*` on the domain → invoice-generator's Express + MongoDB backend → Render (free web service)

Both `site` and `invoice-generator` deploy as **separate projects** on their
respective platforms, both pointed at this **same repo**, each with its own
"Root Directory" setting (see steps 4 and 5).

## 1. Build the invoice app locally (in Terminal, not through Claude — needs real npm registry access)

```bash
cd ~/Github/GARUNA/invoice-generator
npm install        # only if node_modules is missing/stale
npm run build       # outputs dist/
```

Or just run the combined script from the repo root:

```bash
cd ~/Github/GARUNA
./sync-invoice.sh   # builds invoice-generator AND copies dist/ into site/public/invoice
```

## 2. Copy the build into the site (skip if you used sync-invoice.sh above)

```bash
rm -rf ~/Github/GARUNA/site/public/invoice
cp -r ~/Github/GARUNA/invoice-generator/dist ~/Github/GARUNA/site/public/invoice
```

Repeat before every push that changes the invoice app — `site/public/invoice` is
committed as source (not a build artifact of `site` itself), so Vercel just serves
it as-is at `anurag-kushwaha.in/invoice/`.

## 3. MongoDB Atlas (free)

1. Create a free account at mongodb.com/cloud/atlas, create an M0 (free) cluster.
2. Create a database user + password, and allow network access from anywhere (0.0.0.0/0)
   so Render can reach it.
3. Copy the connection string (`mongodb+srv://...`).

## 4. Backend on Render (free)

1. Push this repo (`GARUNA`) to GitHub.
2. On render.com: New → Web Service → connect the `GARUNA` repo.
   - **Root Directory**: `invoice-generator`
   - Build command: `npm install`
   - Start command: `npm run server`
   - Add env var `MONGODB_URI` = your Atlas connection string
3. Deploy. Note the resulting URL, e.g. `https://invoice-api-xxxx.onrender.com`.
4. Free tier sleeps after ~15 min idle — first request after a while takes ~30s.

## 5. Wire up the domain

1. Edit `site/vercel.json` (already created) and replace
   `YOUR-RENDER-SERVICE.onrender.com` with your actual Render URL from step 4.
2. On vercel.com: New Project → import the `GARUNA` repo.
   - **Root Directory**: `site`
   - Framework preset: Vite. Deploy.
3. In Vercel project settings → Domains, attach `anurag-kushwaha.in` (update your DNS
   registrar's records to point at Vercel, following Vercel's on-screen instructions).

## 6. Verify

- `anurag-kushwaha.in/` → portfolio
- `anurag-kushwaha.in/invoice/` → invoice app UI loads
- Inside the invoice app, creating/viewing an invoice should succeed (confirms
  `/api/*` → Render → Atlas is wired correctly)

Total cost: $0/month (Vercel Hobby + Render free web service + Atlas M0).

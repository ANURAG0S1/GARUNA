import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as repo from "./repo.js";
import { connectDb } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" })); // logos are base64 data URLs

/** Wraps an async route handler so a rejected promise reaches Express's error handler instead of hanging the request. */
function wrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

const api = express.Router();

/* ---------------- settings ---------------- */

api.get(
  "/settings",
  wrap(async (_req, res) => res.json(await repo.getSettings()))
);

api.put(
  "/settings",
  wrap(async (req, res) => res.json(await repo.saveSettings(req.body)))
);

/* ---------------- clients ---------------- */

api.get(
  "/clients",
  wrap(async (_req, res) => res.json(await repo.listClients()))
);

api.get(
  "/clients/:id",
  wrap(async (req, res) => res.json(await repo.getClient(req.params.id)))
);

api.post(
  "/clients",
  wrap(async (req, res) => res.status(201).json(await repo.createClient(req.body)))
);

api.put(
  "/clients/:id",
  wrap(async (req, res) => res.json(await repo.updateClient(req.params.id, req.body)))
);

api.delete(
  "/clients/:id",
  wrap(async (req, res) => {
    await repo.deleteClient(req.params.id);
    res.status(204).end();
  })
);

/* ---------------- invoices ---------------- */
// Note: /invoices/new must be registered before /invoices/:id so it isn't
// shadowed by the param route.

api.get(
  "/invoices/new",
  wrap(async (_req, res) => res.json(await repo.blankInvoice()))
);

api.get(
  "/invoices",
  wrap(async (_req, res) => res.json(await repo.listInvoices()))
);

api.get(
  "/invoices/:id",
  wrap(async (req, res) => res.json(await repo.getInvoice(req.params.id)))
);

api.post(
  "/invoices",
  wrap(async (req, res) => res.status(201).json(await repo.createInvoice(req.body)))
);

api.put(
  "/invoices/:id",
  wrap(async (req, res) => res.json(await repo.upsertInvoice(req.params.id, req.body)))
);

api.delete(
  "/invoices/:id",
  wrap(async (req, res) => {
    await repo.deleteInvoice(req.params.id);
    res.status(204).end();
  })
);

api.post(
  "/invoices/:id/duplicate",
  wrap(async (req, res) => res.status(201).json(await repo.duplicateInvoice(req.params.id)))
);

/* ---------------- backup / restore ---------------- */

api.get(
  "/backup",
  wrap(async (_req, res) => res.json(await repo.exportBackup()))
);

api.post(
  "/backup/restore",
  wrap(async (req, res) => {
    await repo.restoreBackup(req.body);
    res.status(204).end();
  })
);

app.use("/api", api);

// Error handler: repo functions throw { status, message } for 404s etc.
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || "Internal server error" });
});

// In production, also serve the built frontend (dist/) on the same port,
// so `npm run server` alone can host both the API and the UI if needed.
const distDir = path.join(__dirname, "..", "dist");
app.use(express.static(distDir));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distDir, "index.html"), (err) => {
    if (err) next();
  });
});

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`invoice-generator API listening on :${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

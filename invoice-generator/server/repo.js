import { randomUUID } from "node:crypto";
import { getDb } from "./db.js";

/**
 * MongoDB-backed data access layer. Three collections:
 *   - settings: a single document, keyed by _key: "app" (default business/bank
 *     info, tax/currency/terms defaults, and the next invoice number counter)
 *   - clients: the saved address book
 *   - invoices: every invoice, draft or otherwise
 *
 * Every document also gets a stable `id` field (a UUID, not Mongo's own
 * `_id`) since that's what the frontend (src/lib/types.ts) expects and
 * round-trips through the REST API.
 */

const SETTINGS_KEY = "app";

function defaultSettings() {
  return {
    from: { name: "", contact: "", address: "", phone: "", email: "", logo: "" },
    bank: { name: "", bank: "", acc: "", ifsc: "", branch: "" },
    currency: "₹",
    taxPercent: 0,
    discountPercent: 0,
    terms: "15",
    nextInvoiceNumber: 1,
  };
}

function strip(doc) {
  if (!doc) return doc;
  const { _id, _key, ...rest } = doc;
  return rest;
}

/* ---------------- settings ---------------- */

export async function getSettings() {
  const db = getDb();
  const doc = await db.collection("settings").findOne({ _key: SETTINGS_KEY });
  if (doc) return strip(doc);
  const fresh = defaultSettings();
  await db.collection("settings").insertOne({ _key: SETTINGS_KEY, ...fresh });
  return fresh;
}

export async function saveSettings(settings) {
  const db = getDb();
  await db
    .collection("settings")
    .updateOne({ _key: SETTINGS_KEY }, { $set: { ...settings } }, { upsert: true });
  return getSettings();
}

/* ---------------- clients ---------------- */

export async function listClients() {
  const db = getDb();
  const docs = await db.collection("clients").find({}).sort({ updatedAt: -1 }).toArray();
  return docs.map(strip);
}

export async function getClient(id) {
  const db = getDb();
  const doc = await db.collection("clients").findOne({ id });
  if (!doc) {
    const err = new Error("Client not found");
    err.status = 404;
    throw err;
  }
  return strip(doc);
}

export async function createClient(data) {
  const db = getDb();
  const now = Date.now();
  const client = {
    id: randomUUID(),
    name: data.name || "",
    address: data.address || "",
    phone: data.phone || "",
    email: data.email || "",
    notes: data.notes || "",
    createdAt: now,
    updatedAt: now,
  };
  await db.collection("clients").insertOne(client);
  return strip(client);
}

export async function updateClient(id, data) {
  const db = getDb();
  const { id: _ignored, createdAt: _ignored2, ...rest } = data;
  const res = await db
    .collection("clients")
    .findOneAndUpdate(
      { id },
      { $set: { ...rest, updatedAt: Date.now() } },
      { returnDocument: "after" }
    );
  if (!res) {
    const err = new Error("Client not found");
    err.status = 404;
    throw err;
  }
  return strip(res);
}

export async function deleteClient(id) {
  const db = getDb();
  await db.collection("clients").deleteOne({ id });
}

/* ---------------- invoices ---------------- */

export async function listInvoices() {
  const db = getDb();
  const docs = await db.collection("invoices").find({}).sort({ updatedAt: -1 }).toArray();
  return docs.map(strip);
}

export async function getInvoice(id) {
  const db = getDb();
  const doc = await db.collection("invoices").findOne({ id });
  if (!doc) {
    const err = new Error("Invoice not found");
    err.status = 404;
    throw err;
  }
  return strip(doc);
}

/** Reserves the next invoice number (incrementing the settings counter) and
 * returns a fresh, not-yet-persisted invoice pre-filled from Settings. */
export async function blankInvoice() {
  const db = getDb();
  const settings = await getSettings();
  const number = settings.nextInvoiceNumber || 1;

  await db
    .collection("settings")
    .updateOne({ _key: SETTINGS_KEY }, { $set: { nextInvoiceNumber: number + 1 } });

  const today = new Date().toISOString().slice(0, 10);
  return {
    id: randomUUID(),
    invoiceNumber: String(number),
    invoiceDate: today,
    dueDate: today,
    terms: settings.terms,
    status: "draft",
    from: settings.from,
    clientId: null,
    to: { name: "", address: "", phone: "", email: "" },
    items: [],
    currency: settings.currency,
    taxPercent: settings.taxPercent,
    discountPercent: settings.discountPercent,
    fxRate: 0,
    bank: settings.bank,
    notes: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export async function createInvoice(data) {
  const db = getDb();
  const now = Date.now();
  const invoice = { ...data, id: data.id || randomUUID(), createdAt: now, updatedAt: now };
  await db.collection("invoices").insertOne(invoice);
  return strip(invoice);
}

/** Upsert: creates the invoice if it doesn't exist yet (id came from
 * blankInvoice()), otherwise updates it in place. */
export async function upsertInvoice(id, data) {
  const db = getDb();
  const existing = await db.collection("invoices").findOne({ id });
  const now = Date.now();

  if (!existing) {
    const invoice = { ...data, id, createdAt: now, updatedAt: now };
    await db.collection("invoices").insertOne(invoice);
    return strip(invoice);
  }

  const { id: _ignored, createdAt: _ignored2, ...rest } = data;
  const res = await db
    .collection("invoices")
    .findOneAndUpdate({ id }, { $set: { ...rest, updatedAt: now } }, { returnDocument: "after" });
  return strip(res);
}

export async function deleteInvoice(id) {
  const db = getDb();
  await db.collection("invoices").deleteOne({ id });
}

export async function duplicateInvoice(id) {
  const original = await getInvoice(id);
  const now = Date.now();
  const copy = {
    ...original,
    id: randomUUID(),
    status: "draft",
    invoiceDate: new Date().toISOString().slice(0, 10),
    createdAt: now,
    updatedAt: now,
  };
  const db = getDb();
  await db.collection("invoices").insertOne(copy);
  return strip(copy);
}

/* ---------------- backup / restore ---------------- */

export async function exportBackup() {
  const [invoices, clients, settings] = await Promise.all([
    listInvoices(),
    listClients(),
    getSettings(),
  ]);
  return { invoices, clients, settings, exportedAt: Date.now() };
}

export async function restoreBackup(payload) {
  const db = getDb();
  const { invoices = [], clients = [], settings } = payload || {};

  await db.collection("invoices").deleteMany({});
  await db.collection("clients").deleteMany({});
  if (invoices.length) await db.collection("invoices").insertMany(invoices);
  if (clients.length) await db.collection("clients").insertMany(clients);
  if (settings) {
    await db
      .collection("settings")
      .updateOne({ _key: SETTINGS_KEY }, { $set: { ...settings } }, { upsert: true });
  }
}

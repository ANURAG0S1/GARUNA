import { MongoClient } from "mongodb";

const DB_NAME = process.env.MONGODB_DB_NAME || "invoice_generator";

let client;
let db;

/**
 * Connects once and reuses the same MongoDB client/db for the life of the
 * process. MONGODB_URI must be set (Atlas connection string or a local
 * mongodb:// URI); throws early with a clear message if it's missing so
 * `npm run server` fails fast instead of hanging on a bad connection.
 */
export async function connectDb() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Export it or put it in atlas-credentials.env " +
        "(loaded via `node --env-file=atlas-credentials.env server/index.js`)."
    );
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(DB_NAME);

  // Helpful indexes; safe to call repeatedly (no-op if they already exist).
  await db.collection("clients").createIndex({ id: 1 }, { unique: true });
  await db.collection("invoices").createIndex({ id: 1 }, { unique: true });
  await db.collection("settings").createIndex({ _key: 1 }, { unique: true });

  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("Database not connected yet — call connectDb() before using getDb().");
  }
  return db;
}

export async function closeDb() {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
  }
}

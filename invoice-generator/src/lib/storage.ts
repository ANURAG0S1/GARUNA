import type { AppSettings, BackupPayload, Client, Invoice, InvoiceStats, InvoiceTotals } from "./types";
import { todayISO } from "./format";

/**
 * Thin API client for the Express + SQLite backend (see server/). Every
 * function that touches persisted data is async now — there is no more
 * synchronous localStorage shortcut. Pure calculations (computeTotals,
 * effectiveStatus, stats, ...) stay synchronous since they don't need I/O.
 */

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/* ---------------- settings ---------------- */

export function getSettings(): Promise<AppSettings> {
  return request<AppSettings>("/settings");
}

export function saveSettings(settings: AppSettings): Promise<AppSettings> {
  return request<AppSettings>("/settings", { method: "PUT", body: JSON.stringify(settings) });
}

/* ---------------- clients ---------------- */

export function getClients(): Promise<Client[]> {
  return request<Client[]>("/clients");
}

export function getClient(id: string): Promise<Client> {
  return request<Client>(`/clients/${encodeURIComponent(id)}`);
}

export function createClient(data: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> {
  return request<Client>("/clients", { method: "POST", body: JSON.stringify(data) });
}

export function updateClient(id: string, data: Partial<Client>): Promise<Client> {
  return request<Client>(`/clients/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteClient(id: string): Promise<void> {
  return request<void>(`/clients/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/* ---------------- invoices ---------------- */

export function getInvoices(): Promise<Invoice[]> {
  return request<Invoice[]>("/invoices");
}

export function getInvoice(id: string): Promise<Invoice | null> {
  return request<Invoice>(`/invoices/${encodeURIComponent(id)}`).catch(() => null);
}

/** Reserves the next invoice number and returns a fresh, not-yet-persisted invoice pre-filled from Settings. */
export function blankInvoice(): Promise<Invoice> {
  return request<Invoice>("/invoices/new");
}

export function upsertInvoice(invoice: Invoice): Promise<Invoice> {
  const method = "PUT";
  return request<Invoice>(`/invoices/${encodeURIComponent(invoice.id)}`, { method, body: JSON.stringify(invoice) });
}

export function createInvoice(invoice: Invoice): Promise<Invoice> {
  return request<Invoice>("/invoices", { method: "POST", body: JSON.stringify(invoice) });
}

export function deleteInvoice(id: string): Promise<void> {
  return request<void>(`/invoices/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function duplicateInvoice(id: string): Promise<Invoice> {
  return request<Invoice>(`/invoices/${encodeURIComponent(id)}/duplicate`, { method: "POST" });
}

/* ---------------- backup / restore ---------------- */

export function exportAllData(): Promise<BackupPayload> {
  return request<BackupPayload>("/backup");
}

export function importAllData(payload: BackupPayload): Promise<void> {
  return request<void>("/backup/restore", { method: "POST", body: JSON.stringify(payload) });
}

function downloadJSON(payload: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadFullBackup(): Promise<void> {
  const payload = await exportAllData();
  downloadJSON(payload, `invoice-generator-backup-${todayISO()}.json`);
}

export function exportInvoiceJSON(invoice: Invoice): void {
  downloadJSON(invoice, `invoice-${invoice.invoiceNumber || "draft"}.json`);
}

export function importSingleInvoice(data: Partial<Invoice>): Promise<Invoice> {
  if (!data || !Array.isArray(data.items)) throw new Error("Invalid invoice file");
  const { id: _ignored, ...rest } = data as Invoice;
  return createInvoice(rest as Invoice);
}

/* ---------------- pure calculations (no I/O) ---------------- */

export function isOverdue(invoice: Invoice): boolean {
  if (invoice.status !== "unpaid" && invoice.status !== "draft") return false;
  if (!invoice.dueDate) return false;
  return invoice.dueDate < todayISO();
}

export function effectiveStatus(invoice: Invoice): "draft" | "unpaid" | "paid" | "overdue" {
  if (invoice.status === "paid") return "paid";
  if (isOverdue(invoice)) return "overdue";
  return invoice.status;
}

export function computeTotals(invoice: Invoice): InvoiceTotals {
  const items = invoice.items || [];
  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const discountAmt = subtotal * ((Number(invoice.discountPercent) || 0) / 100);
  const taxable = subtotal - discountAmt;
  const taxAmt = taxable * ((Number(invoice.taxPercent) || 0) / 100);
  const total = taxable + taxAmt;
  const inrEquivalent = total * (Number(invoice.fxRate) || 0);
  return { subtotal, discountAmt, taxAmt, total, inrEquivalent };
}

export function stats(list: Invoice[]): InvoiceStats {
  let totalOutstanding = 0;
  let totalPaid = 0;
  let countPaid = 0;
  let countUnpaid = 0;
  let countOverdue = 0;
  let countDraft = 0;
  for (const invoice of list) {
    const total = computeTotals(invoice).total;
    switch (effectiveStatus(invoice)) {
      case "paid":
        totalPaid += total;
        countPaid++;
        break;
      case "overdue":
        totalOutstanding += total;
        countOverdue++;
        break;
      case "unpaid":
        totalOutstanding += total;
        countUnpaid++;
        break;
      default:
        countDraft++;
    }
  }
  return { totalOutstanding, totalPaid, countPaid, countUnpaid, countOverdue, countDraft, count: list.length };
}

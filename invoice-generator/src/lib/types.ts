export type InvoiceStatus = "draft" | "unpaid" | "paid" | "overdue";
export type PaymentTerms = "0" | "7" | "15" | "30" | "45" | "60" | "custom";
export type CurrencySymbol = "$" | "₹" | "€" | "£";

export interface PartyInfo {
  name: string;
  contact: string;
  address: string;
  phone: string;
  email: string;
  logo: string; // data URL, empty string if none
}

export interface ClientInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

/** A saved client in the address book, picked from a dropdown on an invoice. */
export interface Client extends ClientInfo {
  id: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface BankDetails {
  name: string;
  bank: string;
  acc: string;
  ifsc: string;
  branch: string;
}

export interface LineItem {
  desc: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  terms: PaymentTerms;
  status: InvoiceStatus;
  from: PartyInfo;
  /** id of the saved Client this invoice was billed to, if any (null for a one-off / freeform "to"). */
  clientId: string | null;
  to: ClientInfo;
  items: LineItem[];
  currency: CurrencySymbol;
  taxPercent: number;
  discountPercent: number;
  /** Live INR conversion rate for this invoice's currency, fetched automatically (see src/lib/exchangeRate.ts). 0 means unknown — the INR row is hidden. */
  fxRate: number;
  bank: BankDetails;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  from: PartyInfo;
  bank: BankDetails;
  currency: CurrencySymbol;
  taxPercent: number;
  discountPercent: number;
  terms: Exclude<PaymentTerms, "custom">;
  nextInvoiceNumber: number;
}

export interface InvoiceTotals {
  subtotal: number;
  discountAmt: number;
  taxAmt: number;
  total: number;
  inrEquivalent: number;
}

export interface InvoiceStats {
  totalOutstanding: number;
  totalPaid: number;
  countPaid: number;
  countUnpaid: number;
  countOverdue: number;
  countDraft: number;
  count: number;
}

export interface BackupPayload {
  invoices: Invoice[];
  clients: Client[];
  settings: AppSettings;
  exportedAt: number;
}

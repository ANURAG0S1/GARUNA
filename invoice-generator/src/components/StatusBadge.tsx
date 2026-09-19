import type { InvoiceStatus } from "../lib/types";

const LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  unpaid: "Unpaid",
  paid: "Paid",
  overdue: "Overdue",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return <span className={`status-badge status-${status}`}>{LABELS[status]}</span>;
}

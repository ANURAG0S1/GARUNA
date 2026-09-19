import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Invoice, InvoiceStatus } from "../lib/types";
import { computeTotals, deleteInvoice, duplicateInvoice, effectiveStatus, getInvoices, stats } from "../lib/storage";
import { formatDateForDisplay, formatMoney } from "../lib/format";
import { StatusBadge } from "../components/StatusBadge";
import { ConfirmModal } from "../components/ConfirmModal";
import { useToast } from "../components/Toast";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

type StatusFilter = "all" | InvoiceStatus;

export function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    getInvoices()
      .then((list) => {
        setInvoices(list);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices
      .filter((invoice) => {
        if (statusFilter !== "all" && effectiveStatus(invoice) !== statusFilter) return false;
        if (!q) return true;
        return invoice.invoiceNumber.toLowerCase().includes(q) || invoice.to.name.toLowerCase().includes(q);
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [invoices, query, statusFilter]);

  const s = stats(invoices);
  const currencyGuess = invoices[0]?.currency ?? "$";

  const handleDuplicate = (id: string, evt: MouseEvent) => {
    evt.stopPropagation();
    duplicateInvoice(id)
      .then((copy) => {
        refresh();
        showToast(`Duplicated as invoice #${copy.invoiceNumber}`);
      })
      .catch((err) => showToast(err.message));
  };

  const handleDeleteConfirmed = () => {
    if (!confirmDeleteId) return;
    deleteInvoice(confirmDeleteId)
      .then(() => {
        setConfirmDeleteId(null);
        refresh();
        showToast("Invoice deleted");
      })
      .catch((err) => showToast(err.message));
  };

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate("/new")}>
          + New Invoice
        </button>
      </div>

      {error && <div className="empty-state">Couldn't reach the server: {error}. Is `npm run server` running?</div>}

      {!error && (
        <>
          <div className="stat-grid">
            <StatCard label="Total Invoices" value={s.count} />
            <StatCard
              label="Outstanding"
              value={`${currencyGuess}${formatMoney(s.totalOutstanding)}`}
              sub={`${s.countUnpaid} unpaid · ${s.countOverdue} overdue`}
            />
            <StatCard label="Paid" value={`${currencyGuess}${formatMoney(s.totalPaid)}`} sub={`${s.countPaid} invoices`} />
            <StatCard label="Drafts" value={s.countDraft} />
          </div>

          <div className="toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="Search by invoice # or client..."
              value={query}
              onChange={(evt) => setQuery(evt.target.value)}
            />
            <select value={statusFilter} onChange={(evt) => setStatusFilter(evt.target.value as StatusFilter)}>
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              {invoices.length === 0 ? "No invoices yet. Create your first one to get started." : "No invoices match your search."}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <td>Invoice #</td>
                  <td>Client</td>
                  <td>Date</td>
                  <td>Due Date</td>
                  <td>Status</td>
                  <td style={{ textAlign: "right" }}>Total</td>
                  <td />
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice) => (
                  <tr key={invoice.id} className="clickable-row" onClick={() => navigate(`/view/${invoice.id}`)}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{invoice.to.name || <span className="t-gray">Untitled client</span>}</td>
                    <td>{formatDateForDisplay(invoice.invoiceDate)}</td>
                    <td>{formatDateForDisplay(invoice.dueDate)}</td>
                    <td>
                      <StatusBadge status={effectiveStatus(invoice)} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {invoice.currency}
                      {formatMoney(computeTotals(invoice).total)}
                    </td>
                    <td className="row-actions" onClick={(evt) => evt.stopPropagation()}>
                      <button className="btn-icon" title="Edit" onClick={() => navigate(`/edit/${invoice.id}`)}>
                        ✎
                      </button>
                      <button className="btn-icon" title="Duplicate" onClick={(evt) => handleDuplicate(invoice.id, evt)}>
                        ⧉
                      </button>
                      <button className="btn-icon" title="Delete" onClick={() => setConfirmDeleteId(invoice.id)}>
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Delete invoice?"
        message="This can't be undone."
        danger
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
}

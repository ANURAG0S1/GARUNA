import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Invoice, InvoiceStatus } from "../lib/types";
import { deleteInvoice, duplicateInvoice, exportInvoiceJSON, getInvoice, upsertInvoice } from "../lib/storage";
import { InvoiceDocument } from "../components/InvoiceDocument";
import { ConfirmModal } from "../components/ConfirmModal";
import { useToast } from "../components/Toast";

export function InvoicePreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getInvoice(id)
      .then((inv) => !cancelled && setInvoice(inv))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <div className="page">Loading...</div>;
  }

  if (!invoice) {
    return (
      <div className="page">
        <div className="empty-state">That invoice doesn't exist anymore.</div>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          Back to dashboard
        </button>
      </div>
    );
  }

  const onStatusChange = (status: InvoiceStatus) => {
    const next = { ...invoice, status };
    setInvoice(next);
    upsertInvoice(next)
      .then(() => showToast(`Marked as ${status}`))
      .catch((err) => showToast(err.message));
  };

  const handleDuplicate = () => {
    duplicateInvoice(invoice.id)
      .then((copy) => {
        showToast(`Duplicated as invoice #${copy.invoiceNumber}`);
        navigate(`/edit/${copy.id}`);
      })
      .catch((err) => showToast(err.message));
  };

  const handleDelete = () => {
    deleteInvoice(invoice.id)
      .then(() => {
        showToast("Invoice deleted");
        navigate("/");
      })
      .catch((err) => showToast(err.message));
  };

  return (
    <div className="page preview-page">
      <div className="page-header noprint">
        <h1>Invoice #{invoice.invoiceNumber}</h1>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => navigate("/")}>
            Back
          </button>
          <select
            className="status-select"
            value={invoice.status}
            onChange={(evt) => onStatusChange(evt.target.value as InvoiceStatus)}
          >
            <option value="draft">Draft</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <button className="btn btn-secondary" onClick={() => navigate(`/edit/${invoice.id}`)}>
            ✎ Edit
          </button>
          <button className="btn btn-secondary" onClick={handleDuplicate}>
            ⧉ Duplicate
          </button>
          <button className="btn btn-secondary" onClick={() => exportInvoiceJSON(invoice)}>
            Export JSON
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            🖨️ Print / PDF
          </button>
          <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
            Delete
          </button>
        </div>
      </div>

      <div className="doc-area">
        <div className="doc-page">
          <InvoiceDocument invoice={invoice} />
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Delete invoice?"
        message="This can't be undone."
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

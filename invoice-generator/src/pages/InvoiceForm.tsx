import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Client, CurrencySymbol, Invoice, InvoiceStatus, PaymentTerms } from "../lib/types";
import { blankInvoice, computeTotals, getClients, getInvoice, getSettings, upsertInvoice } from "../lib/storage";
import { addDaysISO, formatMoney } from "../lib/format";
import { fetchInrRate } from "../lib/exchangeRate";
import { useToast } from "../components/Toast";
import { ExchangeRateModal } from "../components/ExchangeRateModal";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

const NO_CLIENT = "__none__";

export function InvoiceForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([isEdit && id ? getInvoice(id) : blankInvoice(), getClients()])
      .then(([inv, clientList]) => {
        if (cancelled) return;
        if (!inv) {
          setNotFound(true);
        } else {
          // For a brand-new invoice with no client chosen yet, default to the
          // "Rungta" client (our most frequent one) so it isn't picked by hand every time.
          if (!isEdit && !inv.clientId) {
            const defaultClient = clientList.find((c) => c.name.toLowerCase().includes("rungta"));
            if (defaultClient) {
              inv.clientId = defaultClient.id;
              inv.to = {
                name: defaultClient.name,
                address: defaultClient.address,
                phone: defaultClient.phone,
                email: defaultClient.email,
              };
            }
          }
          setInvoice(inv);
          fetchRateFor(inv.currency);
        }
        setClients(clientList);
      })
      .catch((err) => !cancelled && showToast(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  /** Auto-fetches the live INR rate for a currency; only falls back to asking the user if the lookup fails. */
  const fetchRateFor = (currency: CurrencySymbol) => {
    fetchInrRate(currency)
      .then((rate) => setInvoice((prev) => (prev ? { ...prev, fxRate: rate } : prev)))
      .catch(() => setRateModalOpen(true));
  };

  if (loading) {
    return <div className="page">Loading...</div>;
  }

  if (notFound || !invoice) {
    return (
      <div className="page">
        <div className="empty-state">That invoice doesn't exist anymore.</div>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          Back to dashboard
        </button>
      </div>
    );
  }

  /** Business & bank details live in Settings now — this pulls the latest saved values onto the current invoice. */
  const syncFromSettings = () => {
    getSettings()
      .then((settings) => {
        setInvoice((prev) => (prev ? { ...prev, from: { ...settings.from }, bank: { ...settings.bank } } : prev));
        showToast("Business & bank details refreshed from Settings");
      })
      .catch((err) => showToast(err.message));
  };

  const onClientSelect = (clientId: string) => {
    if (clientId === NO_CLIENT) {
      setInvoice((prev) => (prev ? { ...prev, clientId: null, to: { name: "", address: "", phone: "", email: "" } } : prev));
      return;
    }
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            clientId: client.id,
            to: { name: client.name, address: client.address, phone: client.phone, email: client.email },
          }
        : prev
    );
  };

  const updateItem = (idx: number, patch: Partial<Invoice["items"][number]>) => {
    setInvoice((prev) => {
      if (!prev) return prev;
      const items = prev.items.slice();
      items[idx] = { ...items[idx], ...patch };
      return { ...prev, items };
    });
  };

  const addItem = () =>
    setInvoice((prev) => (prev ? { ...prev, items: [...prev.items, { desc: "", amount: 0 }] } : prev));

  const removeItem = (idx: number) =>
    setInvoice((prev) => {
      if (!prev) return prev;
      const items = prev.items.filter((_, i) => i !== idx);
      return { ...prev, items: items.length ? items : [{ desc: "", amount: 0 }] };
    });

  const onTermsChange = (value: PaymentTerms) =>
    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            terms: value,
            dueDate: value === "custom" ? prev.dueDate : addDaysISO(prev.invoiceDate, value),
          }
        : prev
    );

  const onInvoiceDateChange = (value: string) =>
    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            invoiceDate: value,
            dueDate: prev.terms === "custom" ? prev.dueDate : addDaysISO(value, prev.terms),
          }
        : prev
    );

  const handleSave = (andView: boolean) => {
    setSaving(true);
    upsertInvoice(invoice)
      .then((saved) => {
        showToast(`Saved invoice #${saved.invoiceNumber}`);
        navigate(andView ? `/view/${saved.id}` : "/");
      })
      .catch((err) => showToast(err.message))
      .finally(() => setSaving(false));
  };

  const totals = computeTotals(invoice);
  const selectedClient = clients.find((c) => c.id === invoice.clientId) || null;

  return (
    <div className="page form-page">
      <div className="page-header">
        <h1>{isEdit ? `Edit Invoice #${invoice.invoiceNumber}` : "New Invoice"}</h1>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => navigate("/")}>
            Cancel
          </button>
          <button className="btn btn-secondary" disabled={saving} onClick={() => handleSave(false)}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="btn btn-primary" disabled={saving} onClick={() => handleSave(true)}>
            Save &amp; View
          </button>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-card">
          <h2>Invoice Info</h2>
          <div className="field-row">
            <Field label="Invoice #">
              <input
                type="text"
                value={invoice.invoiceNumber}
                onChange={(evt) => setInvoice((prev) => (prev ? { ...prev, invoiceNumber: evt.target.value } : prev))}
              />
            </Field>
            <Field label="Status">
              <select
                value={invoice.status}
                onChange={(evt) => setInvoice((prev) => (prev ? { ...prev, status: evt.target.value as InvoiceStatus } : prev))}
              >
                <option value="draft">Draft</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </Field>
          </div>
          <div className="field-row">
            <Field label="Invoice Date">
              <input type="date" value={invoice.invoiceDate} onChange={(evt) => onInvoiceDateChange(evt.target.value)} />
            </Field>
            <Field label="Terms">
              <select value={invoice.terms} onChange={(evt) => onTermsChange(evt.target.value as PaymentTerms)}>
                <option value="0">Due on receipt</option>
                <option value="7">Net 7</option>
                <option value="15">Net 15</option>
                <option value="30">Net 30</option>
                <option value="45">Net 45</option>
                <option value="60">Net 60</option>
                <option value="custom">Custom due date</option>
              </select>
            </Field>
          </div>
          <Field label="Due Date">
            <input
              type="date"
              value={invoice.dueDate}
              onChange={(evt) => setInvoice((prev) => (prev ? { ...prev, dueDate: evt.target.value } : prev))}
            />
          </Field>
        </div>

        <div className="form-card">
          <div className="card-header-row">
            <h2>Business &amp; Bank Details</h2>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={syncFromSettings}
              title="Pull the latest saved values from Settings"
            >
              ↻ Refresh from Settings
            </button>
          </div>
          <p className="card-hint">Managed in Settings so every invoice stays consistent.</p>
          <div className="settings-summary">
            <div className="settings-summary-row">
              {invoice.from.logo ? <img className="settings-summary-logo" src={invoice.from.logo} alt="logo" /> : null}
              <div>
                <div className="settings-summary-title">{invoice.from.name || "Untitled business"}</div>
                <div className="t-gray">{invoice.from.contact}</div>
              </div>
            </div>
            <div className="settings-summary-row">
              <div className="t-gray">
                {invoice.bank.bank || "No bank set"}
                {invoice.bank.acc ? ` · A/c ${invoice.bank.acc}` : ""}
              </div>
            </div>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/settings")}>
            Edit in Settings
          </button>
        </div>

        <div className="form-card">
          <div className="card-header-row">
            <h2>Bill To (client)</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/clients")}>
              + Manage Clients
            </button>
          </div>
          <Field label="Client">
            <select value={invoice.clientId ?? NO_CLIENT} onChange={(evt) => onClientSelect(evt.target.value)}>
              <option value={NO_CLIENT}>— Select a saved client —</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </Field>
          {clients.length === 0 && (
            <p className="card-hint">
              No saved clients yet. <a onClick={() => navigate("/clients")}>Add one</a> to bill them from here.
            </p>
          )}
          {selectedClient ? (
            <div className="settings-summary">
              <div className="settings-summary-row">
                <div>
                  <div className="settings-summary-title">{selectedClient.name}</div>
                  <div className="t-gray">{selectedClient.address}</div>
                  {(selectedClient.phone || selectedClient.email) && (
                    <div className="t-gray">
                      {selectedClient.phone}
                      {selectedClient.phone && selectedClient.email ? " · " : ""}
                      {selectedClient.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="card-hint">This invoice has no client selected yet.</p>
          )}
        </div>

        <div className="form-card form-card-wide">
          <div className="card-header-row">
            <h2>Line Items</h2>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
              + Add Item
            </button>
          </div>
          <table className="items-edit-table">
            <thead>
              <tr>
                <td>Name</td>
                <td>Amount</td>
                <td />
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <input type="text" value={item.desc} onChange={(evt) => updateItem(idx, { desc: evt.target.value })} />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.amount}
                      onChange={(evt) => updateItem(idx, { amount: parseFloat(evt.target.value) || 0 })}
                    />
                  </td>
                  <td>
                    <button type="button" className="btn-icon" onClick={() => removeItem(idx)}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-card">
          <h2>Totals</h2>
          <div className="field-row">
            <Field label="Currency">
              <select
                value={invoice.currency}
                onChange={(evt) => {
                  const currency = evt.target.value as CurrencySymbol;
                  setInvoice((prev) => (prev ? { ...prev, currency } : prev));
                  fetchRateFor(currency);
                }}
              >
                <option value="$">USD ($)</option>
                <option value="₹">INR (₹)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
              </select>
            </Field>
            <Field label="Tax %">
              <input
                type="number"
                min={0}
                step={0.01}
                value={invoice.taxPercent}
                onChange={(evt) => setInvoice((prev) => (prev ? { ...prev, taxPercent: parseFloat(evt.target.value) || 0 } : prev))}
              />
            </Field>
          </div>
          <div className="field-row">
            <Field label="Discount %">
              <input
                type="number"
                min={0}
                step={0.01}
                value={invoice.discountPercent}
                onChange={(evt) =>
                  setInvoice((prev) => (prev ? { ...prev, discountPercent: parseFloat(evt.target.value) || 0 } : prev))
                }
              />
            </Field>
          </div>
          {invoice.currency !== "₹" && (
            <p className="card-hint">
              {invoice.fxRate > 0 ? (
                `INR equivalent shown automatically at 1 ${invoice.currency} = ₹${invoice.fxRate.toFixed(2)} (live rate).`
              ) : (
                <>
                  Couldn't fetch a live exchange rate, so the INR equivalent is hidden.{" "}
                  <a onClick={() => fetchRateFor(invoice.currency)}>Retry</a> or{" "}
                  <a onClick={() => setRateModalOpen(true)}>enter it manually</a>.
                </>
              )}
            </p>
          )}
          <div className="totals-preview">
            <div>
              Subtotal: <b>{invoice.currency}{formatMoney(totals.subtotal)}</b>
            </div>
            <div>
              Total: <b>{invoice.currency}{formatMoney(totals.total)}</b>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h2>Notes / Terms</h2>
          <textarea
            rows={4}
            placeholder="Thank you for your business!"
            value={invoice.notes}
            onChange={(evt) => setInvoice((prev) => (prev ? { ...prev, notes: evt.target.value } : prev))}
          />
        </div>
      </div>

      <ExchangeRateModal
        open={rateModalOpen}
        currency={invoice.currency}
        initialValue={invoice.fxRate}
        onCancel={() => setRateModalOpen(false)}
        onSubmit={(rate) => {
          setInvoice((prev) => (prev ? { ...prev, fxRate: rate } : prev));
          setRateModalOpen(false);
        }}
      />
    </div>
  );
}

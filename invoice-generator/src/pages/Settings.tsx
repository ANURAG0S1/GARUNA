import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import type { AppSettings, BackupPayload, CurrencySymbol } from "../lib/types";
import { downloadFullBackup, getSettings, importAllData, importSingleInvoice, saveSettings } from "../lib/storage";
import { useToast } from "../components/Toast";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function Settings() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch((err) => showToast(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !settings) {
    return <div className="page">Loading...</div>;
  }

  const updateFrom = (patch: Partial<AppSettings["from"]>) =>
    setSettings((prev) => (prev ? { ...prev, from: { ...prev.from, ...patch } } : prev));
  const updateBank = (patch: Partial<AppSettings["bank"]>) =>
    setSettings((prev) => (prev ? { ...prev, bank: { ...prev.bank, ...patch } } : prev));

  const onLogoUpload = (evt: ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateFrom({ logo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!settings) return;
    setSaving(true);
    saveSettings(settings)
      .then((saved) => {
        setSettings(saved);
        showToast("Settings saved");
      })
      .catch((err) => showToast(err.message))
      .finally(() => setSaving(false));
  };

  const handleExportAll = () => {
    downloadFullBackup()
      .then(() => showToast("Exported full backup"))
      .catch((err) => showToast(err.message));
  };

  const handleImportAll = (evt: ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result)) as BackupPayload;
        importAllData(payload)
          .then(() => getSettings())
          .then((s) => {
            setSettings(s);
            showToast("Backup restored");
          })
          .catch((err) => showToast(err.message));
      } catch (err) {
        alert(`Could not read that backup file: ${(err as Error).message}`);
      } finally {
        evt.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleImportOne = (evt: ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        importSingleInvoice(data)
          .then((saved) => showToast(`Imported invoice #${saved.invoiceNumber}`))
          .catch((err) => showToast(err.message));
      } catch (err) {
        alert(`Could not import this file: ${(err as Error).message}`);
      } finally {
        evt.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
          {saving ? "Saving..." : "Save Defaults"}
        </button>
      </div>

      <div className="form-grid">
        <div className="form-card">
          <h2>Default Business Info</h2>
          <p className="card-hint">Used to pre-fill every new invoice.</p>
          <Field label="Business / Logo Name">
            <input type="text" value={settings.from.name} onChange={(evt) => updateFrom({ name: evt.target.value })} />
          </Field>
          <Field label="Logo">
            <div className="logo-upload-row">
              <input type="file" accept="image/*" onChange={onLogoUpload} />
              <button className="btn btn-ghost btn-sm" onClick={() => updateFrom({ logo: "" })}>
                Remove
              </button>
            </div>
          </Field>
          <Field label="Contact Person">
            <input type="text" value={settings.from.contact} onChange={(evt) => updateFrom({ contact: evt.target.value })} />
          </Field>
          <Field label="Address">
            <textarea value={settings.from.address} onChange={(evt) => updateFrom({ address: evt.target.value })} />
          </Field>
          <div className="field-row">
            <Field label="Phone">
              <input type="text" value={settings.from.phone} onChange={(evt) => updateFrom({ phone: evt.target.value })} />
            </Field>
            <Field label="Email">
              <input type="text" value={settings.from.email} onChange={(evt) => updateFrom({ email: evt.target.value })} />
            </Field>
          </div>
        </div>

        <div className="form-card">
          <h2>Default Bank Details</h2>
          <Field label="Account Holder Name">
            <input type="text" value={settings.bank.name} onChange={(evt) => updateBank({ name: evt.target.value })} />
          </Field>
          <Field label="Bank Name">
            <input type="text" value={settings.bank.bank} onChange={(evt) => updateBank({ bank: evt.target.value })} />
          </Field>
          <div className="field-row">
            <Field label="Account No.">
              <input type="text" value={settings.bank.acc} onChange={(evt) => updateBank({ acc: evt.target.value })} />
            </Field>
            <Field label="IFSC / SWIFT">
              <input type="text" value={settings.bank.ifsc} onChange={(evt) => updateBank({ ifsc: evt.target.value })} />
            </Field>
          </div>
          <Field label="Branch">
            <input type="text" value={settings.bank.branch} onChange={(evt) => updateBank({ branch: evt.target.value })} />
          </Field>
        </div>

        <div className="form-card">
          <h2>Defaults</h2>
          <div className="field-row">
            <Field label="Currency">
              <select
                value={settings.currency}
                onChange={(evt) => setSettings((prev) => (prev ? { ...prev, currency: evt.target.value as CurrencySymbol } : prev))}
              >
                <option value="$">USD ($)</option>
                <option value="₹">INR (₹)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
              </select>
            </Field>
            <Field label="Payment Terms">
              <select
                value={settings.terms}
                onChange={(evt) =>
                  setSettings((prev) => (prev ? { ...prev, terms: evt.target.value as AppSettings["terms"] } : prev))
                }
              >
                <option value="0">Due on receipt</option>
                <option value="7">Net 7</option>
                <option value="15">Net 15</option>
                <option value="30">Net 30</option>
                <option value="45">Net 45</option>
                <option value="60">Net 60</option>
              </select>
            </Field>
          </div>
          <div className="field-row">
            <Field label="Default Tax %">
              <input
                type="number"
                min={0}
                step={0.01}
                value={settings.taxPercent}
                onChange={(evt) => setSettings((prev) => (prev ? { ...prev, taxPercent: parseFloat(evt.target.value) || 0 } : prev))}
              />
            </Field>
            <Field label="Default Discount %">
              <input
                type="number"
                min={0}
                step={0.01}
                value={settings.discountPercent}
                onChange={(evt) =>
                  setSettings((prev) => (prev ? { ...prev, discountPercent: parseFloat(evt.target.value) || 0 } : prev))
                }
              />
            </Field>
          </div>
          <Field label="Next Invoice Number">
            <input
              type="number"
              min={1}
              step={1}
              value={settings.nextInvoiceNumber}
              onChange={(evt) =>
                setSettings((prev) => (prev ? { ...prev, nextInvoiceNumber: parseInt(evt.target.value, 10) || 1 } : prev))
              }
            />
          </Field>
        </div>

        <div className="form-card">
          <h2>Data</h2>
          <p className="card-hint">
            Everything is stored in MongoDB, via the API server running with <code>npm run server</code>.
          </p>
          <div className="btn-row-vertical">
            <button className="btn btn-secondary" onClick={handleExportAll}>
              Export Full Backup (JSON)
            </button>
            <label className="btn btn-secondary file-btn">
              Restore Backup (JSON)
              <input type="file" accept="application/json" onChange={handleImportAll} />
            </label>
            <label className="btn btn-ghost file-btn">
              Import Single Invoice (JSON)
              <input type="file" accept="application/json" onChange={handleImportOne} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

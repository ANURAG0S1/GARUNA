import { useEffect, useState, type FormEvent } from "react";
import type { Client } from "../lib/types";
import { createClient, deleteClient, getClients, updateClient } from "../lib/storage";
import { formatDateForDisplay } from "../lib/format";
import { ConfirmModal } from "../components/ConfirmModal";
import { useToast } from "../components/Toast";

type ClientDraft = Omit<Client, "id" | "createdAt" | "updatedAt">;

function blankDraft(): ClientDraft {
  return { name: "", address: "", phone: "", email: "", notes: "" };
}

export function Clients() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null); // null while creating, "" when the form is closed
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<ClientDraft>(blankDraft());
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    getClients()
      .then((list) => {
        setClients(list);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const openNewForm = () => {
    setEditingId(null);
    setDraft(blankDraft());
    setFormOpen(true);
  };

  const openEditForm = (client: Client) => {
    setEditingId(client.id);
    setDraft({ name: client.name, address: client.address, phone: client.phone, email: client.email, notes: client.notes });
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    if (!draft.name.trim()) {
      showToast("Client name is required");
      return;
    }
    setSaving(true);
    const op = editingId ? updateClient(editingId, draft) : createClient(draft);
    op
      .then((saved) => {
        showToast(editingId ? `Updated ${saved.name}` : `Added ${saved.name}`);
        setFormOpen(false);
        refresh();
      })
      .catch((err) => showToast(err.message))
      .finally(() => setSaving(false));
  };

  const handleDeleteConfirmed = () => {
    if (!confirmDeleteId) return;
    deleteClient(confirmDeleteId)
      .then(() => {
        setConfirmDeleteId(null);
        refresh();
        showToast("Client deleted");
      })
      .catch((err) => showToast(err.message));
  };

  return (
    <div className="page clients-page">
      <div className="page-header">
        <h1>Clients</h1>
        <button className="btn btn-primary" onClick={openNewForm}>
          + Add Client
        </button>
      </div>

      {error && <div className="empty-state">Couldn't reach the server: {error}. Is `npm run server` running?</div>}

      {!error && formOpen && (
        <form className="form-card" style={{ marginBottom: 20 }} onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit Client" : "New Client"}</h2>
          <div className="field-row">
            <div className="field">
              <label>Client Name *</label>
              <input
                type="text"
                autoFocus
                value={draft.name}
                onChange={(evt) => setDraft((prev) => ({ ...prev, name: evt.target.value }))}
              />
            </div>
          </div>
          <div className="field">
            <label>Address</label>
            <textarea value={draft.address} onChange={(evt) => setDraft((prev) => ({ ...prev, address: evt.target.value }))} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Phone</label>
              <input type="text" value={draft.phone} onChange={(evt) => setDraft((prev) => ({ ...prev, phone: evt.target.value }))} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="text" value={draft.email} onChange={(evt) => setDraft((prev) => ({ ...prev, email: evt.target.value }))} />
            </div>
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea
              placeholder="Internal notes about this client (not shown on invoices)"
              value={draft.notes}
              onChange={(evt) => setDraft((prev) => ({ ...prev, notes: evt.target.value }))}
            />
          </div>
          <div className="btn-row">
            <button type="button" className="btn btn-ghost" onClick={closeForm}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Client"}
            </button>
          </div>
        </form>
      )}

      {!error &&
        (loading ? (
          <div className="empty-state">Loading...</div>
        ) : clients.length === 0 ? (
          <div className="empty-state">No clients yet. Add one to reuse it on future invoices.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <td>Name</td>
                <td>Contact</td>
                <td>Added</td>
                <td />
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>
                    {client.phone && <div>{client.phone}</div>}
                    {client.email && <div className="t-gray">{client.email}</div>}
                    {!client.phone && !client.email && <span className="t-gray">--</span>}
                  </td>
                  <td>{formatDateForDisplay(new Date(client.createdAt).toISOString().slice(0, 10))}</td>
                  <td className="row-actions">
                    <button className="btn-icon" title="Edit" onClick={() => openEditForm(client)}>
                      ✎
                    </button>
                    <button className="btn-icon" title="Delete" onClick={() => setConfirmDeleteId(client.id)}>
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Delete client?"
        message="Invoices already billed to this client keep their details, but you won't be able to pick them from the dropdown anymore."
        danger
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
}

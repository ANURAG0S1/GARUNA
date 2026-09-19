import { useEffect, useState } from "react";
import type { CurrencySymbol } from "../lib/types";

interface ExchangeRateModalProps {
  open: boolean;
  currency: CurrencySymbol;
  initialValue: number;
  onSubmit: (rate: number) => void;
  onCancel: () => void;
}

/**
 * Fallback shown only when the automatic exchange-rate lookup fails (no
 * internet, the rate API is down, etc). Lets the user type in today's rate
 * by hand so the invoice can still show an INR equivalent.
 */
export function ExchangeRateModal({ open, currency, initialValue, onSubmit, onCancel }: ExchangeRateModalProps) {
  const [value, setValue] = useState(String(initialValue || ""));

  useEffect(() => {
    if (open) setValue(String(initialValue || ""));
  }, [open, initialValue]);

  if (!open) return null;

  const handleSubmit = () => {
    const parsed = parseFloat(value);
    if (!parsed || parsed <= 0) return;
    onSubmit(parsed);
  };

  return (
    <div className="modal-backdrop noprint" onClick={onCancel}>
      <div className="modal-box" onClick={(evt) => evt.stopPropagation()}>
        <h3>Couldn't fetch the exchange rate</h3>
        <p>
          We couldn't reach the exchange rate service automatically. Enter today's {currency} → INR rate to show
          the INR equivalent on this invoice (or cancel to leave it off).
        </p>
        <div className="field" style={{ marginBottom: 18 }}>
          <label>1 {currency} = ? INR</label>
          <input
            type="number"
            min={0}
            step={0.01}
            autoFocus
            value={value}
            onChange={(evt) => setValue(evt.target.value)}
            onKeyDown={(evt) => evt.key === "Enter" && handleSubmit()}
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Skip
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Use This Rate
          </button>
        </div>
      </div>
    </div>
  );
}

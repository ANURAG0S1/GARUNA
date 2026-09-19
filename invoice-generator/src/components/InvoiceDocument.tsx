import { Fragment } from "react";
import type { Invoice } from "../lib/types";
import { computeTotals, effectiveStatus } from "../lib/storage";
import { formatDateForDisplay, formatMoney } from "../lib/format";
import { StatusBadge } from "./StatusBadge";

/**
 * The printable invoice. Its visual design is deliberately unchanged from
 * the original static template: same class names, layout, fonts and
 * colors (see index.css for the untouched .main / .header / .bank-details
 * rules etc). It is purely presentational.
 */
function MultiLine({ text }: { text: string }) {
  const lines = (text || "").split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const totals = computeTotals(invoice);
  const status = effectiveStatus(invoice);

  return (
    <section className="main p-10 p-hr-4">
      <div className="header d-flex p-hr-3 p-vr-4">
        <div className="my-address">
          <div className="p-20" />
          {invoice.from.logo ? (
            <img className="logo-img" src={invoice.from.logo} alt="logo" />
          ) : (
            <h1 className="logo f-m accent">{invoice.from.name || "Your Business"}</h1>
          )}
          <b>{invoice.from.contact}</b>
          <br />
          <MultiLine text={invoice.from.address} />
          <br />
          {invoice.from.phone}
          {invoice.from.email && <div className="t-gray">{invoice.from.email}</div>}
        </div>
        <div>
          <h1 className="f-l t-gray">INVOICE</h1>
          <div style={{ textAlign: "right" }}>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      <div className="d-flex w-100 p-hr-3 p-vr-4">
        <div>
          <b className="bold">BILL TO:</b>
          <br />
          {invoice.to.name}
          <br />
          <MultiLine text={invoice.to.address} />
          <br />
          {invoice.to.phone && (
            <>
              <b>Tel : </b>
              {invoice.to.phone}
              <br />
            </>
          )}
          {invoice.to.email && (
            <>
              <b>Email : </b>
              {invoice.to.email}
            </>
          )}
        </div>
        <div>
          <b className="bold">INVOICE NO : </b> {invoice.invoiceNumber}
          <br />
          <b className="bold">INVOICE DATE : </b> {formatDateForDisplay(invoice.invoiceDate)}
          <br />
          <b className="bold">DUE DATE : </b> {formatDateForDisplay(invoice.dueDate)}
        </div>
      </div>

      <div className="m-hr-3">
        <table className="w-100">
          <thead>
            <tr>
              <td>Item / Task</td>
              <td style={{ textAlign: "right" }}>Amount</td>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.desc}</td>
                <td style={{ textAlign: "right" }}>
                  {invoice.currency}
                  {formatMoney(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ textAlign: "right" }}>
                <b>Subtotal</b>
              </td>
              <td style={{ textAlign: "right" }}>
                <b>
                  {invoice.currency}
                  {formatMoney(totals.subtotal)}
                </b>
              </td>
            </tr>
            {invoice.discountPercent > 0 && (
              <tr>
                <td style={{ textAlign: "right" }}>
                  Discount ({invoice.discountPercent}%)
                </td>
                <td style={{ textAlign: "right" }}>
                  - {invoice.currency}
                  {formatMoney(totals.discountAmt)}
                </td>
              </tr>
            )}
            {invoice.taxPercent > 0 && (
              <tr>
                <td style={{ textAlign: "right" }}>
                  Tax ({invoice.taxPercent}%)
                </td>
                <td style={{ textAlign: "right" }}>
                  {invoice.currency}
                  {formatMoney(totals.taxAmt)}
                </td>
              </tr>
            )}
            <tr>
              <td style={{ textAlign: "right" }}>
                <b>Total</b>
              </td>
              <td style={{ textAlign: "right" }}>
                <b>
                  {invoice.currency}
                  {formatMoney(totals.total)}
                </b>
              </td>
            </tr>
            {invoice.currency !== "₹" && invoice.fxRate > 0 && (
              <tr>
                <td style={{ textAlign: "right" }}>
                  <b>Total (in INR as of {formatDateForDisplay(invoice.invoiceDate)})</b>
                </td>
                <td style={{ textAlign: "right" }}>
                  <b>₹ {formatMoney(totals.inrEquivalent)}</b>
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      <div className="d-flex w-100 p-hr-3">
        <div />
        <div className="p-vr-3">
          <b>Total money to be paid : </b>
          {invoice.currency !== "₹" && invoice.fxRate > 0 ? (
            <span className="accent">
              ₹ {formatMoney(totals.inrEquivalent)} <span className="t-gray">/only</span>
            </span>
          ) : (
            <span className="accent">
              {invoice.currency}
              {formatMoney(totals.total)} <span className="t-gray">/only</span>
            </span>
          )}
        </div>
      </div>

      <div className="bank-details p-hr-3 p-vr-4">
        <b className="bold">RECEIVER BANK DETAILS:</b>
        <br />
        <b>Name:</b> {invoice.bank.name || "--"}
        <br />
        <b>Bank Name:</b> {invoice.bank.bank || "--"}
        <br />
        <b>A/c No.:</b> {invoice.bank.acc || "--"}
        <br />
        <b>IFSC Code:</b> {invoice.bank.ifsc || "--"}
        <br />
        <b>Home Branch:</b> {invoice.bank.branch || "--"}
      </div>
    </section>
  );
}

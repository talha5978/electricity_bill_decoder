import { useState } from "react";
import type { ExtractedBill } from "../lib/schemas/bill";
import { formatRupees, reconcileBill } from "../lib/bill/reconcile";
import { Button } from "./ui/button";

type BillReviewProps = {
  bill: ExtractedBill;
  imageUrl: string;
  unverified: boolean;
  onBillChange: (bill: ExtractedBill) => void;
  onRetake: () => void;
  onContinueAnyway: () => void;
};

const TEXT_FIELDS = [
  ["billingMonth", "Billing month"],
  ["disco", "Electricity company"],
  ["consumerCategory", "Consumer category"],
  ["tariffCode", "Tariff code"],
] as const;

export function BillReview({ bill, imageUrl, unverified, onBillChange, onRetake, onContinueAnyway }: BillReviewProps) {
  const [zoom, setZoom] = useState(false);
  const reconciliation = reconcileBill(bill);
  // The active demo tariff code and its dated source snapshot are not yet verified.
  const hasVerifiedTariffSnapshot = false;
  const unsupported = !hasVerifiedTariffSnapshot || bill.disco?.toLowerCase().includes("mepco") !== true || !bill.tariffCode || !bill.consumerCategory;

  function setTextField(key: (typeof TEXT_FIELDS)[number][0], value: string) {
    onBillChange({ ...bill, [key]: value.trim() ? value : null });
  }

  function setNumberField(key: "previousReading" | "currentReading" | "unitsConsumed", raw: string) {
    const value = raw === "" ? null : Number(raw);
    if (value !== null && (!Number.isFinite(value) || value < 0)) return;
    onBillChange({ ...bill, [key]: value });
  }

  return (
    <section className="mt-8" aria-labelledby="review-heading">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Review your bill</p>
        <h2 id="review-heading" className="mt-2 text-2xl font-semibold tracking-tight">Check the reading against your photo</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Correct anything that doesn’t match the paper. Changes are checked on this device.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="h-fit rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center justify-between px-2 pb-3 pt-1">
            <p className="text-sm font-semibold">Bill photo</p>
            <button type="button" onClick={() => setZoom(true)} className="min-h-10 px-2 text-sm font-semibold text-primary">Zoom photo</button>
          </div>
          <img src={imageUrl} alt="The bill photo used to extract the displayed fields" className="max-h-[70vh] w-full rounded-xl bg-[#efefe9] object-contain" />
          <p className="px-2 pb-1 pt-3 text-xs leading-5 text-muted-foreground">Field confidence is based on the model’s read. Always compare values to the printed bill.</p>
        </div>

        <div className="space-y-4">
          <ReconciliationBanner status={reconciliation.status} sumPaisa={reconciliation.sumPaisa} totalPaisa={bill.totalPayablePaisa} differencePaisa={reconciliation.differencePaisa} />
          {unsupported ? (
            <div className="rounded-xl border border-[#e7d7aa] bg-[#fbf4df] px-4 py-3 text-sm leading-6 text-[#5c4a1c]" role="status">
              <p className="font-semibold">This tariff isn’t supported yet.</p>
              <p>We need to verify this bill’s MEPCO residential category and code against a published tariff before showing a calculation.</p>
            </div>
          ) : null}
          {unverified ? <p className="rounded-xl bg-[#fbf4df] px-4 py-3 text-sm text-[#5c4a1c]">Unverified: the bill total did not reconcile. Any later tariff insight may be off.</p> : null}

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {TEXT_FIELDS.map(([key, label]) => (
                <Field key={key} bill={bill} name={key} label={label} value={bill[key] ?? ""} confidence={bill.confidence[key]} onChange={(value) => setTextField(key, value)} />
              ))}
              <NumberField label="Previous reading" value={bill.previousReading} confidence={bill.confidence.previousReading} onChange={(raw) => setNumberField("previousReading", raw)} />
              <NumberField label="Current reading" value={bill.currentReading} confidence={bill.confidence.currentReading} onChange={(raw) => setNumberField("currentReading", raw)} />
              <NumberField label="Units consumed" value={bill.unitsConsumed} confidence={bill.confidence.unitsConsumed} onChange={(raw) => setNumberField("unitsConsumed", raw)} suffix="units" />
              <MoneyField label="Total payable" paisa={bill.totalPayablePaisa} confidence={bill.confidence.totalPayablePaisa} onChange={(value) => onBillChange({ ...bill, totalPayablePaisa: value })} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div><h3 className="font-semibold">Bill line items</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Only checked rows are added in the reconciliation.</p></div>
              <button type="button" onClick={() => onBillChange({ ...bill, charges: [...bill.charges, { id: crypto.randomUUID(), label: "", amountPaisa: null, kind: "other", includedInTotal: true }] })} className="min-h-10 shrink-0 rounded-lg border border-border px-3 text-sm font-semibold text-primary">Add item</button>
            </div>
            {bill.charges.length ? (
              <div className="space-y-3">
                {bill.charges.map((charge, index) => (
                  <div key={charge.id} className={`grid gap-3 rounded-xl border p-3 sm:grid-cols-[1fr_150px_auto] ${charge.amountPaisa === null ? "border-[#e7d7aa] bg-[#fbf8ed]" : "border-border"}`}>
                    <label className="block text-xs font-medium text-muted-foreground">Charge name
                      <input value={charge.label} onChange={(event) => onBillChange({ ...bill, charges: bill.charges.map((item, i) => i === index ? { ...item, label: event.target.value } : item) })} className="mt-1 min-h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground" aria-label={`Charge ${index + 1} name`} />
                      {charge.amountPaisa === null || bill.confidence[`charges.${index}`] === "check" ? <span className="mt-1 block text-xs font-semibold text-[#856413]">Check this one</span> : null}
                    </label>
                    <AmountInput label="Amount (Rs.)" value={charge.amountPaisa} onChange={(amountPaisa) => onBillChange({ ...bill, charges: bill.charges.map((item, i) => i === index ? { ...item, amountPaisa } : item) })} ariaLabel={`${charge.label || `Charge ${index + 1}`} amount in rupees`} />
                    <div className="flex items-end justify-between gap-2 sm:flex-col sm:items-end sm:justify-center">
                      <label className="block text-xs font-medium text-muted-foreground">Type
                        <select value={charge.kind} onChange={(event) => onBillChange({ ...bill, charges: bill.charges.map((item, i) => i === index ? { ...item, kind: event.target.value as typeof item.kind } : item) })} className="mt-1 min-h-10 rounded-lg border border-border bg-white px-2 text-xs text-foreground" aria-label={`${charge.label || `Charge ${index + 1}`} type`}>
                          <option value="energy">Energy</option><option value="tax">Tax</option><option value="adjustment">Adjustment</option><option value="arrears">Arrears</option><option value="other">Other</option>
                        </select>
                      </label>
                      <label className="inline-flex min-h-11 items-center gap-2 text-xs font-medium text-muted-foreground"><input type="checkbox" checked={charge.includedInTotal} onChange={(event) => onBillChange({ ...bill, charges: bill.charges.map((item, i) => i === index ? { ...item, includedInTotal: event.target.checked } : item) })} className="size-4 accent-[#245a43]" /> Add to total</label>
                      <button type="button" onClick={() => onBillChange({ ...bill, charges: bill.charges.filter((item) => item.id !== charge.id) })} className="min-h-10 px-2 text-xs font-semibold text-[#8f3c31]">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="rounded-lg bg-muted px-3 py-4 text-sm text-muted-foreground">No itemized charges were read. Add the printed amounts to check the total.</p>}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={onRetake}>Retake photo</Button>
            {reconciliation.status === "mismatch" ? <Button variant="secondary" onClick={onContinueAnyway}>Continue anyway · unverified</Button> : null}
            {reconciliation.status === "match" && !unsupported ? <Button disabled title="A verified tariff snapshot is needed before calculation can be enabled">Looks right, calculate</Button> : null}
          </div>
          {reconciliation.status === "match" && !unsupported ? <p className="text-xs leading-5 text-muted-foreground">The numbers match. Calculation will be enabled when the supported MEPCO tariff snapshot is verified.</p> : null}
        </div>
      </div>

      {zoom ? <div role="dialog" aria-modal="true" aria-label="Zoomed bill photo" onClick={() => setZoom(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"><button autoFocus type="button" onClick={() => setZoom(false)} className="absolute right-4 top-4 min-h-12 rounded-xl bg-white px-4 font-semibold text-foreground">Close photo</button><img src={imageUrl} alt="Zoomed electricity bill" onClick={(event) => event.stopPropagation()} className="max-h-[90vh] max-w-full object-contain" /></div> : null}
    </section>
  );
}

function Field({ bill, name, label, value, confidence, onChange }: { bill: ExtractedBill; name: string; label: string; value: string; confidence?: string; onChange: (value: string) => void }) {
  const region = bill.regions?.[name];
  return <label className="block text-xs font-medium text-muted-foreground">{label}
    <input value={value} onChange={(event) => onChange(event.target.value)} className={`mt-1 min-h-11 w-full rounded-lg border bg-white px-3 text-sm text-foreground ${confidence === "check" || confidence === "unreadable" || !value ? "border-[#d7bb69]" : "border-border"}`} />
    {confidence === "check" || confidence === "unreadable" || !value ? <span className="mt-1 block text-xs font-semibold text-[#856413]">Check this one</span> : null}
    {region ? <span className="mt-1 block text-[11px] text-muted-foreground">Reader supplied a source location; compare it with the photo.</span> : null}
  </label>;
}

function NumberField({ label, value, confidence, suffix, onChange }: { label: string; value: number | null; confidence?: string; suffix?: string; onChange: (value: string) => void }) {
  return <label className="block text-xs font-medium text-muted-foreground">{label}
    <span className="mt-1 flex min-h-11 items-center rounded-lg border border-border bg-white pr-3 focus-within:ring-2 focus-within:ring-primary"><input type="number" min="0" step="any" value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-lg bg-transparent px-3 text-sm tabular-nums text-foreground outline-none" />{suffix ? <span className="text-xs">{suffix}</span> : null}</span>
    {confidence === "check" || confidence === "unreadable" || value === null ? <span className="mt-1 block text-xs font-semibold text-[#856413]">Check this one</span> : null}
  </label>;
}

function AmountInput({ label, value, onChange, ariaLabel }: { label: string; value: number | null; onChange: (paisa: number | null) => void; ariaLabel: string }) {
  const [draft, setDraft] = useState(value === null ? "" : (value / 100).toFixed(2));
  return <label className="block text-xs font-medium text-muted-foreground">{label}
    <input inputMode="decimal" value={draft} onChange={(event) => { const raw = event.target.value; setDraft(raw); if (raw.trim() === "") return onChange(null); if (/^\d*(?:\.\d{0,2})?$/.test(raw)) { const amount = Math.round(Number(raw) * 100); if (Number.isSafeInteger(amount) && amount >= 0) onChange(amount); } }} className="mt-1 min-h-11 w-full rounded-lg border border-border bg-white px-3 text-right text-sm tabular-nums text-foreground" aria-label={ariaLabel} />
  </label>;
}

function MoneyField({ label, paisa, confidence, onChange }: { label: string; paisa: number | null; confidence?: string; onChange: (paisa: number | null) => void }) {
  const [draft, setDraft] = useState(paisa === null ? "" : (paisa / 100).toFixed(2));
  return <label className="block text-xs font-medium text-muted-foreground">{label} (Rs.)
    <input inputMode="decimal" value={draft} onChange={(event) => { const raw = event.target.value; setDraft(raw); if (raw === "") return onChange(null); if (/^\d*(?:\.\d{0,2})?$/.test(raw)) { const amount = Math.round(Number(raw) * 100); if (Number.isSafeInteger(amount)) onChange(amount); } }} className="mt-1 min-h-11 w-full rounded-lg border border-border bg-white px-3 text-right text-sm tabular-nums text-foreground" />
    {confidence === "check" || confidence === "unreadable" || paisa === null ? <span className="mt-1 block text-xs font-semibold text-[#856413]">Check this one</span> : null}
  </label>;
}

function ReconciliationBanner({ status, sumPaisa, totalPaisa, differencePaisa }: { status: "incomplete" | "match" | "mismatch"; sumPaisa: number | null; totalPaisa: number | null; differencePaisa: number | null }) {
  if (status === "match" && sumPaisa !== null) return <div className="rounded-xl border border-[#c6d9c9] bg-[#edf5ee] px-4 py-3 text-sm leading-6 text-[#245a43]" role="status"><p className="font-semibold">Numbers match ✓</p><p>Line items add up to {formatRupees(sumPaisa)}, the same as the bill’s total.</p></div>;
  if (status === "mismatch" && sumPaisa !== null && totalPaisa !== null && differencePaisa !== null) return <div className="rounded-xl border border-[#e5beb7] bg-[#fbefec] px-4 py-3 text-sm leading-6 text-[#8f3c31]" role="alert"><p className="font-semibold">These numbers don’t match</p><p>Line items add up to {formatRupees(sumPaisa)}, but the bill total is {formatRupees(totalPaisa)} (difference: {formatRupees(Math.abs(differencePaisa))}). Check the line items and total.</p></div>;
  return <div className="rounded-xl border border-[#e7d7aa] bg-[#fbf4df] px-4 py-3 text-sm leading-6 text-[#5c4a1c]" role="status"><p className="font-semibold">Add the missing amounts to check the total</p><p>At least one amount needed for the sum could not be read.</p></div>;
}

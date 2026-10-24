import type { ExtractedBill } from "../schemas/bill";

export type Reconciliation =
  | { status: "incomplete"; sumPaisa: number | null; differencePaisa: null }
  | { status: "match"; sumPaisa: number; differencePaisa: 0 }
  | { status: "mismatch"; sumPaisa: number; differencePaisa: number };

export function reconcileBill(bill: ExtractedBill): Reconciliation {
  if (
    bill.totalPayablePaisa === null ||
    bill.charges.some((charge) => charge.includedInTotal && charge.amountPaisa === null)
  ) {
    return { status: "incomplete", sumPaisa: null, differencePaisa: null };
  }

  const included = bill.charges.filter((charge) => charge.includedInTotal);
  const sumPaisa = included.reduce((sum, charge) => sum + (charge.amountPaisa ?? 0), 0);
  const differencePaisa = sumPaisa - bill.totalPayablePaisa;

  return differencePaisa === 0
    ? { status: "match", sumPaisa, differencePaisa: 0 }
    : { status: "mismatch", sumPaisa, differencePaisa };
}

export function formatRupees(paisa: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: paisa % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(paisa / 100);
}

import { z } from "zod";

const nullableText = z.string().trim().max(120).nullable();
const nullableCount = z.number().finite().nonnegative().nullable();

export const billFieldNames = [
  "disco",
  "consumerCategory",
  "tariffCode",
  "billingMonth",
  "previousReading",
  "currentReading",
  "unitsConsumed",
  "totalPayablePaisa",
] as const;

export const BillChargeSchema = z.object({
  id: z.string().min(1).max(60),
  label: z.string().trim().min(1).max(100),
  amountPaisa: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(),
  kind: z.enum(["energy", "tax", "adjustment", "arrears", "other"]),
  includedInTotal: z.boolean(),
});

const ConfidenceSchema = z.enum(["clear", "check", "unreadable"]);

export const ExtractedBillSchema = z.object({
  disco: nullableText.default(null),
  consumerCategory: nullableText.default(null),
  tariffCode: nullableText.default(null),
  billingMonth: nullableText.default(null),
  previousReading: nullableCount.default(null),
  currentReading: nullableCount.default(null),
  unitsConsumed: nullableCount.default(null),
  charges: z.array(BillChargeSchema).max(30).default([]),
  totalPayablePaisa: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable().default(null),
  confidence: z.record(z.string(), ConfidenceSchema).default({}),
  regions: z.record(
    z.string(),
    z.object({
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
      width: z.number().min(0).max(1),
      height: z.number().min(0).max(1),
    }),
  ).optional(),
});

export type ExtractedBill = z.infer<typeof ExtractedBillSchema>;
export type BillCharge = z.infer<typeof BillChargeSchema>;

export function clampBillRegions(bill: ExtractedBill): ExtractedBill {
  if (!bill.regions) return bill;
  const regions = Object.fromEntries(
    Object.entries(bill.regions).map(([key, region]) => {
      const x = Math.min(region.x, 1);
      const y = Math.min(region.y, 1);
      return [key, {
        x,
        y,
        width: Math.max(0, Math.min(region.width, 1 - x)),
        height: Math.max(0, Math.min(region.height, 1 - y)),
      }];
    }),
  );
  return { ...bill, regions };
}

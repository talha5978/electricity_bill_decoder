---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. Select and preview a bill photo locally**
  Becomes usable: The app starts locally, shows the single-screen MEPCO promise, and lets someone select a bill photo, preview it, and retake/cancel it without sending anything.
  Why now: Bootstrapping belongs with a real user behavior. This establishes the photo-consent boundary and lets the learner shape the visual direction before model work begins.
  PRD ref: `prd.md > The Core Journey` (steps 1–2), `prd.md > Landing screen`, `prd.md > Bill selection and consent`.
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Look and Feel`, `spec.md > Home and photo selection`.
  Build: Use the existing React Router scaffold; configure shadcn/ui on the existing Tailwind setup; build the responsive paper-like landing and local photo preview; support camera/file/drop input, validation, sample entry point, retake/cancel, explain that a later explicit confirmation will send the image to the AI service, and clean up object URLs. Do not add a confirmation control until it actually sends the photo in slice 2.
  Verify (mechanical): Run the starter's TypeScript check and production build; start the local server and confirm the route loads without browser/server errors.
  Learner check: Open the app, choose a photo, confirm it appears in preview without leaving the device, then retake/cancel and check the home screen returns.
  Commit: `Build bill upload and consent preview`

- [ ] **2. Read, reconcile, and review the bill**
  Becomes usable: Confirming a photo starts the two-step progress view, server-side AI extraction, local reconciliation, and an editable review with the photo beside its fields.
  Why now: This proves the unique kernel early: the model reads, a person checks, and deterministic code reconciles. It also tests the unfamiliar AI API before spending effort on result visuals.
  PRD ref: `prd.md > The Core Journey` (steps 4–5), `prd.md > Preview and progress`, `prd.md > Review screen`, `prd.md > Extraction, reconciliation, and review`, `prd.md > States and Boundaries`.
  Spec ref: `spec.md > Extraction action and model adapter`, `spec.md > Review and reconciliation`, `spec.md > Data Model`, `spec.md > External Services and Dependencies`, `spec.md > Important Failure Modes`.
  Build: Add the React Router `analyze` action and `bill-reader.server.ts`; validate upload and model JSON with Zod; keep Cloudflare credentials server-only; return plain retryable errors; show extraction/reconciliation progress; make fields editable with live local sum checking, uncertainty/region cues, unsupported-bill handling, and explicit unverified continuation. Keep the photo and extracted values session-only. Exercise the saved sample fallback only after the real-format redacted sample is available.
  Verify (mechanical): Run the TypeScript check and production build; with local Cloudflare credentials configured, submit a redacted bill image and confirm the action returns schema-valid fields without exposing credentials or logging bill contents; edit a charge and confirm reconciliation changes locally.
  Learner check: Confirm a bill image, follow the progress steps, compare the returned fields to the photo, and change one charge to see the match/mismatch state update.
  Commit: `Add bill extraction and review checks`

- [ ] **3. Calculate and demonstrate the supported tariff**
  Becomes usable: A supported active MEPCO residential bill produces a sourced slab insight, charge breakdown, and slider whose live rupee savings come only from deterministic TypeScript calculation.
  Why now: The calculator depends on a confirmed code, category, bill charge structure, and dated tariff snapshot. It follows review so calculation never runs before confirmation.
  PRD ref: `prd.md > The Core Journey` (steps 6–8), `prd.md > Results screen`, `prd.md > Tariff insight and savings`, `prd.md > Sample bill`, `prd.md > Privacy and Trust`.
  Spec ref: `spec.md > Tariff calculator and results`, `spec.md > Sample bill and fallback`, `spec.md > Data Model`, `spec.md > External Services and Dependencies`, `spec.md > Important Failure Modes`.
  Build: First verify the active bill’s MEPCO residential code/category and obtain the applicable published NEPRA/MEPCO tariff. Record the source, effective date, thresholds, rates, relevant adjustments, and rounding in the single tariff JSON. Implement pure `calculateBill()` only from those verified rules; gate unsupported or unresolved codes. Add post-review confirmation, slab/marginal-rate callout, breakdown chart, live slider, plain-language tips, persistent unverified state, and the redacted near-threshold sample with labeled fallback.
  Verify (mechanical): Run the TypeScript check and production build; manually compare the supported-code calculation and a threshold-crossing slider result with the recorded source tariff and a known bill, including the reconciliation and rounding behavior.
  Learner check: Confirm the supported sample, inspect its source values and tariff source, then drag usage below the threshold and check the displayed total/saving changes.
  Commit: `Add verified MEPCO tariff results`

## Hands-on Checkpoints

- [x] Early usable behavior explored — learner confirmed photo selection/cancellation works and asked for the photo-processing flow next.
- [ ] Final kick-the-tires exploration and feedback completed — after slice 3, try the real/sample journey, an unclear or mismatched bill, and the slider; report anything confusing or broken.

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route through the confirmed-photo action, the `.server.ts` provider call, and the pure tariff function.
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions

- Moved the actual photo-confirmation control into slice 2 with the extraction action — slice 1 should not show a confirm button that cannot yet perform the disclosed AI transfer; the final user journey is unchanged.

---
doc: spec
status: approved
---

# Bijli Bill Decoder — Technical Spec

## How This Works, In Plain Language

This is one React Router application. The browser holds the selected bill photo and the values being reviewed. When the user confirms the photo, a React Router route `action()` receives it and calls the vision model. The action is server code, so the Cloudflare secret stays out of the browser. There is no separate Express server, database, account, or bill-history service.

The model reads the paper and returns candidate fields. Zod checks that the response has the right shape; it does not prove the model read the paper correctly. The person compares those fields with the visible photo. Plain TypeScript arithmetic checks that charges reconcile. Only after the person confirms the review does the tariff calculator run. The model never calculates a displayed rupee amount.

This shape matches the user’s existing React Router service pattern and avoids adding a second application to deploy or debug. It keeps the important trust boundaries visible: model reads, a person confirms, code calculates.

## The Core Journey Through the System

1. The home route lets the user take/select a photo or choose the bundled sample. The selected photo stays in browser memory and is previewed before any request.
2. Confirming the preview sends the image to the app’s `action()` route. The button and nearby copy disclose that the image is being sent to an AI service. Cancel aborts the request and clears the local preview.
3. The server action validates the upload, calls Cloudflare Workers AI, validates the extracted result with Zod, and returns only the structured fields and uncertainty/region metadata. The browser advances its two progress steps: reading, then local reconciliation.
4. Review shows the bill image beside editable extracted values. It highlights uncertain fields and the relevant photo regions where coordinates are available. Reconciliation re-runs in the browser as fields change. Unsupported MEPCO/category/tariff values stop here.
5. A matching total enables “Looks right, calculate.” A mismatch can be corrected, retried, or explicitly continued as unverified. Only a review confirmation calls the deterministic tariff function.
6. Results show the tariff insight, breakdown, and a slider. The slider runs the same deterministic calculator for hypothetical usage; it does not call the AI service. Editing bill values returns to review and requires confirmation again.
7. Reset, cancel, route departure, or closing the app clears the photo and bill fields from the app’s in-memory state. The app does not persist bill data.

PRD ref: `prd.md > The Core Journey`, `prd.md > Privacy and Trust`, `prd.md > States and Boundaries`.

## Stack

- **TypeScript + React Router Framework Mode** — requested stack; loaders/actions and server-only modules keep UI and server work in one application. React Router docs: [Framework installation](https://reactrouter.com/start/framework/installation), [actions](https://reactrouter.com/start/framework/actions), [.server modules](https://reactrouter.com/api/framework-conventions/server-modules).
- **Tailwind CSS + shadcn/ui** — requested styling system and accessible primitives. Start from the [React Router setup guide](https://ui.shadcn.com/docs/installation/react-router); the chosen React Router starter must be checked during build so Tailwind is configured once, not duplicated.
- **Zod** — validate untrusted model JSON at the server boundary and editable form values. The model response remains untrusted even after shape validation.
- **React state and React Router `useFetcher`** — enough for one in-flight extraction; no React Query cache is needed because bill data is intentionally session-only and there are no reusable server queries.
- **No separate Express service, Supabase, database, chart package, or tips-generation call.** Keep the single-route POC small; use a small custom SVG donut chart and deterministic, non-numeric tips so another AI request cannot introduce invented savings figures.

Dependency versions should come from the React Router starter and current shadcn CLI at build time; pin them in the generated lockfile. Do not independently upgrade the starter during the POC.

## Where It Runs and How Someone Tries It

The app runs locally in a browser with the React Router Node server. Scaffold it in the project root with the requested command:

```bash
npx create-react-router@latest .
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). For live extraction, configure `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` in an ignored local `.env` file. Keep both server-only; never prefix them with `VITE_`, return them from a loader, or commit them. The bundled sample still exercises the full journey if the AI key is not configured; in that case the app must label its saved extraction fallback clearly.

The project needs a short demo video and a public GitHub repository. A local run and recording are sufficient; deployment is optional. Before recording, use an active MEPCO residential bill whose supported tariff code and matching tariff snapshot have been verified. The March 2024 disconnected bill is not that bill.

## Look and Feel

Use a warm paper background, white document/result cards, charcoal text, and generous whitespace. Deep sage/green carries primary actions and reconciliation success; amber is reserved for the slab threshold; muted red is only for errors and mismatches. Use a clean sans-serif and tabular numerals for rupees and units. Make the slab callout and total the largest numbers. Keep the layout one column on a phone with large controls and readable daylight contrast.

Use the **Vintage Paper** direction as the starting point in [TweakCN’s theme editor](https://tweakcn.com/editor/theme), customized with the PRD’s restrained sage and amber accents. This is a design reference, not a dependency. Avoid dashboard chrome, gradients, and extra navigation.

Copy is plain and reassuring: “You’re 18 units past the cheaper rate,” not tariff jargon. On the upload confirmation, explicitly say the photo goes to an AI service to read it.

## Components

### Home and photo selection

One landing screen with the promised headline, one explanatory line, a drop/camera/file picker, “Try a sample bill,” and the MEPCO/privacy note. Validate image MIME type and size client-side for quick feedback, then repeat checks server-side. Use an object URL for preview and revoke it on replacement/reset/unmount.

PRD ref: `prd.md > Landing screen`, `prd.md > Photo selection and confirmation`.

### Preview and extraction progress

Keep the selected image visible while the two statuses run. The preview confirmation clearly discloses external AI processing. Submit with `useFetcher` to the extraction action so pending state, cancellation, and retry are explicit. A request abort returns to upload; after about 10 seconds show the delayed-progress sentence.

PRD ref: `prd.md > Preview and progress`, `prd.md > Photo selection and confirmation`.

### Extraction action and model adapter

`app/routes/analyze.ts` owns the `action()`. It accepts one multipart image only after user confirmation, validates a small allowlist of image types and a conservative upload-size cap (initially 8 MB), and calls `app/services/bill-reader.server.ts`. The server module owns Cloudflare auth, provider request/response parsing, timeout, and safe error mapping. It returns typed fields, per-field confidence/status, and optional normalized photo-region coordinates. Never log the request body, image, model prompt, extraction response, or personal fields.

The model prompt asks only for visible bill fields and an explicit unknown/null when unreadable. Require structured JSON where supported, but always parse and validate it with Zod; malformed or incomplete data is a recoverable extraction failure. Coordinates are untrusted and must be clamped to the 0–1 range. If a box is absent or dubious, mark the field for checking rather than claiming a precise highlight. The source field row itself remains highlighted when selected.

PRD ref: `prd.md > Extraction, reconciliation, and review`, `prd.md > Privacy and Trust`.

### Review and reconciliation

Present photo and fields together; stack them on mobile. Fields include month, DISCO, consumer category, tariff code, readings, units, itemized charges/taxes, arrears, and total payable. User-editable values are parsed as Pakistani rupee amounts/units without accepting `NaN`, negative units, or silently rounding fractional amounts. Keep the source representation and normalized numeric value together.

`reconcileBill()` is a pure local function that sums the configured bill line items and compares with the printed total at the precision shown on the bill. Show the computed amount, printed amount, and difference. Confirm the bill’s rounding/subtotal rules against the active demo bill before setting any tolerance; do not invent a tolerance. A mismatch highlights relevant values and offers correction, retake, or explicit “Continue anyway”; the latter marks every subsequent result unverified. Unsupported bills stop before tariff calculation.

PRD ref: `prd.md > Extraction, reconciliation, and review`, `prd.md > States and Boundaries`.

### Tariff calculator and results

`calculateBill()` is a pure TypeScript function fed by the user-confirmed bill values and the one supported dated JSON tariff snapshot. It returns a line-item result, applicable slab, marginal rates around the threshold, and a comparison for hypothetical usage. The slider calls this function locally on each change; it does not mutate the original bill. Results show source photo/fields, verified or unverified status, slab callout, custom SVG cost-breakdown donut, live slider, and 2–3 short practical tips. No displayed saving, charge, or rate is model-generated.

The calculator is intentionally not ready to claim real MEPCO correctness until an active demo bill establishes the exact supported code and a published source establishes the matching tariff snapshot. Until that is resolved, unsupported status is the safe behavior; do not fill in guessed rates or present a fabricated demo calculation.

PRD ref: `prd.md > Results`, `prd.md > Tariff calculation`, `prd.md > Scope boundary`.

### Sample bill and fallback

Bundle one real-format MEPCO residential bill with identifying details blurred/replaced, plus its fixed extracted-field JSON. It must use the same single supported tariff code and be selected near a verified threshold. “Try a sample bill” enters the same preview, confirm, progress, review, and results flow as a photo upload. If the provider/network fails for this sample only, load the bundled fixed extraction and show “Showing saved results for the sample bill.” It is never described as a live read. No real bill is bundled without redaction and permission.

PRD ref: `prd.md > Sample bill`, `prd.md > States and Boundaries`.

## Data Model

Use a Zod schema as the runtime contract, with a corresponding inferred TypeScript type. The conceptual bill shape:

```ts
type ExtractedBill = {
  disco: string | null;
  consumerCategory: string | null;
  tariffCode: string | null;
  billingMonth: string | null;
  previousReading: number | null;
  currentReading: number | null;
  unitsConsumed: number | null;
  charges: Array<{ id: string; label: string; amountPaisa: number; kind: "energy" | "tax" | "adjustment" | "arrears" | "other" }>;
  totalPayablePaisa: number | null;
  confidence: Record<string, "clear" | "check" | "unreadable">;
  regions?: Record<string, { x: number; y: number; width: number; height: number }>;
};
```

Store money in integer paisa internally; display rupees with `Intl.NumberFormat("en-PK")`. The final schema may retain source labels and additional bill fields needed for precise reconciliation. Confirm the real bill’s charge structure before finalizing the schema so line items neither double-count subtotals nor omit additions.

| Data | Origin and location | Updates and clearing |
| --- | --- | --- |
| Selected image | File picker/sample asset → browser memory/object URL | Replaced on retake; object URL revoked on reset, cancel, and departure. Uploaded only after preview confirmation. |
| Extracted/editable fields | Model response via route action, or sample fallback → browser memory | Edited locally; reconciliation recalculates on every edit. Cleared when the flow resets/leaves. |
| Reconciliation result | Pure browser arithmetic over current fields | Derived again on edits; not persisted or sent. |
| Tariff snapshot | Versioned, committed JSON data file | Read-only app data; includes source, effective date, category, and exact supported code. |
| Calculated result/slider value | Pure calculator after review confirmation | Recomputed on slider movement; discarded on reset/departure. |

No localStorage, cookies, server session, database, analytics event, or application logs contain bill contents. Server request memory is transient. The chosen AI provider processes the confirmed image under its service terms; Cloudflare’s current standard-inference policy says inputs/outputs are not retained after processing and are not used for model training, with exceptions for stateful features or content written to logs/storage. [Data usage policy](https://developers.cloudflare.com/workers-ai/platform/data-usage/).

## File Structure

```text
app/
├── root.tsx                         # document shell and global styles
├── routes.ts                        # home and analysis route registration
├── routes/
│   ├── home.tsx                     # upload, progress/review/results flow state
│   └── analyze.ts                   # server action for confirmed photo extraction
├── components/
│   ├── bill-upload.tsx              # drop/camera/file selection
│   ├── bill-preview.tsx             # image preview and consent disclosure
│   ├── extraction-progress.tsx      # two progress steps and failures
│   ├── bill-review.tsx              # editable fields and source comparison
│   ├── bill-photo.tsx               # zoom and optional region overlays
│   ├── bill-results.tsx             # callout, breakdown, slider and tips
│   ├── cost-breakdown-chart.tsx     # small SVG donut + accessible legend
│   └── ui/                          # only shadcn primitives actually used
├── services/
│   └── bill-reader.server.ts        # Cloudflare request; secret and provider logic
├── lib/
│   ├── schemas/bill.ts              # Zod extraction/editable-data schemas
│   ├── bill/reconcile.ts            # deterministic local sum check
│   ├── tariff/calculate.ts          # deterministic tariff and slider math
│   ├── tariff/mepco-residential.json # one sourced, dated tariff snapshot
│   └── money.ts                     # paisa parsing and display formatting
├── data/sample-bill.json            # fixed sample extraction fallback
└── styles/app.css                   # Tailwind theme tokens and global styles
public/
└── samples/sample-mepco-bill.jpg    # redacted bill image, added after verified sample chosen
devpost/
├── learner-profile.md
├── scope.md
├── prd.md
└── spec.md
.env.example                        # variable names only; no real credentials
```

Keep provider-specific code under `services/` following the learner’s existing service-module pattern. The `.server.ts` suffix ensures those credentials and provider dependencies are excluded from the browser bundle.

## External Services and Dependencies

### Cloudflare Workers AI (free vision quota)

- **Model:** `@cf/meta/llama-3.2-11b-vision-instruct`, a vision-capable model. Its license and acceptable-use policy must be accepted with an initial request before normal use. [Model docs](https://developers.cloudflare.com/workers-ai/models/llama-3.2-11b-vision-instruct/).
- **Call:** `POST https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct`; header `Authorization: Bearer {CLOUDFLARE_API_TOKEN}`; JSON body contains a concise extraction instruction and the confirmed bill image in the model’s documented vision message format. Do not send the image before preview consent. The response includes generated text; parse the JSON payload and run the Zod schema before returning anything to the browser. [REST/model usage](https://developers.cloudflare.com/workers-ai/models/llama-3.2-11b-vision-instruct/).
- **Secrets:** `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` exist only in server environment. Use a narrowly scoped token with the necessary Workers AI permission. Keep `.env` ignored; commit only `.env.example`.
- **Free limit:** Cloudflare currently lists 10,000 Neurons/day at no charge. Limits reset at 00:00 UTC; exceeding the free limit causes subsequent inference requests to fail unless the account is upgraded. The app must show a retry/sample fallback state rather than assume the model is always available. [Pricing and limits](https://developers.cloudflare.com/workers-ai/platform/pricing/).
- **No hidden paid path:** the app does not upgrade the account or silently switch to a paid provider. The model is billable above the free allocation on a paid plan, so keep the account on Free for the hackathon and treat quota exhaustion as a normal failure.
- **Privacy:** Cloudflare documents no training on Workers AI customer content and no retention after standard inference processing, subject to limited exceptions. The app still sends a user’s confirmed image to Cloudflare; user-facing copy must say this plainly. Avoid stateful features, AI Gateway content logging/caching, and request-body logs.
- **Limitation:** JSON shape validation cannot verify visual correctness. Confidence flags, editable review, reconciliation, and deterministic tariff math remain required.

No database, storage bucket, analytics, or other external service is part of this POC.

## Important Failure Modes

- **Unclear photo, invalid model output, provider timeout/quota/network failure** → stop extraction with a plain retry message; use the saved fallback only for the bundled sample and label it. Never claim saved sample fields were freshly read.
- **Arithmetic mismatch or unsupported tariff/category** → stay on review, show the amount and difference, permit edits/retake, or explicit unverified continuation for a mismatch; never calculate unsupported tariff rules.
- **Unverified tariff source or no active demo bill** → keep the calculation path gated; do not invent tariff rates or claim savings. Resolve the exact code, applicable protected status and tariff snapshot before a judge-facing calculation.

## What Was Simplified and Why

- **One React Router application with route actions** instead of an app plus separate Express service — follows the learner’s chosen Framework Mode and existing service pattern while retaining server-only secrets.
- **One model call for extraction** instead of asking an LLM to write tips or perform calculations — saves free quota and keeps every displayed number under deterministic code.
- **A hand-built SVG donut** instead of a charting package — the chart has only a few values and does not need animation or complex interactivity.
- **One code and one tariff snapshot** instead of supporting all MEPCO residential tariffs — protects the central calculation claim and fits the demo scope.
- **No persistence or account system** instead of bill history — protects privacy and avoids infrastructure unrelated to the one-session proof.

## Decisions and Open Issues

### Decisions

- **Learner choice — React Router Framework Mode, TypeScript, Tailwind and shadcn/ui:** use a single project with server `action()` handling confirmed-image extraction. The learner explicitly rejected a separate backend and cited their prior `app/services` pattern. Tradeoff accepted: the hosting/runtime must support React Router server routes for live extraction.
- **Learner choice — free AI quota only:** use Cloudflare Workers AI. Tradeoff: finite daily quota and provider onboarding; the sample’s fixed extraction fallback protects the demo, not live users.
- **Learner choice — no persisted bill data:** keep real image and fields transient and no application logs. Tradeoff: refreshing or leaving means starting again.
- **Implementation decision — local pure functions for reconciliation and tariffs:** keeps calculations testable and independent of model output; only user-confirmed values reach the tariff function.
- **Genuine uncertainty clarified:** whether the server code needed a separate Express service. The learner clarified that React Router route `action()` and `.server.ts` files can handle it; the spec uses that integrated server boundary.

### Must resolve before a correct live tariff demo

1. Obtain an active MEPCO residential bill and confirm its printed tariff code and consumer/protected category. The old March 2024 A-1b(03)T bill is disconnected and its feeder is marked “Industrial,” so it is not the supported demo tariff.
2. Find the tariff notification published by NEPRA or MEPCO that applies to that code and billing period. Record source URL, effective date, slab boundaries, rates, taxes/adjustments included in the calculator, and rounding rules in the tariff JSON. Have the values manually checked against the source and a known bill before showing savings as authoritative.
3. Redact the active sample’s name, address, consumer ID, and reference number; verify permission to bundle the image. Store its saved extraction beside it.
4. Verify Cloudflare account setup and exact vision-image payload format during the first build step; the model’s REST contract has image input, but account setup/license acceptance and quota are runtime prerequisites.

Until item 1 and 2 are complete, the app can be built through extraction and review, but the one-code calculator cannot be presented as a verified MEPCO calculation. This preserves the approved PRD’s trust claim instead of filling missing tariff data with guesses.

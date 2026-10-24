---
doc: scope
status: approved
---

# Bijli Bill Decoder

One line: A household uploads a MEPCO electricity bill and sees what the charges mean, where its usage sits in the tariff slab, and how a specific usage reduction changes the bill.

## The Unique Kernel
The vision model reads the bill; deterministic code calculates the tariff insight. The app shows the extracted fields beside the bill, checks that the line items reconcile to the printed total, and makes the marginal cost of crossing a slab visible. Every displayed number comes from the extracted bill fields or the calculator, not LLM-written advice.

## Who It's For
Ordinary MEPCO residential households, starting with the learner's family and possibly neighbors, who want to understand charges and what drives their bill.

## The Core Loop
Upload a bill photo; review the extracted fields and reconciliation; see a plain-language charge breakdown and the household's slab position; adjust usage with a slider to see the recalculated bill and potential saving; get 2–3 practical tips.

## Inspiration & Identity
Clear, trustworthy, and approachable for people who do not know tariff terminology. The bill itself should remain visible as evidence for the extracted numbers.

## Why This Matters to the Learner
The learner wants a small, focused hackathon project with practical impact that family and possibly neighbors may use. They also want to learn how to guide coding agents toward reliable applications.

## What "Working" Looks Like
In a one-minute demo, an active MEPCO residential bill is uploaded. Extracted units, consumer category, billing month, and total payable appear alongside the photo, with fields highlighted on it. The line items reconcile to the printed total, or the app asks the user to confirm fields if they do not. The app then shows a charge breakdown, clearly states the usage, distance past the tariff threshold, and marginal rate change, and lets the audience drag a slider to see the calculated bill fall when usage crosses below that threshold.

The calculation uses a deterministic TypeScript tariff function and a dated JSON tariff snapshot verified for the single residential tariff code printed on the active demo bill. The vision model only extracts structured fields; Zod validates them. Tips may be LLM-written, but no displayed numbers come from the LLM. The demo bill and tariff figures must be checked against the actual active bill and a published MEPCO/NEPRA tariff before presenting the calculation as correct.

## The POC Boundary
- MEPCO residential only, using one tariff code confirmed from an active demo bill and one dated tariff snapshot.
- One bill-photo upload flow, with source fields visible beside the photo, extraction review, line-item reconciliation, and a confirmation step on mismatch.
- A rupee breakdown, slab and marginal-rate insight, and a live usage slider that recalculates the bill and estimated saving.
- 2–3 practical tips; any numbers in tips or elsewhere must come from the deterministic calculator.
- A second sample bill may be kept as a demo fallback; it does not expand the supported tariff-code scope.

## Later
- Support for other MEPCO residential tariff codes, after verifying the corresponding tariff rules.
- Support for other DISCOs or non-residential consumers.
- A polished public launch beyond the hackathon demo.

## Explicitly Cut
- Treating the March 2024 A-1b(03)T bill as the confirmed demo tariff: its meter is permanently disconnected and its feeder says “Industrial,” so it is a field reference only.
- Letting a vision model or LLM calculate tariff charges or generate numbers shown as calculated results; that would undermine the core trust claim.

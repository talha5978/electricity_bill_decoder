---
doc: prd
status: approved
---

# Bijli Bill Decoder — Product Requirements

One line: A simple bill-reading experience for MEPCO residential households that explains charges and shows how usage affects the bill.
Source: `scope.md > One line`, `Who It's For`, and `The Unique Kernel`.

## The Core Journey

1. **Arrive:** The user sees the single-screen promise, short explanation, photo upload area, “Try a sample bill” action, and MEPCO residential/privacy note.
2. **Choose a bill:** The user takes or selects a photo, or chooses the bundled sample bill. A selected photo is previewed before anything leaves the device. The user can retake or cancel.
3. **Confirm the photo:** The confirm action and adjacent disclosure say: “Confirming sends this photo to an AI service to read it.” No photo is sent before this confirmation.
4. **Read and reconcile:** The preview remains visible, dimmed, beside a two-step status list: “Reading your bill…” then “Checking the numbers…”. The first step extracts bill fields; the second compares the sum of itemized charges with the printed total locally. The tariff calculation has not run yet.
5. **Review:** The user sees the photo and extracted fields together, can zoom the photo, and can correct any field. Reconciliation updates as values change. Unsupported bills stop here. The user can retake the photo, or continue with an explicit unverified warning if the arithmetic still does not match.
6. **Confirm and calculate:** “Looks right, calculate” is available when the numbers match. When they do not, the user can choose “Continue anyway” and accept that the result is unverified. Only this confirmation starts the tariff calculation; a brief “Calculating your slab…” state appears.
7. **Understand the result:** The results screen presents the bill’s source fields, the slab insight, charge breakdown, live usage slider and 2–3 practical tips. The user can edit fields; doing so returns them to review and requires a new calculation confirmation.
8. **Leave or reset:** The photo and extracted values exist only for the current session. Leaving or resetting clears them; the app does not save or log bill contents.

## Screens and Layout

### Landing screen
- One screen with no login, menu, or marketing sections.
- Headline: “Understand your MEPCO electricity bill in 10 seconds.”
- Supporting line: “Upload a photo of your bill. See where your money goes and how many units would lower it.”
- Large photo area for drag-and-drop or taking/choosing a photo, plus “Try a sample bill.”
- Note: “MEPCO residential bills only. Your photo is used to read the bill and isn’t stored.” The adjacent preview-confirmation disclosure explains the AI service transfer before it occurs.

### Preview and progress
- Show the selected photo and let the user retake or cancel before confirming.
- After confirmation, keep the photo visible but dimmed beside/below the progress list. Show a spinner on the active step and a check on each finished step.
- The two steps are “Reading your bill…” and “Checking the numbers…”. If work takes more than about 10 seconds, show: “Still working, bills with small print take a bit longer.”
- A user can cancel processing and return to the landing screen. If a step fails, stop there, explain the issue in plain language, and offer retry.
- For the sample bill only, saved extracted values are a fallback if the model call or network fails. When used, say: “Showing saved results for the sample bill.” Never imply those values were freshly read.

### Review screen
- Keep the photo on one side and the extracted fields on the other; on mobile, stack them in a readable order. The photo can be zoomed.
- Show billing month, consumer category and tariff code, previous and current meter readings, units consumed, itemized charges and taxes, arrears if present, and total payable.
- Show “Numbers match” when the itemized sum equals the printed total. Otherwise show “These numbers don’t match” with the line-item sum, printed total, and difference in rupees.
- Highlight fields involved in a mismatch and flag uncertain or unreadable values with a plain marker such as “Check this one.” All extracted fields can be edited; the reconciliation result updates as the user types.
- If values do not match, offer “Retake photo” and “Continue anyway.” Continuing requires an explicit acknowledgement and marks all later results unverified. Enable “Looks right, calculate” only when values reconcile.
- If MEPCO or the supported residential tariff code does not match, say “This tariff isn’t supported yet” and offer retake or the sample bill. Do not calculate.
- Show a sample label for the bundled bill. The sample uses a redacted, real-format MEPCO residential bill and a fixed set of saved extracted values.

### Results screen
- Keep the source photo and extracted fields available beside the explanation; label sample data “Sample bill.”
- Make the usage/slab insight the largest element: units used, units past the threshold, and the marginal rate above it compared with the lower rate.
- Show a breakdown chart of where the bill amount goes across energy charges, taxes, and adjustments, using primary-color tints and amber for the portion above the threshold. The total and rupee amounts are prominent and aligned for easy reading.
- Provide a usage slider that recalculates the bill live as units are reduced, making the change visible as usage crosses the relevant threshold. State the estimated saving for the selected reduction.
- Show 2–3 concrete tips. Any numbers in the insight, chart, slider, or tips must come from the deterministic tariff calculation, never generated by the language model.
- If the user edits any field, return to review. Recalculate only after they confirm again.
- If the review was continued with a mismatch, mark the result unverified throughout and explain that the slab insight may be inaccurate.

## Look and Feel

- Warm, simple, and document-like: a well-designed utility statement rather than a SaaS dashboard.
- Warm off-white page background, white bill/results cards, near-black charcoal primary text, and softer gray secondary text. Use one deep green or teal for primary actions and matched states; amber is the only loud accent for threshold insights and attention; muted red is reserved for mismatches and failures.
- Use one clean sans-serif for text. Use tabular or monospaced numerals for rupee amounts and unit counts. The slab callout and total are the largest numbers on results.
- Use whitespace, large readable numbers, a single-column layout on mobile, high contrast, and large touch targets. Avoid gradients, glass effects, and glow effects. Keep it readable on an inexpensive phone in daylight.
- Copy is plain, reassuring English; prefer wording like “You’re 18 units past the cheaper rate.” Urdu labels are a stretch goal, not part of this POC.

## Features and Behavior

### Bill selection and consent
Source: `scope.md > The Core Loop`, `What "Working" Looks Like`, and `The POC Boundary`.

- Accept a photo from drag-and-drop or a device camera/file picker. Show a preview before sending it anywhere.
- The user can retake or cancel from preview. Confirming the preview explicitly discloses that the photo will be sent to an AI service solely to read bill fields.
- Before preview confirmation, no photo leaves the device. The bundled redacted sample is available without involving a real person's data.

### Extraction, reconciliation, and review
Source: `scope.md > The Unique Kernel`, `What "Working" Looks Like`, and `The POC Boundary`.

- Extract the bill's month, category/code, meter readings, units, itemized charges and taxes, arrears if present, and payable total.
- Show the source photo beside the values so a person can verify them; visually flag uncertain or unreadable fields.
- Reconciliation is an arithmetic sum comparison on extracted/editable values, not a tariff calculation and not an external request. Show both totals and their difference when they do not match.
- Never run tariff math before the user confirms the review. Matching values enable “Looks right, calculate”; a mismatch requires explicit “Continue anyway” acknowledgement to see an unverified result.
- A user can edit every extracted field. Re-run reconciliation live. Retake is available when the image or extraction is too poor. Unsupported DISCOs or tariff codes stop before calculation.

### Tariff insight and savings
Source: `scope.md > The Unique Kernel`, `What "Working" Looks Like`, and `The POC Boundary`.

- Calculate for MEPCO residential bills with one supported code and one dated tariff snapshot. Other tariff codes are out of scope.
- Explain the current usage's slab position, units past the threshold, and marginal rates in plain language.
- Recalculate the estimated bill as the user adjusts the usage slider. Show a concrete saving for the chosen reduction; every displayed number comes from the calculator.
- Show a charge breakdown chart and 2–3 practical tips. The language model may phrase tips but cannot supply calculated numbers.

### Sample bill
Source: `scope.md > What "Working" Looks Like` and `The POC Boundary`.

- “Try a sample bill” follows the same preview, confirmation, progress, review, and results path as an uploaded bill; the UI does not jump directly to precomputed results.
- Bundle a real-format MEPCO residential bill image with identifying fields blurred/replaced, plus saved extracted values. Choose a supported-code sample near a slab threshold so the slider demonstrates the calculation.
- Label the sample on preview and results. Use saved sample values only as a fallback if live extraction fails or the network is unavailable, and identify that fallback in the UI.

## States and Boundaries

- **Before photo confirmation:** Photo stays on the device. Retake and cancel are available; no AI processing starts.
- **Reading/reconciling:** Show the current step, completed steps, and a delayed-progress message after about 10 seconds. Cancel returns to landing.
- **Extraction or processing failure:** Stop at the failed step, explain the problem plainly, and offer retry. Sample fallback may continue with a clear saved-results label.
- **Uncertain field:** Mark the field “Check this one” and let the user compare/edit it against the photo.
- **Mismatch:** Show the exact sum, printed total, and difference; highlight relevant fields; live-check edits. Do not calculate unless the user explicitly continues unverified.
- **Unsupported bill:** Explain the unsupported MEPCO/category/code and offer retake or sample. No tariff result is shown.
- **Verified result:** Show calculation from the confirmed values and supported tariff snapshot.
- **Unverified result:** Persistent, plain warning that the mismatch may make the slab insight inaccurate.
- **Sample fallback:** State “Showing saved results for the sample bill”; do not portray saved fields as a live extraction.
- **Leaving/resetting:** Clear photo and extracted values from the app session. There is no account, database, or application log of bill contents.

## Product Decisions

- One screen and one upload action define the landing experience; there is no login, menu, or marketing section.
- Preview confirmation is consent to send the photo to an AI service for extraction. Review confirmation is separate consent to run tariff calculations on user-reviewed values.
- The reconciliation is local arithmetic. Tariff math is not run until review confirmation.
- A mismatch can be corrected, retried with another photo, or explicitly continued as unverified; it never silently becomes a confident result.
- The app does not persist or log bill photos or extracted bill data; the data is session-only and clears on leave/reset.
- Only one MEPCO residential tariff code is supported, chosen from an active demo bill. The March 2024 A-1b(03)T disconnected bill is a field reference, not the confirmed supported code.
- The visual direction, copy tone, mobile accessibility, and Urdu-label stretch goal are as stated in `Look and Feel`.

## What We're Building

- The single-screen landing experience and sample-bill entry path.
- Photo selection, preview, explicit AI-service disclosure, and confirmation.
- Two-step extraction/reconciliation progress with cancellation, delay messaging, and retryable plain-language failures.
- Editable, source-verifiable bill review with uncertainty flags, live arithmetic reconciliation, unsupported-bill handling, and explicit unverified continuation.
- Post-review slab calculation, breakdown chart, live usage slider and savings, and 2–3 practical tips.
- A redacted sample bill with saved-value fallback clearly distinguished from live extraction.
- Session-only handling of bill content in the app.

## Deferred From the POC

- Additional MEPCO codes, other DISCOs, and non-residential bills: each requires its own tariff/category validation.
- Urdu labels: useful for accessibility but not needed to prove this English-language demo.
- Public launch and long-term bill history: the hackathon version is session-only and has no accounts or saved bills.

## Possible Later Enhancements

- Support additional verified MEPCO tariffs and other DISCOs.
- Add Urdu labels and broaden accessibility for more households.
- Consider persistent bill history only if users later need it and privacy requirements are revisited.

## Non-Goals

- Providing tariff calculations for unsupported codes, DISCOs, or non-residential categories.
- Presenting an unverified mismatch as accurate or hiding that the user continued anyway.
- Sending a photo before the user confirms its preview.
- Storing or logging real bill contents in the app.
- Treating the old disconnected March 2024 bill as the live demo tariff.

## Open Questions

- **Must resolve before implementation:** Which active MEPCO residential bill and tariff code will be the supported example, and which dated published tariff snapshot applies? The March 2024 A-1b(03)T bill is not sufficient to establish this.
- **Must resolve before finalizing privacy copy/implementation:** Which AI model service will receive confirmed photos, and what are its data-retention terms? The app promises not to store/log bill contents, but provider-side handling must be understood before making a broader retention promise.
- **Can resolve during implementation:** The exact slider bounds/step size and how to format the chart labels, as long as the slider crosses the relevant threshold and all displayed amounts are recalculated.

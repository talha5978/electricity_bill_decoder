import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/home";
import type { ExtractedBill } from "../lib/schemas/bill";
import { reconcileBill } from "../lib/bill/reconcile";
import { BillPreview } from "../components/bill-preview";
import { BillUpload } from "../components/bill-upload";
import { BillReview } from "../components/bill-review";
import { ExtractionProgress } from "../components/extraction-progress";
import { Button } from "../components/ui/button";

type SelectedBillPhoto = { file: File; previewUrl: string };
type AnalyzeResponse = { ok: true; bill: ExtractedBill } | { ok: false; message: string };
type Screen = "upload" | "preview" | "reading" | "checking" | "review";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bijli Bill Decoder — Understand your MEPCO bill" },
    { name: "description", content: "See what your MEPCO electricity bill charges mean." },
  ];
}

export default function Home() {
  const fetcher = useFetcher<AnalyzeResponse>();
  const [selected, setSelected] = useState<SelectedBillPhoto | null>(null);
  const [bill, setBill] = useState<ExtractedBill | null>(null);
  const [screen, setScreen] = useState<Screen>("upload");
  const [error, setError] = useState<string | null>(null);
  const [sampleNotice, setSampleNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [delayed, setDelayed] = useState(false);
  const [unverified, setUnverified] = useState(false);

  useEffect(() => {
    return () => {
      if (selected) URL.revokeObjectURL(selected.previewUrl);
    };
  }, [selected]);

  useEffect(() => {
    if (screen !== "reading") return;
    const timer = window.setTimeout(() => setDelayed(true), 10_000);
    return () => window.clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    if (screen !== "checking" || !bill) return;
    // The sum check is pure local arithmetic; this short state makes that step visible.
    reconcileBill(bill);
    const timer = window.setTimeout(() => setScreen("review"), 500);
    return () => window.clearTimeout(timer);
  }, [screen, bill]);

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.ok) {
      setBill(fetcher.data.bill);
      setError(null);
      setScreen("checking");
    } else {
      setError(fetcher.data.message);
      setScreen("preview");
    }
  }, [fetcher.data]);

  function selectFile(file: File | undefined) {
    setError(null);
    setSampleNotice(null);
    setDragging(false);
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) return setError("Choose a JPEG, PNG, or WebP photo of your bill.");
    if (file.size > MAX_IMAGE_BYTES) return setError("This photo is larger than 8 MB. Choose a smaller image.");
    if (file.size === 0) return setError("This image looks empty. Choose another bill photo.");
    setBill(null);
    setUnverified(false);
    setSelected({ file, previewUrl: URL.createObjectURL(file) });
    setScreen("preview");
  }

  function clearFlow() {
    fetcher.reset();
    setSelected(null);
    setBill(null);
    setError(null);
    setDelayed(false);
    setUnverified(false);
    setScreen("upload");
  }

  function submitPhoto() {
    if (!selected) return;
    setError(null);
    setDelayed(false);
    setScreen("reading");
    const formData = new FormData();
    formData.set("billImage", selected.file, selected.file.name);
    fetcher.submit(formData, { method: "post", action: "/analyze", encType: "multipart/form-data" });
  }

  const busy = screen === "reading" && fetcher.state !== "idle";

  return (
    <main className="min-h-screen px-4 pb-12 pt-7 sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d7dfd5] bg-[#eef3ed] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#365942]"><span className="size-2 rounded-full bg-primary" /> MEPCO bill guide</div>
          <h1 className="mx-auto max-w-2xl text-balance text-3xl font-semibold leading-[1.12] tracking-[-0.045em] text-foreground sm:text-5xl">Understand your MEPCO electricity bill in 10 seconds.</h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-8">Upload a photo of your bill. See where your money goes and how many units would lower it.</p>
        </header>

        {screen === "upload" ? (
          <BillUpload dragging={dragging} error={error} sampleNotice={sampleNotice} onFile={selectFile} onDragChange={setDragging} onTrySample={() => { setError(null); setSampleNotice("A redacted MEPCO sample bill is needed before this demo option can open a bill."); }} />
        ) : null}

        {selected && screen === "preview" ? (
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 flex items-center justify-between gap-4 px-1"><div><p className="text-sm font-semibold text-foreground">Your bill photo</p><p className="mt-1 text-xs text-muted-foreground">Nothing has been sent yet</p></div><Button variant="ghost" className="min-h-10 px-3" onClick={clearFlow}>Cancel</Button></div>
            <BillPreview imageUrl={selected.previewUrl} onRetake={clearFlow} onConfirm={submitPhoto} busy={false} />
            {error ? <ExtractionProgress stage="reading" delayed={false} busy={false} error={error} onRetry={submitPhoto} onCancel={clearFlow} /> : null}
          </div>
        ) : null}

        {selected && (screen === "reading" || screen === "checking") ? (
          <div className="mx-auto max-w-3xl">
            <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(240px,0.8fr)]">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-3">
                <img src={selected.previewUrl} alt="Bill photo being read" className="max-h-[60vh] w-full rounded-xl object-contain opacity-45" />
                <span className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">Photo confirmed</span>
              </div>
              <ExtractionProgress stage={screen === "checking" ? "checking" : "reading"} delayed={delayed} busy={busy || screen === "checking"} error={error} onRetry={submitPhoto} onCancel={clearFlow} />
            </div>
          </div>
        ) : null}

        {selected && screen === "review" && bill ? (
          <>
            <div className="mb-4 flex justify-end"><Button variant="ghost" className="min-h-10 px-3" onClick={clearFlow}>Start over</Button></div>
            <BillReview bill={bill} imageUrl={selected.previewUrl} unverified={unverified} onBillChange={setBill} onRetake={clearFlow} onContinueAnyway={() => setUnverified(true)} />
          </>
        ) : null}

        <footer className="mx-auto mt-7 flex max-w-xl items-start justify-center gap-2.5 px-2 text-center text-xs leading-5 text-muted-foreground sm:mt-8 sm:text-sm"><PrivacyIcon /><p>MEPCO residential bills only. This app does not store your photo or bill details. You decide before the photo is sent for reading.</p></footer>
        <div className="mt-10 text-center"><span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-[#879087]"><DocumentIcon /> A clearer view of your monthly bill</span></div>
      </div>
    </main>
  );
}

function PrivacyIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="mt-0.5 size-4 shrink-0 text-primary"><path d="M10 2.5 16 5v4.2c0 3.7-2.5 6.4-6 8.3-3.5-1.9-6-4.6-6-8.3V5l6-2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="m7.5 9.8 1.7 1.7 3.4-3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function DocumentIcon() {
  return <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" className="size-4"><path d="M4.5 2.5h5l4 4v9h-9v-13Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M9.5 2.5v4h4M6.5 9.5h5M6.5 12h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>;
}

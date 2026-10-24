import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import { BillPreview } from "../components/bill-preview";
import { BillUpload } from "../components/bill-upload";
import { Button } from "../components/ui/button";

type SelectedBillPhoto = {
  file: File;
  previewUrl: string;
};

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bijli Bill Decoder — Understand your MEPCO bill" },
    {
      name: "description",
      content: "See what your MEPCO electricity bill charges mean.",
    },
  ];
}

export default function Home() {
  const [selected, setSelected] = useState<SelectedBillPhoto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sampleNotice, setSampleNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (selected) URL.revokeObjectURL(selected.previewUrl);
    };
  }, [selected]);

  function selectFile(file: File | undefined) {
    setError(null);
    setSampleNotice(null);
    setDragging(false);
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("Choose a JPEG, PNG, or WebP photo of your bill.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("This photo is larger than 8 MB. Choose a smaller image.");
      return;
    }
    if (file.size === 0) {
      setError("This image looks empty. Choose another bill photo.");
      return;
    }

    setSelected({ file, previewUrl: URL.createObjectURL(file) });
  }

  function clearSelection() {
    setError(null);
    setSelected(null);
  }

  return (
    <main className="min-h-screen px-4 pb-12 pt-7 sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d7dfd5] bg-[#eef3ed] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#365942]">
            <span className="size-2 rounded-full bg-primary" /> MEPCO bill guide
          </div>
          <h1 className="mx-auto max-w-2xl text-balance text-3xl font-semibold leading-[1.12] tracking-[-0.045em] text-foreground sm:text-5xl">
            Understand your MEPCO electricity bill in 10 seconds.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-8">
            Upload a photo of your bill. See where your money goes and how many
            units would lower it.
          </p>
        </header>

        {selected ? (
          <div className="mx-auto max-w-xl">
            <div className="mb-4 flex items-center justify-between gap-4 px-1">
              <div>
                <p className="text-sm font-semibold text-foreground">Your bill photo</p>
                <p className="mt-1 text-xs text-muted-foreground">Review before you continue</p>
              </div>
              <Button variant="ghost" className="min-h-10 px-3" onClick={clearSelection}>
                Cancel
              </Button>
            </div>
            <BillPreview imageUrl={selected.previewUrl} onRetake={clearSelection} />
          </div>
        ) : (
          <BillUpload
            dragging={dragging}
            error={error}
            sampleNotice={sampleNotice}
            onFile={selectFile}
            onDragChange={setDragging}
            onTrySample={() => {
              setError(null);
              setSampleNotice(
                "A redacted MEPCO sample bill is needed before this demo option can open a bill.",
              );
            }}
          />
        )}

        <footer className="mx-auto mt-7 flex max-w-xl items-start justify-center gap-2.5 px-2 text-center text-xs leading-5 text-muted-foreground sm:mt-8 sm:text-sm">
          <PrivacyIcon />
          <p>
            MEPCO residential bills only. Your photo is used to read the bill
            and isn’t stored. You decide before it is sent for reading.
          </p>
        </footer>

        <div className="mt-10 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-[#879087]">
            <DocumentIcon /> A clearer view of your monthly bill
          </span>
        </div>
      </div>
    </main>
  );
}

function PrivacyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="mt-0.5 size-4 shrink-0 text-primary">
      <path d="M10 2.5 16 5v4.2c0 3.7-2.5 6.4-6 8.3-3.5-1.9-6-4.6-6-8.3V5l6-2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m7.5 9.8 1.7 1.7 3.4-3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" className="size-4">
      <path d="M4.5 2.5h5l4 4v9h-9v-13Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9.5 2.5v4h4M6.5 9.5h5M6.5 12h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

import { useRef } from "react";
import { Button } from "./ui/button";

type BillUploadProps = {
  dragging: boolean;
  error: string | null;
  sampleNotice: string | null;
  onFile: (file: File | undefined) => void;
  onDragChange: (dragging: boolean) => void;
  onTrySample: () => void;
};

export function BillUpload({
  dragging,
  error,
  sampleNotice,
  onFile,
  onDragChange,
  onTrySample,
}: BillUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    onFile(event.currentTarget.files?.[0]);
    // Let the same image be selected again after a failed/retaken attempt.
    event.currentTarget.value = "";
  }

  return (
    <section aria-label="Choose an electricity bill photo" className="w-full">
      <div
        className={`rounded-[1.75rem] border-2 border-dashed bg-card px-6 py-9 text-center shadow-[0_12px_40px_rgba(35,55,43,0.045)] transition-colors sm:px-10 sm:py-12 ${dragging ? "border-primary bg-[#f2f7f1]" : "border-[#cbd4ca]"}`}
        onDragEnter={(event) => {
          event.preventDefault();
          onDragChange(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            onDragChange(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          onDragChange(false);
          onFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          ref={fileInputRef}
          aria-label="Choose a bill photo from your device"
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
        />
        <input
          ref={cameraInputRef}
          aria-label="Take a bill photo with your camera"
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleInputChange}
        />

        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
          <UploadIcon />
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          Add a photo of your bill
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Use a clear photo of the full page. Keep the text facing up and avoid glare.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => fileInputRef.current?.click()}>
            <ImageIcon /> Choose a photo
          </Button>
          <Button
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
          >
            <CameraIcon /> Take a photo
          </Button>
        </div>
        <p className="mt-5 text-xs font-medium text-muted-foreground">
          JPEG, PNG or WebP · up to 8 MB · drop a photo anywhere in this box
        </p>
      </div>

      <div className="my-5 flex items-center gap-4" aria-hidden="true">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          or
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        variant="outline"
        fullWidth
        className="justify-center sm:mx-auto sm:max-w-xs"
        onClick={onTrySample}
      >
        <SampleIcon /> Try a sample bill
      </Button>
      {sampleNotice ? (
        <p className="mt-3 text-center text-sm text-muted-foreground" role="status">
          {sampleNotice}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-xl border border-[#e8c6bf] bg-[#fbefec] px-4 py-3 text-left text-sm text-[#8f3c31]" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" className="size-8">
      <path d="M16 21V5m0 0L9.5 11.5M16 5l6.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 19.5v5A2.5 2.5 0 008.5 27h15a2.5 2.5 0 002.5-2.5v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4">
      <rect x="2.5" y="3" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="7.5" r="1.5" fill="currentColor" />
      <path d="m4 14 4-4 2.5 2.5 2-2L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4">
      <path d="M3 6.5h3l1.2-2h5.6l1.2 2h3v9H3v-9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="10" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SampleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4">
      <path d="M5 2.75h6l4 4v10.5H5V2.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M11 2.75v4h4M7.5 10h5M7.5 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

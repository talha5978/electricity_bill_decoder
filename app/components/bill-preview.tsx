import { Button } from "./ui/button";

type BillPreviewProps = {
  imageUrl: string;
  onRetake: () => void;
  onConfirm: () => void;
  busy: boolean;
};

export function BillPreview({ imageUrl, onRetake, onConfirm, busy }: BillPreviewProps) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_12px_40px_rgba(35,55,43,0.06)]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div>
          <p className="text-sm font-semibold text-foreground">Photo preview</p>
          <p className="mt-1 text-xs text-muted-foreground">Only on this device so far</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
          <span className="size-1.5 rounded-full bg-primary" /> Ready to check
        </span>
      </div>

      <div className="bg-[#efefe9] p-3 sm:p-5">
        <div className="mx-auto flex min-h-[300px] max-h-[62vh] items-center justify-center overflow-hidden rounded-xl bg-[#e4e4dd] sm:min-h-[390px]">
          <img
            src={imageUrl}
            alt="Preview of the electricity bill photo selected from your device"
            className="max-h-[62vh] w-full object-contain"
          />
        </div>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        <p className="text-sm leading-6 text-muted-foreground">Check that the full bill is readable. You can choose another photo before continuing.</p>
        <div className="rounded-xl border border-[#d7dfd5] bg-[#f2f6f1] px-4 py-3 text-sm leading-6 text-[#365942]">
          <p className="font-semibold">Confirming sends this photo to an AI service to read it.</p>
          <p className="mt-1 text-xs">The photo and extracted fields are not saved by this app.</p>
        </div>
        <Button fullWidth onClick={onConfirm} disabled={busy}>Confirm photo and read bill</Button>
        <Button variant="outline" onClick={onRetake} fullWidth>
          Choose a different photo
        </Button>
      </div>
    </section>
  );
}

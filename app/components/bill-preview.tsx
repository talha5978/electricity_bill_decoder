import { Button } from "./ui/button";

type BillPreviewProps = {
  imageUrl: string;
  onRetake: () => void;
};

export function BillPreview({ imageUrl, onRetake }: BillPreviewProps) {
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
        <p className="text-sm leading-6 text-muted-foreground">
          Check that the full bill is readable. You can retake it now. When you
          choose to read it, the photo will be sent to an AI service for field
          extraction.
        </p>
        <Button variant="outline" onClick={onRetake} fullWidth>
          Choose a different photo
        </Button>
      </div>
    </section>
  );
}

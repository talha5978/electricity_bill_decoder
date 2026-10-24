type ExtractionProgressProps = {
  stage: "reading" | "checking";
  delayed: boolean;
  error: string | null;
  busy: boolean;
  onRetry: () => void;
  onCancel: () => void;
};

export function ExtractionProgress({ stage, delayed, error, busy, onRetry, onCancel }: ExtractionProgressProps) {
  const steps = ["Reading your bill…", "Checking the numbers…"];
  return (
    <section className="mt-5 rounded-2xl border border-border bg-card p-5 sm:p-6" aria-live="polite">
      <ol className="space-y-4">
        {steps.map((step, index) => {
          const complete = index === 0 && stage === "checking" && !error;
          const active = busy && ((stage === "reading" && index === 0) || (stage === "checking" && index === 1));
          const failed = Boolean(error) && index === 0;
          return (
            <li key={step} className="flex items-center gap-3 text-sm font-medium text-foreground">
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${complete ? "bg-secondary text-primary" : failed ? "bg-[#f8e9e5] text-[#923c31]" : active ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"}`}>
                {complete ? <CheckIcon /> : active ? <SpinnerIcon /> : failed ? "!" : <span className="text-xs">{index + 1}</span>}
              </span>
              {step}
            </li>
          );
        })}
      </ol>
      {delayed && busy ? <p className="mt-4 text-sm leading-6 text-muted-foreground">Still working, bills with small print take a bit longer.</p> : null}
      {error ? (
        <div className="mt-4 rounded-xl border border-[#e8c6bf] bg-[#fbefec] px-4 py-3 text-sm leading-6 text-[#8f3c31]" role="alert">
          <p>{error}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={onRetry} className="min-h-10 rounded-lg bg-white px-3 font-semibold text-[#71332b]">Try again</button>
            <button type="button" onClick={onCancel} className="min-h-10 rounded-lg px-3 font-semibold text-[#71332b]">Choose another photo</button>
          </div>
        </div>
      ) : busy ? (
        <button type="button" onClick={onCancel} className="mt-4 min-h-10 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:bg-muted">Cancel and go back</button>
      ) : null}
    </section>
  );
}

function CheckIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4"><path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function SpinnerIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4 animate-spin"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" /><path d="M10 3a7 7 0 0 1 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

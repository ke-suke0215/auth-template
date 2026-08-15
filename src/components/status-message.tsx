type StatusMessageProps = {
  label: string;
  description?: string;
};

export function StatusMessage({ label, description }: StatusMessageProps) {
  return (
    <section
      className="w-full max-w-md border-y border-[#E7E5E4] bg-[#FFFFFF] px-6 py-8 sm:px-8"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 animate-pulse bg-[#111111] motion-reduce:animate-none" aria-hidden="true" />
        <p className="text-sm font-medium">{label}</p>
      </div>
      {description ? <p className="mt-3 text-sm leading-6 text-[#57534E]">{description}</p> : null}
    </section>
  );
}

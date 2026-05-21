import type { ReactNode } from "react";

export const compactFormControlClass =
  "border-accent-soft/80 text-foreground placeholder:text-muted w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200/80";

type FormFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({ label, error, hint, children }: FormFieldProps) {
  return (
    <div>
      <label className="text-foreground mb-1 block text-xs font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-pink-700">{error}</p>
      ) : hint ? (
        <p className="text-muted mt-1 text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

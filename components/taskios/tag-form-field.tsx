"use client";

import { compactFormControlClass } from "@/components/taskios/form-field";
import {
  DEFAULT_TAG_TONE,
  TAG_TONE_STYLES,
  TAG_TONES,
  type TagTone,
} from "@/lib/tag-tones";

type TagFormFieldProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  label: string;
  onLabelChange: (label: string) => void;
  tone: TagTone;
  onToneChange: (tone: TagTone) => void;
  labelError?: string;
};

export function TagFormField({
  enabled,
  onEnabledChange,
  label,
  onLabelChange,
  tone,
  onToneChange,
  labelError,
}: TagFormFieldProps) {
  const previewLabel = label.trim() || "Тег";
  const previewClass = TAG_TONE_STYLES[tone].badge;

  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
          className="border-accent-soft/80 text-accent-strong focus:ring-accent/40 h-4 w-4 rounded border bg-white focus:ring-2"
        />
        <span className="text-foreground text-xs font-medium">Тег</span>
      </label>

      {enabled ? (
        <div className="border-accent-soft/60 space-y-2.5 rounded-xl border bg-white/70 p-2.5">
          {label.trim() ? (
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${previewClass}`}
            >
              {previewLabel}
            </span>
          ) : null}

          <div>
            <input
              value={label}
              onChange={(event) => onLabelChange(event.target.value)}
              className={compactFormControlClass}
              placeholder="Название тега"
              aria-invalid={labelError ? true : undefined}
            />
            {labelError ? (
              <p className="mt-1 text-xs text-pink-700">{labelError}</p>
            ) : null}
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Цвет тега"
          >
            {TAG_TONES.map((toneId) => {
              const style = TAG_TONE_STYLES[toneId];
              const selected = tone === toneId;

              return (
                <button
                  key={toneId}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`Цвет ${toneId}`}
                  onClick={() => onToneChange(toneId)}
                  className={`relative flex h-6 w-6 items-center justify-center rounded-full transition-shadow ${style.swatch} ${
                    selected
                      ? `ring-2 ring-offset-2 ${style.ring}`
                      : "hover:ring-2 hover:ring-black/10 hover:ring-offset-1"
                  }`}
                >
                  {selected ? (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { DEFAULT_TAG_TONE };

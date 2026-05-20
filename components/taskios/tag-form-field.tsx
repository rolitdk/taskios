"use client";

import { compactFormControlClass } from "@/components/taskios/form-field";
import {
  DEFAULT_TAG_TONE,
  TAG_TONE_STYLES,
  TAG_TONES,
  type TagTone,
} from "@/lib/tag-tones";

type TagEditorRowProps = {
  label: string;
  onLabelChange: (label: string) => void;
  tone: TagTone;
  onToneChange: (tone: TagTone) => void;
  onRemove?: () => void;
  labelError?: string;
};

export function TagEditorRow({
  label,
  onLabelChange,
  tone,
  onToneChange,
  onRemove,
  labelError,
}: TagEditorRowProps) {
  const previewLabel = label.trim() || "Тег";
  const previewClass = TAG_TONE_STYLES[tone].badge;

  return (
    <div className="border-accent-soft/60 space-y-2.5 rounded-xl border bg-white/70 p-2.5">
      <div className="flex items-start justify-between gap-2">
        {label.trim() ? (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${previewClass}`}
          >
            {previewLabel}
          </span>
        ) : (
          <span className="text-muted text-[11px]">Предпросмотр тега</span>
        )}
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-muted hover:text-foreground shrink-0 rounded-lg px-1.5 py-0.5 text-xs font-medium transition-colors"
            aria-label="Удалить тег"
          >
            Удалить
          </button>
        ) : null}
      </div>

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
  );
}

export type TagFormEntry = {
  label: string;
  tone: TagTone;
};

type TagsFormFieldProps = {
  tags: TagFormEntry[];
  fieldIds: string[];
  onLabelChange: (index: number, label: string) => void;
  onToneChange: (index: number, tone: TagTone) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  labelErrors?: Record<number, string | undefined>;
};

export function TagsFormField({
  tags,
  fieldIds,
  onLabelChange,
  onToneChange,
  onAdd,
  onRemove,
  labelErrors,
}: TagsFormFieldProps) {
  return (
    <div className="space-y-2">
      <span className="text-foreground text-xs font-medium">Теги</span>

      {tags.length > 0 ? (
        <div className="space-y-2">
          {tags.map((tag, index) => (
            <TagEditorRow
              key={fieldIds[index]}
              label={tag.label}
              onLabelChange={(label) => onLabelChange(index, label)}
              tone={tag.tone}
              onToneChange={(tone) => onToneChange(index, tone)}
              onRemove={() => onRemove(index)}
              labelError={labelErrors?.[index]}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted text-xs">Теги не добавлены</p>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="text-accent-strong hover:text-accent border-accent-soft/80 w-full rounded-xl border border-dashed bg-white/50 px-3 py-2 text-xs font-medium transition-colors"
      >
        Добавить тег
      </button>
    </div>
  );
}

export { DEFAULT_TAG_TONE };

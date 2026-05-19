"use client";

type ActionButtonProps = {
  onClick: () => void;
  "aria-label": string;
};

export function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const actionButtonClass =
  "text-muted hover:text-foreground hover:bg-column-bg flex h-5 w-5 items-center justify-center rounded-md transition-colors";

export function EditActionButton({ onClick, "aria-label": ariaLabel }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(event) => event.stopPropagation()}
      className={actionButtonClass}
      aria-label={ariaLabel}
    >
      <PencilIcon />
    </button>
  );
}

export function DeleteActionButton({ onClick, "aria-label": ariaLabel }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(event) => event.stopPropagation()}
      className={`${actionButtonClass} text-xs leading-none`}
      aria-label={ariaLabel}
    >
      ×
    </button>
  );
}

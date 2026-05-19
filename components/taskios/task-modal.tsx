"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

type TaskModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

function subscribe() {
  return () => {};
}

export function TaskModal({ open, onClose, title, children }: TaskModalProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-purple-950/15 backdrop-blur-md backdrop-saturate-150"
        aria-label="Закрыть окно"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="relative z-10 w-full max-w-md"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-foreground hover:bg-surface/80 absolute -top-2 -right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg leading-none shadow-md ring-1 ring-black/10 transition-colors"
          aria-label="Закрыть"
        >
          ×
        </button>
        <h2 id="task-modal-title" className="sr-only">
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}

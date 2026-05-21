"use client";

import { useEffect, useId, useRef } from "react";

import { useTaskSearch } from "@/modules/tasks/hooks/use-task-search";

export function GlobalSearch() {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    results,
    setIsOpen,
    showDropdown,
    selectResult,
    clearSearch,
  } = useTaskSearch();

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [setIsOpen]);

  return (
    <div ref={containerRef} className="relative">
      <label className="relative block">
        <span className="sr-only">Поиск задач по всем доскам</span>
        <span
          className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          aria-hidden
        >
          <SearchIcon />
        </span>
        <input
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listboxId : undefined}
          aria-autocomplete="list"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              clearSearch();
            }
          }}
          placeholder="Найти задачу…"
          className="border-accent-soft/80 bg-surface text-foreground placeholder:text-muted w-full rounded-2xl border py-2 pr-4 pl-10 text-sm shadow-sm ring-0 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200/80"
        />
      </label>

      {showDropdown ? (
        <ul
          id={listboxId}
          role="listbox"
          className="border-accent-soft/80 bg-surface absolute top-full right-0 left-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-2xl border py-1 shadow-lg ring-1 ring-black/5"
        >
          {results.length === 0 ? (
            <li className="text-muted px-4 py-3 text-sm">Ничего не найдено</li>
          ) : (
            results.map((entry) => (
              <li
                key={`${entry.boardId}-${entry.task.id}`}
                role="option"
                aria-selected={false}
              >
                <button
                  type="button"
                  className="hover:bg-accent-soft/60 focus:bg-accent-soft/60 flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition-colors focus:outline-none"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectResult(entry)}
                >
                  <span className="text-foreground text-sm font-medium">
                    {entry.task.title}
                  </span>
                  <span className="text-muted text-xs">{entry.boardTitle}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

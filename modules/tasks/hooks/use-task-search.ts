"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  boardHrefWithHighlightTask,
  filterSearchableTasks,
  type SearchableTaskEntry,
} from "@/modules/board/model/board-catalog";
import { useAppSelector } from "@/store/hooks";
import { selectAllSearchableTasks } from "@/modules/tasks/store/search-selectors";

const SEARCH_DEBOUNCE_MS = 300;

export function useTaskSearch() {
  const router = useRouter();
  const allTasks = useAppSelector(selectAllSearchableTasks);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const results = useMemo(
    () => filterSearchableTasks(allTasks, debouncedQuery),
    [allTasks, debouncedQuery],
  );

  const showDropdown = isOpen && debouncedQuery.length > 0;

  const selectResult = useCallback(
    (entry: SearchableTaskEntry) => {
      setQuery("");
      setDebouncedQuery("");
      setIsOpen(false);
      router.push(boardHrefWithHighlightTask(entry.boardId, entry.task.id));
    },
    [router],
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
  }, []);

  return {
    query,
    setQuery,
    debouncedQuery,
    results,
    isOpen,
    setIsOpen,
    showDropdown,
    selectResult,
    clearSearch,
  };
}

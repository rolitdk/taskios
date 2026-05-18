"use client";
// Страница конкретной доски задач (клиентская часть)

import { useState } from "react";

import type { TaskStatus } from "@/lib/board-types";

import { BoardView } from "./board-view";
import { CreateTaskForm } from "./create-task-form";

export function BoardPageClient() {
  const [showGlobalCreate, setShowGlobalCreate] = useState(false);

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-muted text-xs font-medium tracking-wide uppercase">
            Рабочее пространство
          </p>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Моя доска
          </h1>
        </div>
        <div className="text-muted flex items-center gap-2 text-sm">
          <span className="bg-surface rounded-full px-3 py-1 text-xs font-medium shadow-sm ring-1 ring-black/5">
            Локальное состояние · Redux
          </span>
          <button
            type="button"
            onClick={() => setShowGlobalCreate((open) => !open)}
            className="bg-accent hover:bg-accent-strong rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            {showGlobalCreate ? "Скрыть форму" : "+ Новая задача"}
          </button>
        </div>
      </div>

      {showGlobalCreate ? (
        <div className="max-w-md">
          <CreateTaskForm
            defaultStatus={"todo" satisfies TaskStatus}
            onCancel={() => setShowGlobalCreate(false)}
            onCreated={() => setShowGlobalCreate(false)}
          />
        </div>
      ) : null}

      <BoardView />
    </main>
  );
}

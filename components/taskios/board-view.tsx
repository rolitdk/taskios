// Общая доска задач по статусам
"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";

import type { BoardTask, TaskStatus } from "@/lib/board-types";
import { resolveDropTarget } from "@/lib/dnd-utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectBoardColumns } from "@/store/selectors/board-selectors";
import { moveTask } from "@/store/slices/tasks-slice";

import { BoardColumn } from "./board-column";
import { TaskCard } from "./task-card";

export function BoardView() {
  const dispatch = useAppDispatch();
  const columns = useAppSelector(selectBoardColumns);
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const [creatingInColumn, setCreatingInColumn] = useState<TaskStatus | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((item) => item.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const dropTarget = resolveDropTarget(String(over.id), tasks);
    if (!dropTarget) {
      return;
    }

    const activeTaskItem = tasks.find((task) => task.id === active.id);
    if (!activeTaskItem) {
      return;
    }

    const columnTasks = tasks
      .filter(
        (task) => task.status === dropTarget.status && task.id !== active.id,
      )
      .sort((a, b) => a.order - b.order);

    let order = dropTarget.order;
    if (String(over.id) !== dropTarget.status) {
      const overIndex = columnTasks.findIndex((task) => task.id === over.id);
      if (overIndex >= 0) {
        order = overIndex;
      }
    } else {
      order = columnTasks.length;
    }

    if (
      activeTaskItem.status === dropTarget.status &&
      activeTaskItem.order === order
    ) {
      return;
    }

    dispatch(
      moveTask({
        taskId: String(active.id),
        status: dropTarget.status,
        order,
      }),
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex [scrollbar-width:thin] gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none]"
        tabIndex={0}
        role="region"
        aria-label="Колонки доски"
      >
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            isCreating={creatingInColumn === column.id}
            onStartCreate={(status) => setCreatingInColumn(status)}
            onCancelCreate={() => setCreatingInColumn(null)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="w-72 rotate-1 opacity-95">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

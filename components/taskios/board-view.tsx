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
import {
  selectBoardColumnsForBoard,
  selectBoardTasksById,
} from "@/store/selectors/board-selectors";
import { moveTask } from "@/store/slices/tasks-slice";

import { BoardColumn } from "./board-column";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";
import { TaskModal } from "./task-modal";

type TaskModalState =
  | { kind: "create"; status: TaskStatus }
  | { kind: "edit"; task: BoardTask };

type BoardViewProps = {
  boardId: string;
};

export function BoardView({ boardId }: BoardViewProps) {
  const dispatch = useAppDispatch();
  const columns = useAppSelector((state) =>
    selectBoardColumnsForBoard(state, boardId),
  );
  const tasks = useAppSelector((state) => selectBoardTasksById(state, boardId));
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const [taskModal, setTaskModal] = useState<TaskModalState | null>(null);

  const closeTaskModal = () => setTaskModal(null);

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
            onStartCreate={(status) => setTaskModal({ kind: "create", status })}
            onEditTask={(task) => setTaskModal({ kind: "edit", task })}
          />
        ))}
      </div>

      <TaskModal
        open={taskModal !== null}
        onClose={closeTaskModal}
        title={
          taskModal?.kind === "edit" ? "Редактирование задачи" : "Новая задача"
        }
      >
        {taskModal?.kind === "create" ? (
          <TaskForm
            key={`create-${taskModal.status}`}
            mode="create"
            defaultStatus={taskModal.status}
            onCancel={closeTaskModal}
            onCreated={closeTaskModal}
          />
        ) : null}
        {taskModal?.kind === "edit" ? (
          <TaskForm
            key={`edit-${taskModal.task.id}`}
            mode="edit"
            task={taskModal.task}
            onCancel={closeTaskModal}
            onSaved={closeTaskModal}
          />
        ) : null}
      </TaskModal>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="w-72 rotate-1 opacity-95">
            <TaskCard task={activeTask} showDelete={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

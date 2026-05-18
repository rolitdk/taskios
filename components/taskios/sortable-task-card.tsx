"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

import type { BoardTask } from "@/lib/board-types";

import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";

type SortableTaskCardProps = {
  task: BoardTask;
};

export function SortableTaskCard({ task }: SortableTaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isEditing) {
    return (
      <li ref={setNodeRef} style={style}>
        <TaskForm
          mode="edit"
          task={task}
          onCancel={() => setIsEditing(false)}
          onSaved={() => setIsEditing(false)}
        />
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-40" : undefined}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} onEdit={() => setIsEditing(true)} />
    </li>
  );
}

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef } from "react";
import type { BoardTask } from "@/modules/board/model/board-types";

import { TaskCard } from "./task-card";

type SortableTaskCardProps = {
  task: BoardTask;
  highlighted?: boolean;
  onEdit: (task: BoardTask) => void;
};

export function SortableTaskCard({
  task,
  highlighted = false,
  onEdit,
}: SortableTaskCardProps) {
  const cardRef = useRef<HTMLLIElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (!highlighted || !cardRef.current) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [highlighted]);

  return (
    <li
      ref={(node) => {
        setNodeRef(node);
        cardRef.current = node;
      }}
      style={style}
      className={isDragging ? "opacity-40" : undefined}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        highlighted={highlighted}
        onEdit={() => onEdit(task)}
      />
    </li>
  );
}

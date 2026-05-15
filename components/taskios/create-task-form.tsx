// Форма создания новой задачи
"use client";

import { useForm } from "react-hook-form";

import type { TaskStatus } from "@/lib/board-types";
import { COLUMN_DEFINITIONS } from "@/lib/board-types";
import { useAppDispatch } from "@/store/hooks";
import { addTask } from "@/store/slices/tasks-slice";

export type CreateTaskFormValues = {
  title: string;
  subtitle: string;
  status: TaskStatus;
};

type CreateTaskFormProps = {
  defaultStatus: TaskStatus;
  onCancel: () => void;
  onCreated?: () => void;
};

export function CreateTaskForm({
  defaultStatus,
  onCancel,
  onCreated,
}: CreateTaskFormProps) {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    defaultValues: {
      title: "",
      subtitle: "",
      status: defaultStatus,
    },
  });

  const onSubmit = handleSubmit((values) => {
    dispatch(
      addTask({
        title: values.title,
        subtitle: values.subtitle,
        status: values.status,
      }),
    );
    onCreated?.();
  });

  return (
    <form
      onSubmit={onSubmit}
      className="bg-surface space-y-3 rounded-2xl p-3 shadow-sm ring-1 ring-black/5"
    >
      <div>
        <label className="text-foreground mb-1 block text-xs font-medium">
          Название
        </label>
        <input
          {...register("title", {
            required: "Введите название задачи",
            minLength: { value: 2, message: "Минимум 2 символа" },
          })}
          autoFocus
          className="border-accent-soft/80 text-foreground placeholder:text-muted w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200/80"
          placeholder="Например, сверстать карточку"
        />
        {errors.title ? (
          <p className="mt-1 text-xs text-pink-700">{errors.title.message}</p>
        ) : null}
      </div>

      <div>
        <label className="text-foreground mb-1 block text-xs font-medium">
          Описание
        </label>
        <input
          {...register("subtitle")}
          className="border-accent-soft/80 text-foreground placeholder:text-muted w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200/80"
          placeholder="Срок или заметка"
        />
      </div>

      <div>
        <label className="text-foreground mb-1 block text-xs font-medium">
          Колонка
        </label>
        <select
          {...register("status")}
          className="border-accent-soft/80 text-foreground w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200/80"
        >
          {COLUMN_DEFINITIONS.map((column) => (
            <option key={column.id} value={column.id}>
              {column.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent hover:bg-accent-strong flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
        >
          Создать
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted hover:text-foreground border-accent-soft/80 rounded-xl border bg-white/60 px-3 py-2 text-sm font-medium transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

"use client";

import { useForm } from "react-hook-form";

import {
  compactFormControlClass,
  FormField,
} from "@/components/taskios/form-field";
import { useEditTask } from "@/hooks/use-edit-task";
import type { BoardTask, TaskStatus } from "@/lib/board-types";
import { COLUMN_DEFINITIONS } from "@/lib/board-types";
import { useAppDispatch } from "@/store/hooks";
import { addTask } from "@/store/slices/tasks-slice";

export type TaskFormValues = {
  title: string;
  subtitle: string;
  status: TaskStatus;
};

type TaskFormCreateProps = {
  mode: "create";
  defaultStatus: TaskStatus;
  onCancel: () => void;
  onCreated?: () => void;
};

type TaskFormEditProps = {
  mode: "edit";
  task: BoardTask;
  onCancel: () => void;
  onSaved?: () => void;
};

export type TaskFormProps = TaskFormCreateProps | TaskFormEditProps;

function subtitleToFieldValue(subtitle: string) {
  return subtitle === "Без описания" ? "" : subtitle;
}

export function TaskForm(props: TaskFormProps) {
  const dispatch = useAppDispatch();
  const { editTask } = useEditTask();

  const defaultValues: TaskFormValues =
    props.mode === "edit"
      ? {
          title: props.task.title,
          subtitle: subtitleToFieldValue(props.task.subtitle),
          status: props.task.status,
        }
      : {
          title: "",
          subtitle: "",
          status: props.defaultStatus,
        };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({ defaultValues });

  const onSubmit = handleSubmit((values) => {
    if (props.mode === "edit") {
      editTask({
        taskId: props.task.id,
        title: values.title,
        subtitle: values.subtitle,
        status: values.status,
      });
      props.onSaved?.();
      return;
    }

    dispatch(
      addTask({
        title: values.title,
        subtitle: values.subtitle,
        status: values.status,
      }),
    );
    props.onCreated?.();
  });

  const submitLabel = props.mode === "edit" ? "Сохранить" : "Создать";

  return (
    <form
      onSubmit={onSubmit}
      className="bg-surface space-y-3 rounded-2xl p-3 shadow-sm ring-1 ring-black/5"
    >
      <FormField label="Название" error={errors.title?.message}>
        <input
          {...register("title", {
            required: "Введите название задачи",
            minLength: { value: 2, message: "Минимум 2 символа" },
          })}
          autoFocus
          className={compactFormControlClass}
          placeholder="Например, сверстать карточку"
        />
      </FormField>

      <FormField label="Описание">
        <input
          {...register("subtitle")}
          className={compactFormControlClass}
          placeholder="Срок или заметка"
        />
      </FormField>

      <FormField label="Колонка">
        <select {...register("status")} className={compactFormControlClass}>
          {COLUMN_DEFINITIONS.map((column) => (
            <option key={column.id} value={column.id}>
              {column.title}
            </option>
          ))}
        </select>
      </FormField>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent hover:bg-accent-strong flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={props.onCancel}
          className="text-muted hover:text-foreground border-accent-soft/80 rounded-xl border bg-white/60 px-3 py-2 text-sm font-medium transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

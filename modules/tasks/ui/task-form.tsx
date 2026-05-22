"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";

import {
  compactFormControlClass,
  FormField,
} from "@/components/ui/form-field";
import {
  DEFAULT_TAG_TONE,
  TagsFormField,
  type TagFormEntry,
} from "@/modules/tasks/ui/tag-form-field";
import { useCreateTask } from "@/modules/tasks/hooks/use-create-task";
import { useEditTask } from "@/modules/tasks/hooks/use-edit-task";
import type { BoardTask, TaskStatus, TaskTag } from "@/modules/board/model/board-types";
import { COLUMN_DEFINITIONS } from "@/modules/board/model/board-types";

export type TaskFormValues = {
  title: string;
  subtitle: string;
  status: TaskStatus;
  tags: TagFormEntry[];
};

type TaskFormCreateProps = {
  mode: "create";
  boardId: string;
  defaultStatus: TaskStatus;
  onCancel: () => void;
  onCreated?: () => void;
};

type TaskFormEditProps = {
  mode: "edit";
  boardId: string;
  task: BoardTask;
  onCancel: () => void;
  onSaved?: () => void;
};

export type TaskFormProps = TaskFormCreateProps | TaskFormEditProps;

function subtitleToFieldValue(subtitle: string) {
  return subtitle === "Без описания" ? "" : subtitle;
}

function tagsToFormValues(tags: TaskTag[]): TagFormEntry[] {
  return tags.map((tag) => ({
    label: tag.label,
    tone: tag.tone,
  }));
}

function formValuesToTags(values: TaskFormValues): TaskTag[] {
  return values.tags
    .map((tag) => ({
      label: tag.label.trim(),
      tone: tag.tone,
    }))
    .filter((tag) => tag.label.length > 0);
}

export function TaskForm(props: TaskFormProps) {
  const { editTask, isSaving, error: editError, clearError: clearEditError } =
    useEditTask();
  const {
    createTask,
    isCreating,
    error: createError,
    clearError: clearCreateError,
  } = useCreateTask();

  const error = props.mode === "create" ? createError : editError;
  const isSubmittingTask = props.mode === "create" ? isCreating : isSaving;

  useEffect(() => {
    return () => {
      clearCreateError();
      clearEditError();
    };
  }, [clearCreateError, clearEditError]);

  const defaultValues: TaskFormValues =
    props.mode === "edit"
      ? {
          title: props.task.title,
          subtitle: subtitleToFieldValue(props.task.subtitle),
          status: props.task.status,
          tags: tagsToFormValues(props.task.tags),
        }
      : {
          title: "",
          subtitle: "",
          status: props.defaultStatus,
          tags: [],
        };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({ defaultValues });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tags",
  });

  const tags = watch("tags");

  const registerTitle = () => {
    return register("title", {
      required: "Введите название задачи",
      minLength: { value: 2, message: "Минимум 2 символа" },
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    const normalizedTags = formValuesToTags(values);

    if (props.mode === "edit") {
      const saved = await editTask({
        boardId: props.boardId,
        taskId: props.task.id,
        title: values.title,
        subtitle: values.subtitle,
        status: values.status,
        tags: normalizedTags,
      });

      if (saved) {
        props.onSaved?.();
      }
      return;
    }

    const created = await createTask({
      boardId: props.boardId,
      title: values.title,
      subtitle: values.subtitle,
      status: values.status,
      tags: normalizedTags,
    });

    if (created) {
      props.onCreated?.();
    }
  });

  const submitLabel = props.mode === "edit" ? "Сохранить" : "Создать";

  return (
    <form
      onSubmit={onSubmit}
      className="bg-surface flex max-h-[min(36rem,calc(100dvh-2.5rem))] flex-col overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5"
    >
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 [scrollbar-width:thin]">
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <FormField label="Название" error={errors.title?.message}>
        <input
          {...registerTitle()}
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

      <TagsFormField
        tags={tags}
        fieldIds={fields.map((field) => field.id)}
        onLabelChange={(index, label) =>
          setValue(`tags.${index}.label`, label, { shouldDirty: true })
        }
        onToneChange={(index, tone) =>
          setValue(`tags.${index}.tone`, tone, { shouldDirty: true })
        }
        onAdd={() => append({ label: "", tone: DEFAULT_TAG_TONE })}
        onRemove={remove}
      />
      </div>

      <div className="bg-surface flex shrink-0 gap-2 border-t border-black/5 p-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || isSubmittingTask}
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

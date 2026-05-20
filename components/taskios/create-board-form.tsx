"use client";

import { useForm } from "react-hook-form";

import {
  compactFormControlClass,
  FormField,
} from "@/components/taskios/form-field";
import { useCreateBoard } from "@/hooks/use-create-board";

export type CreateBoardFormValues = {
  title: string;
};

type CreateBoardFormProps = {
  onCancel: () => void;
  onCreated?: () => void;
};

export function CreateBoardForm({ onCancel, onCreated }: CreateBoardFormProps) {
  const { createBoard } = useCreateBoard();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateBoardFormValues>({
    defaultValues: { title: "" },
  });

  const onSubmit = handleSubmit((values) => {
    createBoard(values.title);
    onCreated?.();
  });

  return (
    <form
      onSubmit={onSubmit}
      className="bg-surface space-y-3 rounded-2xl p-3 shadow-sm ring-1 ring-black/5"
    >
      <FormField label="Название" error={errors.title?.message}>
        <input
          {...register("title", {
            required: "Введите название доски",
            minLength: { value: 2, message: "Минимум 2 символа" },
          })}
          autoFocus
          className={compactFormControlClass}
          placeholder="Например, рабочие задачи"
        />
      </FormField>

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

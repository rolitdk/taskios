"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/taskios/form-field";
import { useAuth } from "@/components/providers/auth-provider";
import { getApiErrorMessage, readResponseJson } from "@/lib/api-client";
import type { ApiErrorBody, PublicUser } from "@/lib/auth-types";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const PASSWORD_MIN_LENGTH = 8;

const inputClassName =
  "border-accent-soft/80 text-foreground placeholder:text-muted w-full rounded-2xl border bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200/80";

export function RegisterForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const passwordHint =
    password.length > 0 && password.length < PASSWORD_MIN_LENGTH
      ? `Пароль должен содержать ${PASSWORD_MIN_LENGTH} символов`
      : undefined;

  const confirmPasswordHint =
    confirmPassword.length > 0 && confirmPassword !== password
      ? "Пароли не совпадают"
      : undefined;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const fallbackMessage = "Не удалось создать аккаунт. Попробуйте позже.";

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      const body = await readResponseJson<{ user: PublicUser } | ApiErrorBody>(
        response,
      );

      if (response.ok && body && "user" in body) {
        setUser(body.user);
        router.replace("/boards");
        router.refresh();
        return;
      }

      setServerError(getApiErrorMessage(body, fallbackMessage));
    } catch {
      setServerError(fallbackMessage);
    }
  });


  return (
    <>
      <h1 className="text-foreground text-2xl font-bold tracking-tight">
        Регистрация в Taskios
      </h1>
      <p className="text-muted mt-2 text-sm">
        Создайте аккаунт, чтобы сохранять проекты и задачи.
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={onSubmit}
        noValidate
        aria-label="Форма регистрации"
      >
        <FormField label="Имя" error={errors.name?.message}>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder="Как к вам обращаться"
            className={inputClassName}
            {...register("name", {
              required: "Введите имя",
              minLength: { value: 2, message: "Минимум 2 символа" },
              maxLength: { value: 100, message: "Не более 100 символов" },
            })}
          />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClassName}
            {...register("email", {
              required: "Введите email",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Некорректный email",
              },
            })}
          />
        </FormField>

        <FormField
          label="Пароль"
          error={errors.password?.message}
          hint={passwordHint}
        >
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="Не менее 8 символов"
            className={inputClassName}
            {...register("password", {
              required: "Введите пароль",
              minLength: {
                value: PASSWORD_MIN_LENGTH,
                message: `Минимум ${PASSWORD_MIN_LENGTH} символов`,
              },
              maxLength: { value: 128, message: "Не более 128 символов" },
            })}
          />
        </FormField>

        <FormField
          label="Подтверждение пароля"
          error={errors.confirmPassword?.message}
          hint={confirmPasswordHint}
        >
          <input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="Повторите пароль"
            className={inputClassName}
            {...register("confirmPassword", {
              required: "Подтвердите пароль",
              validate: (value, formValues) =>
                value === formValues.password || "Пароли не совпадают",
            })}
          />
        </FormField>

        {serverError ? (
          <p
            className="rounded-2xl bg-pink-50 px-4 py-3 text-sm text-pink-800 ring-1 ring-pink-200/80"
            role="alert"
          >
            {serverError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent-strong w-full rounded-2xl py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Создаём аккаунт…" : "Создать аккаунт"}
        </button>
      </form>

      <p className="text-muted mt-6 text-center text-sm">
        Уже есть аккаунт?{" "}
        <Link
          href="/login"
          className="text-accent-strong font-semibold underline-offset-2 hover:text-purple-900 hover:underline"
        >
          Вход
        </Link>
      </p>
      <p className="mt-4 text-center">
        <Link
          href="/"
          className="text-muted hover:text-foreground text-sm font-medium"
        >
          На главную
        </Link>
      </p>
    </>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/modules/user/providers/auth-provider";
import { getApiErrorMessage, readResponseJson } from "@/shared/lib/api-client";
import { getPostLoginRedirectPath } from "@/modules/user/lib/auth-routes";
import type { ApiErrorBody, PublicUser } from "@/modules/user/model/auth-types";

type LoginFormValues = {
  email: string;
  password: string;
};

const inputClassName =
  "border-accent-soft/80 text-foreground placeholder:text-muted w-full rounded-2xl border bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200/80";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const fallbackMessage = "Не удалось войти. Проверьте email и пароль.";

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const body = await readResponseJson<{ user: PublicUser } | ApiErrorBody>(
        response,
      );

      if (response.ok && body && "user" in body) {
        setUser(body.user);
        router.replace(getPostLoginRedirectPath(searchParams.get("from")));
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
        Вход в Taskios
      </h1>
      <p className="text-muted mt-2 text-sm">
        Войдите, чтобы сохранять проекты и задачи.
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={onSubmit}
        noValidate
        aria-label="Форма входа"
      >
        <FormField label="Email" error={errors.email?.message}>
          <input
            id="login-email"
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

        <FormField label="Пароль" error={errors.password?.message}>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClassName}
            {...register("password", {
              required: "Введите пароль",
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
          {isSubmitting ? "Входим…" : "Войти"}
        </button>
      </form>

      <p className="text-muted mt-6 text-center text-sm">
        Нет аккаунта?{" "}
        <Link
          href="/register"
          className="text-accent-strong font-semibold underline-offset-2 hover:text-purple-900 hover:underline"
        >
          Регистрация
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

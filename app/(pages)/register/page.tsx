// Страница регистрации
import Link from "next/link";

import { AppShell } from "@/components/taskios/app-shell";

export default function RegisterPage() {
  return (
    <AppShell>
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="bg-surface w-full max-w-md rounded-3xl p-8 shadow-lg ring-1 ring-purple-200/50">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Регистрация в Taskios
          </h1>
          <p className="text-muted mt-2 text-sm">
            Заглушка интерфейса: позже здесь будет создание аккаунта.
          </p>
          <form
            className="mt-8 space-y-4"
            aria-label="Форма регистрации (неактивна)"
          >
            <div>
              <label
                htmlFor="register-name"
                className="text-foreground mb-1.5 block text-sm font-medium"
              >
                Имя
              </label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Как к вам обращаться"
                className="border-accent-soft/80 text-foreground placeholder:text-muted w-full rounded-2xl border bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200/80"
              />
            </div>
            <div>
              <label
                htmlFor="register-email"
                className="text-foreground mb-1.5 block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="border-accent-soft/80 text-foreground placeholder:text-muted w-full rounded-2xl border bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200/80"
              />
            </div>
            <div>
              <label
                htmlFor="register-password"
                className="text-foreground mb-1.5 block text-sm font-medium"
              >
                Пароль
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Не менее 8 символов"
                className="border-accent-soft/80 text-foreground placeholder:text-muted w-full rounded-2xl border bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200/80"
              />
            </div>
            <button
              type="button"
              className="bg-accent-strong w-full rounded-2xl py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-purple-800"
            >
              Создать аккаунт
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
        </div>
      </main>
    </AppShell>
  );
}

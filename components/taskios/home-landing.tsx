import Link from "next/link";

export function HomeLanding() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 sm:py-24">
      <div className="bg-surface rounded-3xl p-8 shadow-lg ring-1 ring-purple-200/50 sm:p-12">
        <p className="text-muted text-xs font-medium tracking-wide uppercase">
          Управление задачами
        </p>
        <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Taskios — доски задач
        </h1>
        <p className="text-muted mt-4 text-base leading-relaxed sm:text-lg">
          Планируйте проекты на канбан-досках: колонки статусов, карточки с
          тегами и перетаскивание между этапами. Всё в одном спокойном
          интерфейсе — без лишней сложности.
        </p>
        <ul className="text-foreground mt-6 space-y-2 text-sm sm:text-base">
          <li className="flex gap-2">
            <span className="text-accent-strong shrink-0" aria-hidden>
              ✓
            </span>
            <span>Колонки «Сделать», «В работе», «На проверке», «Готово»</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent-strong shrink-0" aria-hidden>
              ✓
            </span>
            <span>Drag &amp; drop карточек между колонками и внутри списка</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent-strong shrink-0" aria-hidden>
              ✓
            </span>
            <span>Несколько досок под разные проекты или клиентов</span>
          </li>
        </ul>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/register"
            className="bg-accent-strong hover:bg-accent inline-flex items-center justify-center rounded-2xl px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors"
          >
            Попробовать сейчас
          </Link>
          <Link
            href="/login"
            className="text-accent-strong hover:text-foreground border-accent-soft/80 inline-flex items-center justify-center rounded-2xl border bg-white/60 px-6 py-3 text-center text-sm font-semibold transition-colors"
          >
            Уже есть аккаунт
          </Link>
        </div>
      </div>
    </main>
  );
}

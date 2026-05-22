"use client";

import Link from "next/link";

import { useAuth } from "@/modules/user/providers/auth-provider";

const FEATURES = [
  {
    title: "Канбан по статусам",
    description:
      "Колонки «К выполнению», «В работе», «На проверке» и «Готово» — видно, где застряла каждая задача.",
  },
  {
    title: "Drag & drop",
    description:
      "Перетаскивайте карточки между колонками и меняйте порядок внутри списка без лишних кликов.",
  },
  {
    title: "Теги и карточки",
    description:
      "Краткое описание, метки и исполнитель на карточке — всё нужное под рукой, без шума.",
  },
  {
    title: "Несколько досок",
    description:
      "Отдельная доска на проект или клиента — переключайтесь между контекстами за секунду.",
  },
] as const;

export function HomeLanding() {
  const { user, isLoading } = useAuth();

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-accent-soft/40 via-background to-background"
          aria-hidden
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-muted text-xs font-medium tracking-wide uppercase">
              Канбан для фриланса и малых команд
            </p>
            <h1 className="text-foreground mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Задачи на доске —{" "}
              <span className="text-accent-strong">понятно и спокойно</span>
            </h1>
            <p className="text-muted mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
              Taskios помогает держать проекты в фокусе: статусы, карточки и
              перетаскивание в одном интерфейсе. Без перегруженных настроек —
              открыл доску и работаешь.
            </p>
            <LandingAuthCta
              className="mt-8"
              primaryLabel="Начать бесплатно"
              size="lg"
            />
            {!isLoading && !user && (
              <p className="text-muted mt-4 text-sm">
                Регистрация за минуту · доски и задачи сразу после входа
              </p>
            )}
          </div>

          <BoardPreview aria-label="Пример канбан-доски Taskios" />
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-accent-soft/50 bg-surface/60 border-y px-4 py-14 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Всё нужное для ежедневной работы
            </h2>
            <p className="text-muted mt-3 text-base leading-relaxed">
              Как у привычных таск-менеджеров — наглядно и по делу, но в
              нежной палитре Taskios и без лишних экранов.
            </p>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((feature, index) => (
              <li
                key={feature.title}
                className="bg-surface rounded-2xl p-5 shadow-sm ring-1 ring-purple-200/40 sm:p-6"
              >
                <span
                  className="bg-accent-soft text-accent-strong inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <h3 className="text-foreground mt-4 text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Use case + CTA */}
      <section className="px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="bg-shell-bg rounded-3xl px-6 py-10 ring-1 ring-purple-200/40 sm:px-10 sm:py-12">
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Одна доска — один проект
            </h2>
            <p className="text-muted mt-4 max-w-2xl text-base leading-relaxed">
              Ведите клиентские задачи, личный бэклог или спринт команды:
              перетащили карточку в «Готово» — прогресс виден сразу всей
              команде. Taskios не подменяет тяжёлый PM, а даёт быстрый
              канбан там, где хватает колонок и карточек.
            </p>
            <LandingAuthCta
              className="mt-8"
              primaryLabel="Создать аккаунт"
              size="md"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function LandingAuthCta({
  className,
  primaryLabel,
  size,
}: {
  className?: string;
  primaryLabel: string;
  size: "lg" | "md";
}) {
  const { user, isLoading } = useAuth();
  const padding = size === "lg" ? "px-6 py-3.5" : "px-6 py-3";

  if (isLoading) {
    return (
      <LandingAuthCtaSkeleton className={className} size={size} />
    );
  }

  if (user) {
    return (
      <div
        className={`flex flex-col gap-3 sm:flex-row sm:items-center ${className ?? ""}`}
      >
        <Link
          href="/boards"
          className={`bg-accent-strong hover:bg-accent inline-flex items-center justify-center rounded-2xl text-center text-sm font-semibold text-white shadow-sm transition-colors ${padding}`}
        >
          Перейти к доскам
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center ${className ?? ""}`}
    >
      <Link
        href="/register"
        className={`bg-accent-strong hover:bg-accent inline-flex items-center justify-center rounded-2xl text-center text-sm font-semibold text-white shadow-sm transition-colors ${padding}`}
      >
        {primaryLabel}
      </Link>
      <Link
        href="/login"
        className={`text-accent-strong hover:text-foreground border-accent-soft/80 inline-flex items-center justify-center rounded-2xl border bg-surface/80 text-center text-sm font-semibold backdrop-blur-sm transition-colors ${padding} ${size === "md" ? "bg-surface" : ""}`}
      >
        Войти в аккаунт
      </Link>
    </div>
  );
}

function LandingAuthCtaSkeleton({
  className,
  size,
}: {
  className?: string;
  size: "lg" | "md";
}) {
  const buttonHeight = size === "lg" ? "h-[46px]" : "h-11";

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center ${className ?? ""}`}
      aria-busy="true"
      aria-label="Загрузка действий"
    >
      <span
        className={`bg-accent-soft/60 inline-block w-44 rounded-2xl ${buttonHeight} animate-pulse`}
        aria-hidden
      />
      <span
        className={`bg-shell-bg border-accent-soft/60 inline-block w-40 rounded-2xl border ${buttonHeight} animate-pulse`}
        aria-hidden
      />
    </div>
  );
}

function BoardPreview({ "aria-label": ariaLabel }: { "aria-label": string }) {
  return (
    <div
      className="bg-surface/90 rounded-3xl p-4 shadow-lg ring-1 ring-purple-200/50 backdrop-blur-sm sm:p-5"
      aria-label={ariaLabel}
      role="img"
    >
      <div className="text-muted mb-3 flex items-center justify-between text-xs font-medium">
        <span className="text-foreground font-semibold">Проект «Сайт»</span>
        <span className="bg-accent-soft text-accent-strong rounded-lg px-2 py-0.5">
          4 колонки
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 sm:gap-2.5">
        <PreviewColumn
          title="К выполнению"
          count={2}
          cards={[
            { title: "Макет главной", tag: "Дизайн" },
            { title: "Бриф от клиента", tag: "Входящие" },
          ]}
        />
        <PreviewColumn
          title="В работе"
          count={1}
          cards={[{ title: "Вёрстка шапки", tag: "Разработка", accent: true }]}
        />
        <PreviewColumn
          title="На проверке"
          count={1}
          cards={[{ title: "Адаптив футера", tag: "QA" }]}
        />
        <PreviewColumn
          title="Готово"
          count={1}
          cards={[{ title: "Домен подключён", tag: "Инфра", muted: true }]}
          faded
        />
      </div>
    </div>
  );
}

function PreviewColumn({
  title,
  count,
  cards,
  faded,
}: {
  title: string;
  count: number;
  cards: { title: string; tag: string; accent?: boolean; muted?: boolean }[];
  faded?: boolean;
}) {
  return (
    <div
      className={`bg-column-bg flex w-[7.5rem] shrink-0 flex-col rounded-xl p-2 ring-1 ring-purple-200/30 sm:w-[8.5rem] ${
        faded ? "opacity-80" : ""
      }`}
    >
      <div className="text-foreground mb-2 flex items-center justify-between gap-1 text-[10px] font-semibold sm:text-xs">
        <span className="truncate">{title}</span>
        <span className="text-muted shrink-0">{count}</span>
      </div>
      <ul className="space-y-1.5">
        {cards.map((card) => (
          <li
            key={card.title}
            className={`bg-surface rounded-lg p-2 shadow-sm ring-1 ring-purple-100/80 ${
              card.accent ? "ring-accent/60" : ""
            } ${card.muted ? "opacity-70" : ""}`}
          >
            <p className="text-foreground line-clamp-2 text-[10px] leading-tight font-medium sm:text-[11px]">
              {card.title}
            </p>
            <span
              className={`mt-1 inline-block rounded px-1 py-px text-[9px] font-medium ${
                card.accent
                  ? "bg-accent-soft text-accent-strong"
                  : "bg-shell-bg text-muted"
              }`}
            >
              {card.tag}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

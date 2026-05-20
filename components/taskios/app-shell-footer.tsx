"use client";

import Link from "next/link";

import { useAuth } from "@/components/providers/auth-provider";

const FOOTER_LINKS = {
  product: [
    { label: "Возможности", href: "#" },
    { label: "Тарифы", href: "#" },
  ],
  company: [
    { label: "О проекте", href: "#" },
    { label: "Блог", href: "#" },
    { label: "Вакансии", href: "#" },
  ],
  support: [
    { label: "Справка", href: "#" },
    { label: "Документация", href: "#" },
    { label: "Связаться с нами", href: "#" },
  ],
  legal: [
    { label: "Конфиденциальность", href: "#" },
    { label: "Условия использования", href: "#" },
  ],
} as const;

export function AppShellFooter() {
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const productLinks = [
    { label: "Доски", href: user ? "/boards" : "/register" },
    ...FOOTER_LINKS.product,
  ];

  return (
    <footer className="border-accent-soft/60 bg-shell-bg text-foreground mt-auto border-t">
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="text-accent-strong inline-flex items-center gap-2 text-lg font-bold tracking-tight"
            >
              <span
                className="bg-accent-soft flex h-9 w-9 items-center justify-center rounded-2xl text-base shadow-inner ring-1 ring-purple-200/50"
                aria-hidden
              >
                ✓
              </span>
              Taskios
            </Link>
            <p className="text-muted mt-3 max-w-sm text-sm leading-relaxed">
              Канбан-доски для фрилансеров и небольших команд: задачи, статусы
              и drag &amp; drop в одном спокойном интерфейсе.
            </p>
          </div>

          <FooterColumn title="Продукт" links={productLinks} />
          <FooterColumn title="Компания" links={FOOTER_LINKS.company} />
          <FooterColumn title="Поддержка" links={FOOTER_LINKS.support} />
        </div>

        <div className="border-accent-soft/40 text-muted mt-10 flex flex-col gap-4 border-t pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Taskios. Все права защищены.</p>
          <nav
            className="flex flex-wrap gap-x-6 gap-y-2"
            aria-label="Правовая информация"
          >
            {FOOTER_LINKS.legal.map((link) => (
              <FooterLink key={link.label} {...link} />
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="text-foreground text-sm font-semibold">{title}</h2>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <FooterLink {...link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterLink({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="text-muted hover:text-accent-strong text-sm transition-colors"
    >
      {label}
    </Link>
  );
}

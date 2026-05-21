"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/modules/user/providers/auth-provider";
import { getUserInitial } from "@/modules/user/model/auth-types";

export function AppShellUserMenu() {
  const router = useRouter();
  const { user, isLoading, setUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.replace("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <span
        className="bg-accent-soft/60 hidden h-9 w-9 rounded-full sm:block"
        aria-hidden
      />
    );
  }

  if (user) {
    return (
      <>
        <div
          className="bg-accent-soft text-accent-strong flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold sm:flex"
          title={user.name}
          aria-label={`Профиль: ${user.name}`}
        >
          {getUserInitial(user.name)}
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
          className="text-muted hover:bg-surface hover:text-foreground flex h-10 w-10 items-center justify-center rounded-2xl transition-colors disabled:opacity-60"
          aria-label="Выйти из аккаунта"
        >
          <LogoutIcon />
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="text-muted hover:text-foreground rounded-xl px-2 py-2 text-sm font-medium sm:px-3"
      >
        Вход
      </Link>
      <Link
        href="/register"
        className="bg-surface text-foreground border-accent-soft/80 rounded-2xl border px-2 py-2 text-sm font-semibold shadow-sm transition-colors hover:border-purple-300 sm:px-3"
      >
        Регистрация
      </Link>
    </>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

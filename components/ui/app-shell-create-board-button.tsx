"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/modules/user/providers/auth-provider";

export function AppShellCreateBoardButton() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const handleClick = () => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    router.push("/boards");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      title="Мои доски"
      className="bg-accent-soft text-accent-strong hover:bg-surface flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm ring-1 ring-purple-200/50 transition-colors disabled:opacity-60"
      aria-label="Мои доски"
    >
      <BoardsListIcon />
    </button>
  );
}

function BoardsListIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.5 6.5 5.8 8.8 9.2 5.2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="12" y="4.5" width="10" height="4" rx="2" fill="currentColor" />
      <path
        d="M3.5 12.5 5.8 14.8 9.2 11.2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="12" y="10.5" width="10" height="4" rx="2" fill="currentColor" />
      <path
        d="M3.5 18.5 5.8 20.8 9.2 17.2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="12" y="16.5" width="10" height="4" rx="2" fill="currentColor" />
    </svg>
  );
}

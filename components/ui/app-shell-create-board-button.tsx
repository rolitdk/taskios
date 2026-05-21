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
      className="bg-accent text-foreground hover:bg-accent-strong flex h-10 w-10 items-center justify-center rounded-2xl text-xl font-light text-white shadow-sm transition-colors disabled:opacity-60"
      aria-label="Создать доску"
    >
      +
    </button>
  );
}

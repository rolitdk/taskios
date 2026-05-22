"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { PublicUser } from "@/modules/user/model/auth-types";
import { dedupeAsync } from "@/shared/lib/dedupe-async";

type AuthContextValue = {
  user: PublicUser | null;
  isLoading: boolean;
  setUser: (user: PublicUser | null) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    await dedupeAsync("auth:bootstrap", async () => {
      try {
        let response = await fetch("/api/auth/me");

        if (response.status === 401) {
          const refreshResponse = await fetch("/api/auth/refresh", {
            method: "POST",
          });
          if (refreshResponse.ok) {
            response = await fetch("/api/auth/me");
          }
        }

        if (response.ok) {
          const data = (await response.json()) as { user: PublicUser };
          setUser(data.user);
          return;
        }
        setUser(null);
      } catch {
        setUser(null);
      }
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await refreshUser();
      if (!cancelled) {
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const value = useMemo(
    () => ({ user, isLoading, setUser, refreshUser }),
    [user, isLoading, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

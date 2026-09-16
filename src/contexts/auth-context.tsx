"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  clearSession,
  readSession,
  writeSession,
  type Session,
} from "@/lib/auth-storage";
import type { User } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { onUnauthorized } from "@/lib/auth-events";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  signIn: (session: Session) => void;
  signOut: () => void;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const stored = readSession();

    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do localStorage no mount; não pode rodar no SSR
    setSession(stored);
    setStatus(stored ? "authenticated" : "unauthenticated");
  }, []);

  const queryClient = useQueryClient();

  const signIn = useCallback((next: Session) => {
    writeSession(next);
    setSession(next);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    queryClient.clear();
    setSession(null);
    setStatus("unauthenticated");
  }, [queryClient]);

  useEffect(() => onUnauthorized(signOut), [signOut]);

  const updateUser = useCallback(
    (user: User) => {
      if (!session) {
        return;
      }

      const next = { ...session, user };

      writeSession(next);
      setSession(next);
    },
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      token: session?.accessToken ?? null,
      signIn,
      signOut,
      updateUser
    }),
    [status, session, signIn, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth necessita estar em <AuthProvider>.");
  }

  return context;
}

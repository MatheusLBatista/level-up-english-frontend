"use client";

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
import { onUnauthorized, type UnauthorizedReason } from "@/lib/auth-events";
import { onSessionRefreshed } from "@/lib/auth-events";
import { logout } from "@/services/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  signIn: (session: Session) => void;
  signOut: () => void;
  updateUser: (user: User) => void;
  /** Por que a última sessão caiu sozinha; o login usa para avisar. */
  signOutReason: UnauthorizedReason | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [signOutReason, setSignOutReason] = useState<UnauthorizedReason | null>(
    null,
  );

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
    setSignOutReason(null);
  }, []);

  const clearLocalSession = useCallback(() => {
    clearSession();
    queryClient.clear();
    setSession(null);
    setStatus("unauthenticated");
  }, [queryClient]);

  // Sair pelo botão também derruba a sessão no servidor. Limpa a local antes,
  // para a tela não esperar a rede; se a chamada falhar, o usuário sai igual.
  const signOut = useCallback(() => {
    const refreshToken = session?.refreshToken;

    clearLocalSession();
    setSignOutReason(null);

    if (refreshToken) {
      logout(refreshToken).catch(() => {});
    }
  }, [session, clearLocalSession]);

  // Sessão recusada pela API (refresh falhou ou conta desativada): não há o
  // que encerrar no servidor, só limpar o navegador e guardar o motivo.
  useEffect(
    () =>
      onUnauthorized((reason) => {
        clearLocalSession();
        setSignOutReason(reason);
      }),
    [clearLocalSession],
  );
  useEffect(
    () =>
      onSessionRefreshed((next) => {
        writeSession(next);
        setSession(next);
      }),
    [],
  );

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
      updateUser,
      signOutReason,
    }),
    [status, session, signIn, signOut, updateUser, signOutReason],
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

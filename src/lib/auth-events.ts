import type { Session } from "./auth-storage";

type SessionListener = (session: Session) => void;
const sessionListeners = new Set<SessionListener>();

export function emitSessionRefreshed(session: Session) {
  for (const listener of sessionListeners) {
    listener(session);
  }
}

export function onSessionRefreshed(listener: SessionListener) {
  sessionListeners.add(listener);

  return () => {
    sessionListeners.delete(listener);
  };
}

/**
 * Por que a API recusou a sessão: `expired` quando nem o refresh funcionou,
 * `disabled` quando o admin desativou a conta durante o uso.
 */
export type UnauthorizedReason = "expired" | "disabled";

type Listener = (reason: UnauthorizedReason) => void;
const listeners = new Set<Listener>();

export function emitUnauthorized(reason: UnauthorizedReason = "expired") {
  for (const listener of listeners) {
    listener(reason);
  }
}

export function onUnauthorized(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

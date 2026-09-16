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

type Listener = () => void;
const listeners = new Set<Listener>();

export function emitUnauthorized() {
  for (const listener of listeners) {
    listener();
  }
}

export function onUnauthorized(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

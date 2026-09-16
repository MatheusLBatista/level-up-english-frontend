import { emitSessionRefreshed, emitUnauthorized } from "./auth-events";
import { readSession, type Session } from "./auth-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL não está definida.",
  );
}

type ApiErrorItem = {
  path?: string;
  message: string;
};

type ApiEnvelope<T> = {
  message: string;
  data: T;
  errors: ApiErrorItem[];
};

type RefreshData = {
  accessToken: string;
  refreshToken: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly errors: ApiErrorItem[];

  constructor(message: string, status: number, errors: ApiErrorItem[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
};

async function requestNewTokens(): Promise<string | null> {
  const session = readSession();

  if (!session?.refreshToken) {
    return null;
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  let envelope: ApiEnvelope<RefreshData> | null = null;

  try {
    envelope = await response.json();
  } catch {
    return null;
  }

  if (!envelope?.data?.accessToken) {
    return null;
  }

  const next: Session = {
    ...session,
    accessToken: envelope.data.accessToken,
    refreshToken: envelope.data.refreshToken,
  };

  emitSessionRefreshed(next);

  return next.accessToken;
}

let refreshInFlight: Promise<string | null> | null = null;

function refreshOnce() {
  refreshInFlight ??= requestNewTokens().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  { body, token, headers, ...init }: ApiFetchOptions = {},
): Promise<T> {
  const send = (accessToken?: string) =>
    fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

  let response = await send(token);

  if (response.status === 401 && token) {
    const stored = readSession()?.accessToken;

    const accessToken =
      stored && stored !== token ? stored : await refreshOnce();

    if (accessToken) {
      response = await send(accessToken);
    }

    if (!accessToken || response.status === 401) {
      emitUnauthorized();
    }
  }

  let envelope: ApiEnvelope<T> | null = null;

  try {
    envelope = await response.json();
  } catch {
    
  }

  if (!response.ok) {
    throw new ApiError(
      envelope?.message ??
        `Erro ${response.status} ao chamar a API. Tente novamente em instantes.`,
      response.status,
      envelope?.errors ?? [],
    );
  }

  if (!envelope) {
    throw new ApiError("Resposta inesperada da API.", response.status);
  }

  return envelope.data;
}

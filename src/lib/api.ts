import { emitSessionRefreshed, emitUnauthorized } from "./auth-events";
import { readSession, type Session } from "./auth-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * O backend responde 403 com esta mensagem (messages.auth.accountLocked) quando
 * a conta foi desativada, e não manda outro campo que a diferencie de um 403
 * de permissão. Se a mensagem mudar lá, precisa mudar aqui também.
 */
const ACCOUNT_DISABLED_MESSAGE =
  "Conta bloqueada. Entre em contato com o suporte.";

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL não está definida.");
}

/**
 * Arquivos enviados (como a foto de perfil) vêm da API com caminho relativo,
 * servidos pelo mesmo host dela.
 */
export function apiAssetUrl(path: string | null | undefined) {
  if (!path) {
    return undefined;
  }

  return /^https?:\/\//.test(path) ? path : `${API_URL}${path}`;
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

/**
 * O backend responde 498 para access token inválido ou expirado e 401 quando o
 * refresh token não está mais no banco (logout ou revogação). Nos dois casos a
 * sessão foi recusada e vale tentar renovar.
 */
function isSessionRejected(status: number) {
  return status === 401 || status === 498;
}

export async function apiFetch<T>(
  path: string,
  { body, token, headers, ...init }: ApiFetchOptions = {},
): Promise<T> {
  // FormData vai cru: o navegador monta o Content-Type com o boundary.
  const isForm = body instanceof FormData;

  const send = (accessToken?: string) =>
    fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: isForm
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
      cache: "no-store",
    });

  let response = await send(token);

  if (isSessionRejected(response.status) && token) {
    const stored = readSession()?.accessToken;

    const accessToken =
      stored && stored !== token ? stored : await refreshOnce();

    if (accessToken) {
      response = await send(accessToken);
    }

    if (!accessToken || isSessionRejected(response.status)) {
      emitUnauthorized();
    }
  }

  let envelope: ApiEnvelope<T> | null = null;

  try {
    envelope = await response.json();
  } catch {}

  if (
    response.status === 403 &&
    token &&
    envelope?.message === ACCOUNT_DISABLED_MESSAGE
  ) {
    emitUnauthorized("disabled");
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

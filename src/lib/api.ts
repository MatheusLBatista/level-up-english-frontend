//TODO: review this file

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL não está definida. Confira o seu .env.local (veja .env.example).",
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
  /** Access token JWT, quando a rota exigir `Authorization: Bearer`. */
  token?: string;
};

export async function apiFetch<T>(
  path: string,
  { body, token, headers, ...init }: ApiFetchOptions = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // Os dados são por usuário logado: nunca reaproveitar o cache de fetch
    // do Next entre requisições autenticadas.
    cache: "no-store",
  });

  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = await response.json();
  } catch {
    // A API roda no plano free do Render: ao "acordar" de hibernação ela
    // pode responder com HTML/texto (ex.: 503) em vez do envelope JSON de
    // sempre. Tratamos isso como um erro genérico abaixo, sem quebrar.
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

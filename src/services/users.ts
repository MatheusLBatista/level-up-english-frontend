import { apiFetch } from "@/lib/api";
import type {
  DataExport,
  Paginated,
  Performance,
  User,
  XpHistoryItem,
} from "@/lib/types";

export function getUserById(id: string, token: string) {
  return apiFetch<User>(`/users/${id}`, { token });
}

export type UpdateUserBody = {
  name?: string;
  /** Só admin. `null` tira o aluno da turma. */
  class?: string | null;
  /** Só admin. */
  active?: boolean;
  /** Só o próprio usuário ou o admin; o professor recebe 403. */
  show_in_global_ranking?: boolean;
};

export function updateUser(id: string, body: UpdateUserBody, token: string) {
  return apiFetch<User>(`/users/${id}`, { method: "PATCH", body, token });
}

export function listStudentsByClass(classId: string, token: string) {
  const params = new URLSearchParams({
    role: "student",
    class: classId,
    active: "true",
    limit: "100",
  });

  return apiFetch<Paginated<User>>(`/users?${params}`, { token });
}

/** Professores da escola (são poucos: vem tudo de uma vez, até 100). */
export function listTeachers(token: string, active: boolean | null = true) {
  const params = new URLSearchParams({ role: "teacher", limit: "100" });

  if (active !== null) {
    params.set("active", String(active));
  }

  return apiFetch<Paginated<User>>(`/users?${params}`, { token });
}

export type StudentFilters = {
  page?: number;
  limit?: number;
  name?: string;
  classId?: string | null;
  /** `null` traz ativos e inativos. */
  active?: boolean | null;
  /** Situação do termo dos responsáveis; sem valor, traz todos. */
  guardianConsent?: GuardianConsentFilter | null;
};

export type GuardianConsentFilter = "pending" | "recorded" | "revoked";

export function listStudents(token: string, filters: StudentFilters = {}) {
  const params = new URLSearchParams({
    role: "student",
    limit: String(filters.limit ?? 12),
    page: String(filters.page ?? 1),
  });

  if (filters.name) {
    // Vai cru: o backend escapa o texto antes de usar no $regex.
    params.set("name", filters.name);
  }

  if (filters.classId) {
    params.set("class", filters.classId);
  }

  if (filters.active !== null && filters.active !== undefined) {
    params.set("active", String(filters.active));
  }

  if (filters.guardianConsent) {
    params.set("guardian_consent", filters.guardianConsent);
  }

  return apiFetch<Paginated<User>>(`/users?${params}`, { token });
}

/** Registra que a escola recebeu o termo assinado (aluno ativo e pendente). */
export function recordGuardianConsent(id: string, token: string) {
  return apiFetch<User>(`/users/${id}/guardian-consent`, {
    method: "PATCH",
    token,
  });
}

/** Revoga o consentimento; o backend também desativa a conta do aluno. */
export function revokeGuardianConsent(id: string, token: string) {
  return apiFetch<User>(`/users/${id}/guardian-consent/revoke`, {
    method: "POST",
    token,
  });
}

/** Só admin. Anonimiza o aluno na hora; não tem volta (art. 18, VI). */
export function eraseStudentData(id: string, token: string) {
  return apiFetch<User>(`/users/${id}/erasure`, {
    method: "POST",
    body: { confirm: true },
    token,
  });
}

/** Só admin. Todos os dados do aluno em JSON (art. 18, II). */
export function exportStudentData(id: string, token: string) {
  return apiFetch<DataExport>(`/users/${id}/data-export`, { token });
}

export type XpHistoryFilters = {
  page?: number;
  limit?: number;
};

export function getXpHistory(
  studentId: string,
  token: string,
  filters: XpHistoryFilters = {},
) {
  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    limit: String(filters.limit ?? 10),
  });

  return apiFetch<Paginated<XpHistoryItem>>(
    `/users/${studentId}/xp-history?${params}`,
    { token },
  );
}

export type PerformancePeriod = {
  /** ISO 8601 com fuso, como `date.toISOString()`. */
  from?: string;
  to?: string;
};

export function getPerformance(
  studentId: string,
  token: string,
  period: PerformancePeriod = {},
) {
  const params = new URLSearchParams();

  if (period.from) {
    params.set("from", period.from);
  }

  if (period.to) {
    params.set("to", period.to);
  }

  const query = params.size > 0 ? `?${params}` : "";

  return apiFetch<Performance>(`/users/${studentId}/performance${query}`, {
    token,
  });
}

export function uploadAvatar(id: string, file: File, token: string) {
  const body = new FormData();
  body.append("avatar", file);

  return apiFetch<User>(`/users/${id}/avatar`, {
    method: "PATCH",
    body,
    token,
  });
}

export function removeAvatar(id: string, token: string) {
  return apiFetch<User>(`/users/${id}/avatar`, { method: "DELETE", token });
}

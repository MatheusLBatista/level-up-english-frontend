export type FormDraft<T> = {
  values: T;
  /** Valores originais do item quando o rascunho foi salvo. */
  base: T;
  savedAt: string;
};

/**
 * Uma chave por formulário, usuário e item editado (`new` para cadastro),
 * para rascunhos de pessoas e itens diferentes não se misturarem.
 */
export function formDraftKey(
  scope: string,
  userId: string,
  itemId: string | null,
) {
  return `levelup-english:${scope}-draft:${userId}:${itemId ?? "new"}`;
}

export function isSameFormValues(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Valida o rascunho lido do storage. Com `checkBase` (edição), descarta o
 * rascunho se o item mudou desde que ele foi salvo — por outra pessoa ou em
 * outro aparelho —, para não sobrescrever a versão mais nova.
 */
export function parseFormDraft<T>(
  raw: string | null,
  base: T,
  { checkBase }: { checkBase: boolean },
): FormDraft<T> | null {
  if (!raw) {
    return null;
  }

  try {
    const draft = JSON.parse(raw) as FormDraft<T> | null;

    if (!draft || typeof draft.values !== "object" || !draft.values) {
      return null;
    }

    if (checkBase && !isSameFormValues(draft.base, base)) {
      return null;
    }

    return draft;
  } catch {
    return null;
  }
}

export function readFormDraft<T>(
  key: string,
  base: T,
  options: { checkBase: boolean },
): FormDraft<T> | null {
  try {
    return parseFormDraft(window.localStorage.getItem(key), base, options);
  } catch {
    return null;
  }
}

export function saveFormDraft<T>(key: string, values: T, base: T) {
  const draft: FormDraft<T> = {
    values,
    base,
    savedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    return;
  }
}

export function clearFormDraft(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    return;
  }
}

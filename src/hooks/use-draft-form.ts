"use client";

import { useEffect, useState } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import { useAuth } from "@/contexts/auth-context";
import { useBeforeUnload } from "@/hooks/use-before-unload";
import {
  clearFormDraft,
  formDraftKey,
  isSameFormValues,
  readFormDraft,
  saveFormDraft,
} from "@/lib/form-draft";

type UseDraftFormOptions<T extends FieldValues> = {
  /** Nome do formulário na chave do storage, ex.: "mission-form". */
  scope: string;
  /** Id do item editado; `null` no cadastro. */
  itemId: string | null;
  /** Valores originais; lido uma vez, na montagem. */
  defaultValues: () => T;
  resolver: Resolver<T>;
  /** Avisa se o formulário está diferente do original (há rascunho). */
  onDirtyChange: (dirty: boolean) => void;
};

/**
 * `useForm` com rascunho automático no navegador: restaura o rascunho ao
 * montar, salva a cada alteração e apaga quando os valores voltam ao original.
 */
export function useDraftForm<T extends FieldValues>({
  scope,
  itemId,
  defaultValues,
  resolver,
  onDirtyChange,
}: UseDraftFormOptions<T>) {
  const { user } = useAuth();
  const key = user ? formDraftKey(scope, user._id, itemId) : null;

  const [original] = useState(defaultValues);
  const [restoredDraft, setRestoredDraft] = useState(() =>
    key ? readFormDraft(key, original, { checkBase: itemId !== null }) : null,
  );

  const form = useForm<T>({
    resolver,
    defaultValues: (restoredDraft?.values ?? original) as DefaultValues<T>,
  });

  useEffect(() => {
    if (!key) {
      return;
    }
    const draftKey = key;

    function sync(values: T) {
      const changed = !isSameFormValues(values, original);

      if (changed) {
        saveFormDraft(draftKey, values, original);
      } else {
        clearFormDraft(draftKey);
      }

      onDirtyChange(changed);
    }

    sync(form.getValues());
    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => sync(values),
    });
  }, [form, key, original, onDirtyChange]);

  /** Volta ao original e apaga o rascunho (botão "Descartar" da faixa). */
  function discardDraft() {
    form.reset(original);
    if (key) {
      clearFormDraft(key);
    }
    setRestoredDraft(null);
    onDirtyChange(false);
  }

  /** Apaga o rascunho depois de salvar com sucesso. */
  function clearDraft() {
    if (key) {
      clearFormDraft(key);
    }
  }

  return { form, restoredDraft, discardDraft, clearDraft };
}

type UseDraftDialogOptions = {
  open: boolean;
  scope: string;
  itemId: string | null;
  /** Enquanto salva, o dialog não fecha. */
  isPending: boolean;
  onClose: () => void;
};

/**
 * Lado do dialog de um formulário com `useDraftForm`: pede confirmação ao
 * fechar com alterações e avisa o navegador ao recarregar ou fechar a aba.
 */
export function useDraftDialog({
  open,
  scope,
  itemId,
  isPending,
  onClose,
}: UseDraftDialogOptions) {
  const { user } = useAuth();
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  useBeforeUnload(open && dirty);

  function close() {
    setDirty(false);
    setConfirmClose(false);
    onClose();
  }

  function discardAndClose() {
    if (user) {
      clearFormDraft(formDraftKey(scope, user._id, itemId));
    }
    close();
  }

  function handleOpenChange(next: boolean) {
    if (next || isPending) {
      return;
    }

    if (dirty) {
      setConfirmClose(true);
      return;
    }

    close();
  }

  return {
    close,
    handleOpenChange,
    onDirtyChange: setDirty,
    confirmDialog: {
      open: confirmClose,
      onOpenChange: setConfirmClose,
      onKeepDraft: close,
      onDiscard: discardAndClose,
    },
  };
}

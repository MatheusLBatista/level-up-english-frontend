"use client";

import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

type GuardianConsentCheckboxProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onBlur?: () => void;
  disabled?: boolean;
  /** Mensagem de erro (ex.: o 400 da API em `path: guardian_consent`). */
  error?: string;
  /** Texto do rótulo; muda na reativação, que exige um termo novo. */
  label?: string;
};

/**
 * Confirmação de que a escola recebeu o termo em papel assinado pelos
 * responsáveis. Não é um aceite do aluno. Obrigatória para criar aluno e para
 * reativar aluno com consentimento revogado.
 */
export function GuardianConsentCheckbox({
  id,
  checked,
  onCheckedChange,
  onBlur,
  disabled = false,
  error,
  label = "Termo de consentimento assinado pelos responsáveis recebido",
}: GuardianConsentCheckboxProps) {
  const descriptionId = `${id}-description`;

  return (
    <Field
      orientation="horizontal"
      data-invalid={Boolean(error)}
      className="border-border bg-muted/40 rounded-xl border p-3"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(next) => onCheckedChange(next === true)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        aria-required
        disabled={disabled}
      />
      <FieldContent>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <FieldDescription id={descriptionId}>
          Obrigatório. Marque só com o termo em papel em mãos. Não tem o modelo?{" "}
          <Link href="/termo-responsaveis" target="_blank" rel="noopener">
            Imprimir termo
          </Link>
        </FieldDescription>
        {error && <FieldError>{error}</FieldError>}
      </FieldContent>
    </Field>
  );
}

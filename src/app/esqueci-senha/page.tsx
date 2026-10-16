import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { GuestGuard } from "@/components/auth/guest-guard";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
};

export default function EsqueciSenhaPage() {
  return (
    <GuestGuard>
      <AuthShell>
        <ForgotPasswordForm />
      </AuthShell>
    </GuestGuard>
  );
}

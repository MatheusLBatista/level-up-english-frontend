import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { GuestGuard } from "@/components/auth/guest-guard";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
};

export default function EsqueciSenhaPage() {
  return (
    <GuestGuard>
      <main className="flex flex-1 items-center justify-center p-6">
        <ForgotPasswordForm />
      </main>
    </GuestGuard>
  );
}

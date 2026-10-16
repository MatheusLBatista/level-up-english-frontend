import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { GuestGuard } from "@/components/auth/guest-guard";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <GuestGuard>
      <AuthShell>
        <LoginForm />
      </AuthShell>
    </GuestGuard>
  );
}

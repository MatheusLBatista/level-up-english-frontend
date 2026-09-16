import type { Metadata } from "next";
import { GuestGuard } from "@/components/auth/guest-guard";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <GuestGuard>
      <main className="flex flex-1 items-center justify-center p-6">
        <LoginForm />
      </main>
    </GuestGuard>
  );
}

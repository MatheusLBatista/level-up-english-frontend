import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { GuestGuard } from "@/components/auth/guest-guard";
import { NewPasswordForm } from "@/components/auth/new-password-form";

export const metadata: Metadata = {
  title: "Criar senha",
};

type PageProps = {
  searchParams: Promise<{ code?: string | string[] }>;
};

export default async function SetPasswordPage({ searchParams }: PageProps) {
  const { code } = await searchParams;

  return (
    <GuestGuard>
      <AuthShell>
        <NewPasswordForm
          mode="welcome"
          code={typeof code === "string" && code ? code : null}
        />
      </AuthShell>
    </GuestGuard>
  );
}

import type { Metadata } from "next";
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
      <main className="flex flex-1 items-center justify-center p-6">
        <NewPasswordForm
          mode="welcome"
          code={typeof code === "string" && code ? code : null}
        />
      </main>
    </GuestGuard>
  );
}

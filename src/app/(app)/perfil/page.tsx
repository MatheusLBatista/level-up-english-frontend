import type { Metadata } from "next";
import { ProfileByRole } from "@/components/profile/profile-by-role";

export const metadata: Metadata = {
  title: "Perfil",
};

export default function PerfilPage() {
  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6">
      <ProfileByRole />
    </main>
  );
}

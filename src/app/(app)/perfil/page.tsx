import type { Metadata } from "next";
import { ProfileScreen } from "@/components/profile/profile-screen";

export const metadata: Metadata = {
  title: "Perfil",
};

export default function PerfilPage() {
  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6">
      <ProfileScreen />
    </main>
  );
}

import { redirect } from "next/navigation";

/**
 * A raiz não tem conteúdo próprio: manda para o login, e o `GuestGuard` de lá
 * leva quem já está logado para a home do seu papel.
 */
export default function Home() {
  redirect("/login");
}

"use client";

import { PlayIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function WelcomeBanner() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ").at(0) ?? "";

  return (
    <section className="bg-banner-gradient border-border/30 relative overflow-hidden rounded-3xl border p-6 sm:p-10">
      <h1 className="from-primary to-brand-mission bg-linear-to-r bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
        Welcome {firstName}!
      </h1>
      <p className="mt-2 text-base font-medium sm:text-lg">
        Continue sua jornada de aprendizado hoje
      </p>

      <Button asChild size="lg" className="mt-6 rounded-full">
        <Link href="/missoes">
          <PlayIcon />
          Ver Missões
        </Link>
      </Button>
    </section>
  );
}

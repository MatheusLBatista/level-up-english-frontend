"use client";

import { PlayIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function WelcomeBanner() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ").at(0) ?? "";

  return (
    <section className="bg-notebook-page border-border rounded-lg border py-8 pr-6 pl-14 sm:py-10 sm:pr-10 sm:pl-16">
      <h1 className="font-heading text-display font-semibold">
        Welcome {firstName}!
      </h1>
      <p className="text-muted-foreground mt-2 text-base sm:text-lg">
        Continue sua jornada de aprendizado hoje
      </p>

      <Button asChild size="lg" className="mt-6">
        <Link href="/missoes">
          <PlayIcon />
          Ver Missões
        </Link>
      </Button>
    </section>
  );
}

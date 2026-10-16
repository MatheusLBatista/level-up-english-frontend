"use client";

import { PlayIcon, RotateCcwIcon } from "lucide-react";
import Link from "next/link";
import { TeacherNote } from "@/components/dashboard/teacher-note";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMissions } from "@/hooks/use-mission";
import {
  indexProgress,
  missionXpLeft,
  selectNextMission,
} from "@/lib/missions";

function NextMissionLine() {
  const userQuery = useCurrentUser();
  const missionsQuery = useMissions();

  if (!userQuery.data || !missionsQuery.data) {
    return (
      <>
        <p className="text-muted-foreground mt-2 text-base sm:text-lg">
          Continue sua jornada de aprendizado hoje
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/missoes">
            <PlayIcon />
            Ver missões
          </Link>
        </Button>
      </>
    );
  }

  const next = selectNextMission(missionsQuery.data.docs, userQuery.data);

  if (!next) {
    return (
      <>
        <p className="text-muted-foreground mt-2 text-base sm:text-lg">
          Você concluiu todas as missões. Quando seu professor publicar outra,
          ela aparece aqui.
        </p>
        <Button asChild size="lg" variant="outline" className="mt-6">
          <Link href="/missoes">Ver missões</Link>
        </Button>
      </>
    );
  }

  const { mission, kind } = next;
  const entry = indexProgress(userQuery.data).get(mission._id);
  const title = (
    <span className="font-english text-foreground">{mission.title}</span>
  );

  return (
    <>
      <p className="text-muted-foreground mt-2 text-base sm:text-lg">
        {kind === "new" && <>Próxima missão: {title}</>}
        {kind === "continue" && <>Você parou no meio de {title}</>}
        {kind === "retry" && (
          <>
            Ainda dá para ganhar +{missionXpLeft(mission, entry)} XP em {title}
          </>
        )}
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href={`/missoes/${mission._id}`}>
          {kind === "retry" ? <RotateCcwIcon /> : <PlayIcon />}
          {kind === "new"
            ? "Começar missão"
            : kind === "continue"
              ? "Continuar"
              : "Melhorar a nota"}
        </Link>
      </Button>
    </>
  );
}

export function WelcomeBanner() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ").at(0) ?? "";

  return (
    <section className="bg-notebook-page border-border flex flex-col gap-6 rounded-lg border py-8 pr-6 pl-14 sm:flex-row sm:items-end sm:justify-between sm:py-10 sm:pr-10 sm:pl-16">
      <div>
        <h1 className="font-heading text-display font-semibold">
          Welcome {firstName}!
        </h1>
        <NextMissionLine />
      </div>

      <TeacherNote />
    </section>
  );
}

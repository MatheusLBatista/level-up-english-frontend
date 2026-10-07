"use client";

import { SearchXIcon, ShieldCheckIcon } from "lucide-react";
import { parseAsStringLiteral, useQueryStates } from "nuqs";
import { AttitudeCard } from "@/components/admin/attitudes/attitude-card";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAttitudes } from "@/hooks/use-attitudes";

const attitudeStatuses = ["ativas", "desativadas"] as const;

const statusOptions = [
  { value: "ativas", label: "Ativas" },
  { value: "desativadas", label: "Desativadas" },
] as const;

export function AttitudesScreen() {
  const [{ status }, setFilters] = useQueryStates({
    status: parseAsStringLiteral(attitudeStatuses).withDefault("ativas"),
  });

  const attitudesQuery = useAttitudes(status === "ativas");
  const attitudes = attitudesQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheckIcon className="text-primary size-8" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Atitudes de aula
            </h1>
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              Gamificação em tempo real
            </p>
          </div>
        </div>

        <SegmentedFilter
          label="Filtrar atitudes por status"
          options={statusOptions}
          value={status}
          onChange={(next) => void setFilters({ status: next })}
        />
      </div>

      {attitudesQuery.isError ? (
        <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-4">
          <p className="text-sm">{attitudesQuery.error.message}</p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => void attitudesQuery.refetch()}
          >
            Tentar de novo
          </Button>
        </div>
      ) : !attitudes ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : attitudes.length === 0 ? (
        <div className="text-muted-foreground border-border/40 flex flex-col items-center gap-2 rounded-2xl border border-dashed p-10 text-center text-sm">
          <SearchXIcon className="size-6" />
          {status === "ativas"
            ? "Nenhuma atitude ativa ainda."
            : "Nenhuma atitude desativada."}
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {attitudes.map((attitude) => (
            <AttitudeCard key={attitude._id} attitude={attitude} />
          ))}
        </ul>
      )}
    </div>
  );
}

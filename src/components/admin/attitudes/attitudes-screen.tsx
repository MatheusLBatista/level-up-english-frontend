"use client";

import {
  Loader2Icon,
  RotateCcwIcon,
  SearchXIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from "lucide-react";
import { parseAsStringLiteral, useQueryStates } from "nuqs";
import { useState } from "react";
import { AttitudeCard } from "@/components/admin/attitudes/attitude-card";
import { DeactivateAttitudeDialog } from "@/components/admin/attitudes/deactivate-attitude-dialog";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAttitudes } from "@/hooks/use-attitudes";
import { useSetAttitudeActive } from "@/hooks/use-set-attitude-active";
import type { Attitude } from "@/lib/types";

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

  const [attitudeToDeactivate, setAttitudeToDeactivate] =
    useState<Attitude | null>(null);
  const reactivate = useSetAttitudeActive();

  function handleToggleActive(attitude: Attitude) {
    if (attitude.active) {
      setAttitudeToDeactivate(attitude);
    } else {
      reactivate.mutate({ attitude, active: true });
    }
  }

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

      {reactivate.isError && (
        <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-3">
          <p className="text-sm">
            Não foi possível reativar {reactivate.variables?.attitude.name}:{" "}
            {reactivate.error.message}
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={() => reactivate.reset()}
          >
            Fechar
          </Button>
        </div>
      )}

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
          {attitudes.map((attitude) => {
            const busy =
              reactivate.isPending &&
              reactivate.variables?.attitude._id === attitude._id;

            return (
              <AttitudeCard
                key={attitude._id}
                attitude={attitude}
                actions={
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={
                      attitude.active
                        ? `Desativar ${attitude.name}`
                        : `Reativar ${attitude.name}`
                    }
                    title={attitude.active ? "Desativar" : "Reativar"}
                    className={
                      attitude.active
                        ? "hover:text-destructive"
                        : "hover:text-brand-done"
                    }
                    disabled={busy}
                    onClick={() => handleToggleActive(attitude)}
                  >
                    {busy ? (
                      <Loader2Icon className="animate-spin" />
                    ) : attitude.active ? (
                      <Trash2Icon />
                    ) : (
                      <RotateCcwIcon />
                    )}
                  </Button>
                }
              />
            );
          })}
        </ul>
      )}

      <DeactivateAttitudeDialog
        attitude={attitudeToDeactivate}
        onClose={() => setAttitudeToDeactivate(null)}
      />
    </div>
  );
}

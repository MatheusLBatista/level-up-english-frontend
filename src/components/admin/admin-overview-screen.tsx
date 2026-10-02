"use client";

import { LayoutGridIcon } from "lucide-react";

export function AdminOverviewScreen() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <LayoutGridIcon className="text-primary size-8" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Geral</h1>
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Visão da escola
          </p>
        </div>
      </div>
    </div>
  );
}

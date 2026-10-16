import { formatXpDelta } from "@/lib/attitudes";
import { formatFullDate, formatRelativeTime } from "@/lib/date";
import type { XpHistoryItem, XpHistoryKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const kindLabels: Record<XpHistoryKind, string> = {
  attitude: "Atitude",
  adjustment: "Ajuste",
  mission: "Missão",
};

type XpHistoryListProps = {
  items: XpHistoryItem[];
  dimmed?: boolean;
};

export function XpHistoryList({ items, dimmed = false }: XpHistoryListProps) {
  return (
    <ol
      className={cn(
        "border-border ml-1.5 border-l transition-opacity",
        dimmed && "opacity-60",
      )}
    >
      {items.map((item) => (
        <HistoryItem key={`${item.kind}-${item.id}`} item={item} />
      ))}
    </ol>
  );
}

function describeItem(item: XpHistoryItem) {
  switch (item.kind) {
    case "attitude":
      return item.detail ? `por ${item.detail}` : null;
    case "adjustment":
      return [item.detail, item.teacher && `por ${item.teacher}`]
        .filter(Boolean)
        .join(" · ");
    case "mission":
      return item.detail;
  }
}

function HistoryItem({ item }: { item: XpHistoryItem }) {
  const description = describeItem(item);

  return (
    <li className="relative pb-4 pl-5 last:pb-0">
      <span
        aria-hidden
        className={cn(
          "absolute top-1.5 -left-[5.5px] size-2.5 rounded-full",
          item.xp < 0
            ? "bg-destructive"
            : item.xp > 0
              ? "bg-brand-done"
              : "bg-muted-foreground",
        )}
      />

      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-semibold">{item.title}</p>

        <span
          className={cn(
            "shrink-0 text-sm font-semibold tabular-nums",
            item.xp < 0
              ? "text-destructive"
              : item.xp > 0
                ? "text-brand-done"
                : "text-muted-foreground",
          )}
        >
          {formatXpDelta(item.xp)}
        </span>
      </div>

      <p className="text-muted-foreground text-xs">
        {kindLabels[item.kind]}
        {description && ` · ${description}`}
        {item.xp === 0 && " · saldo já estava em 0"}
        {item.date && (
          <>
            {" · "}
            <time dateTime={item.date} title={formatFullDate(item.date)}>
              {formatRelativeTime(item.date)}
            </time>
          </>
        )}
      </p>
    </li>
  );
}

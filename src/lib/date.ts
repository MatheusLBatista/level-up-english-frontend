const relativeFormatter = new Intl.RelativeTimeFormat("pt-BR", {
  numeric: "auto",
});

const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

export function formatRelativeTime(date: string, now = Date.now()) {
  const seconds = (new Date(date).getTime() - now) / 1000;

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return relativeFormatter.format(Math.trunc(seconds / size), unit);
    }
  }

  return "agora há pouco";
}

export function formatFullDate(date: string) {
  return fullDateFormatter.format(new Date(date));
}

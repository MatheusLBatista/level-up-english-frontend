import { ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Mission } from "@/lib/types";

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

function parseUrl(raw: string) {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

function youtubeEmbed(url: URL) {
  const id =
    url.hostname === "youtu.be"
      ? url.pathname.slice(1)
      : url.searchParams.get("v");

  return id ? `https://www.youtube.com/embed/${id}` : null;
}

const GLOSSARY_SEPARATOR = /\s+[—–-]\s+/;

function MissionContent({ content }: { content: string }) {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const pairs = lines.map((line) => line.split(GLOSSARY_SEPARATOR));
  const isGlossary =
    pairs.length > 1 && pairs.every((pair) => pair.length === 2);

  if (!isGlossary) {
    return (
      <p className="text-base leading-8 whitespace-pre-line">{content}</p>
    );
  }

  return (
    <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {pairs.map(([english, translation]) => (
        <div
          key={english}
          className="col-span-2 grid h-8 grid-cols-subgrid items-end gap-4 pb-1"
        >
          <dt className="font-english text-base leading-6 font-semibold">
            {english}
          </dt>
          <dd className="text-muted-foreground text-body leading-6">
            {translation}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function MissionMedia({ mission }: { mission: Mission }) {
  const url = mission.content_url ? parseUrl(mission.content_url) : null;
  const embed =
    url && YOUTUBE_HOSTS.has(url.hostname) ? youtubeEmbed(url) : null;

  return (
    <div className="flex flex-col gap-4">
      {embed && (
        <iframe
          src={embed}
          title={mission.title}
          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          className="border-border aspect-video w-full rounded-xl border bg-black"
        />
      )}

      {!embed && url && mission.type === "audio" && (
        <audio controls src={url.href} className="w-full">
          <track kind="captions" />
        </audio>
      )}

      {!embed && url && mission.type !== "audio" && (
        <Button asChild variant="outline" className="self-start">
          <a href={url.href} target="_blank" rel="noreferrer">
            Abrir material
            <ExternalLinkIcon />
          </a>
        </Button>
      )}

      {mission.content && <MissionContent content={mission.content} />}
    </div>
  );
}

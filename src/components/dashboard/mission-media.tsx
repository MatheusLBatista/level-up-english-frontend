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

export function MissionMedia({ mission }: { mission: Mission }) {
  const url = mission.content_url ? parseUrl(mission.content_url) : null;
  const embed = url && YOUTUBE_HOSTS.has(url.hostname) ? youtubeEmbed(url) : null;

  return (
    <div className="flex flex-col gap-4">
      {embed && (
        <iframe
          src={embed}
          title={mission.title}
          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          className="border-border/40 aspect-video w-full rounded-xl border bg-black"
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

      {mission.content && (
        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
          {mission.content}
        </p>
      )}
    </div>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiAssetUrl } from "@/lib/api";
import { getInitials } from "@/lib/user";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  user: { name: string; avatar_url?: string | null };
  className?: string;
  fallbackClassName?: string;
  /** Mostra outra imagem no lugar da salva (prévia antes de enviar). */
  src?: string;
};

export function UserAvatar({
  user,
  className,
  fallbackClassName,
  src,
}: UserAvatarProps) {
  const image = src ?? apiAssetUrl(user.avatar_url);

  return (
    <Avatar className={className}>
      {image && (
        <AvatarImage src={image} alt="" className="rounded-[inherit]" />
      )}
      <AvatarFallback
        className={cn(
          "bg-secondary text-secondary-foreground rounded-[inherit] font-semibold",
          fallbackClassName,
        )}
      >
        {getInitials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

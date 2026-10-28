import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { ProfilePhotoDialog } from "@/components/profile/profile-photo-dialog";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { ClassSummary, User } from "@/lib/types";
import { roleLabels } from "@/lib/user";

const sinceFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

type TeacherBadgeCardProps = {
  user: User;
  classes?: ClassSummary[];
};

export function TeacherBadgeCard({ user, classes }: TeacherBadgeCardProps) {
  const badgeId = user._id.slice(-6).toUpperCase();

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex flex-col items-center gap-2 self-start">
          <ProfilePhotoDialog user={user} className="rounded-2xl">
            <UserAvatar
              user={user}
              className="size-24 rounded-2xl after:rounded-2xl"
              fallbackClassName="text-3xl font-bold"
            />
          </ProfilePhotoDialog>
          <span className="text-muted-foreground text-label font-mono tracking-widest">
            ID {badgeId}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-label font-semibold">
            {roleLabels[user.role]} · LevelUp English
          </p>
          <h2 className="font-heading text-title mt-1 truncate font-semibold">
            {user.name}
          </h2>
          <p className="text-muted-foreground truncate text-sm">{user.email}</p>
          {user.createdAt && (
            <p className="text-muted-foreground mt-0.5 text-xs">
              Na plataforma desde{" "}
              {sinceFormatter.format(new Date(user.createdAt))}
            </p>
          )}

          {classes && classes.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Turmas">
              {classes.map((item) => (
                <li
                  key={item._id}
                  className="border-brand-level/40 text-brand-level rounded-md border border-dashed px-2 py-0.5 text-xs font-semibold"
                >
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-col sm:self-start">
          <EditProfileDialog user={user} />
          <ChangePasswordDialog />
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { CameraIcon, ImageUpIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { useUpdateAvatar } from "@/hooks/use-update-avatar";
import { ApiError } from "@/lib/api";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Os mesmos limites do backend (AvatarUploadMiddleware). */
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

function validatePhoto(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Escolha uma imagem JPEG, PNG ou WebP.";
  }

  if (file.size > MAX_BYTES) {
    return "A foto deve ter no máximo 2 MB.";
  }

  return null;
}

type ProfilePhotoDialogProps = {
  user: User;
  /** O avatar exibido no cartão; vira o botão que abre o diálogo. */
  children: ReactNode;
  className?: string;
};

export function ProfilePhotoDialog({
  user,
  children,
  className,
}: ProfilePhotoDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mutation = useUpdateAvatar();

  function replacePreview(next: File | null) {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(next);
    setPreview(next ? URL.createObjectURL(next) : undefined);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);

    if (!next) {
      replacePreview(null);
      setFileError(null);
      mutation.reset();
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    // Limpa o campo para a mesma foto poder ser escolhida de novo.
    event.target.value = "";

    if (!picked) {
      return;
    }

    mutation.reset();
    const error = validatePhoto(picked);
    setFileError(error);
    replacePreview(error ? null : picked);
  }

  function save(next: File | null) {
    mutation.mutate(next, { onSuccess: () => handleOpenChange(false) });
  }

  const requestError = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : "Não foi possível salvar a foto agora. Tente de novo."
    : null;
  const error = fileError ?? requestError;
  const pendingRemoval = mutation.isPending && mutation.variables === null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Trocar foto de perfil"
          className={cn(
            "group/photo focus-visible:ring-ring/50 relative shrink-0 rounded-full outline-none focus-visible:ring-[3px]",
            className,
          )}
        >
          {children}
          <span className="bg-primary text-primary-foreground ring-card absolute -right-0.5 -bottom-0.5 grid size-7 place-items-center rounded-full ring-2 transition-transform group-hover/photo:scale-110">
            <CameraIcon className="size-3.5" aria-hidden />
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Foto de perfil</DialogTitle>
          <DialogDescription>
            JPEG, PNG ou WebP de até 2 MB. A foto é cortada no centro, em
            formato quadrado.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <UserAvatar
            user={user}
            src={preview}
            className="ring-primary/40 size-32 ring-2"
            fallbackClassName="text-title"
          />

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-label="Arquivo da foto"
            onChange={handleFileChange}
          />

          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={mutation.isPending}
              onClick={() => inputRef.current?.click()}
            >
              <ImageUpIcon />
              {file ? "Escolher outra" : "Escolher foto"}
            </Button>

            {user.avatar_url && !file && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={mutation.isPending}
                onClick={() => save(null)}
              >
                {pendingRemoval ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <Trash2Icon />
                )}
                Remover foto
              </Button>
            )}
          </div>

          {error && <FieldError className="text-center">{error}</FieldError>}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>

          <Button
            disabled={!file || mutation.isPending}
            onClick={() => save(file)}
          >
            {mutation.isPending && !pendingRemoval && (
              <Loader2Icon className="animate-spin" />
            )}
            {mutation.isPending && !pendingRemoval
              ? "Enviando..."
              : "Salvar foto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

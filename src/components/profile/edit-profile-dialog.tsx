"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, PencilIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api";
import type { User } from "@/lib/types";
import { updateProfileSchema, type UpdateProfileInput } from "@/schemas/profile";
import { updateUser } from "@/services/users";

export function EditProfileDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const { token, updateUser: updateSessionUser } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name },
  });

  const mutation = useMutation({
    mutationFn: (values: UpdateProfileInput) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return updateUser(user._id, values, token);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["users", updated._id], updated);
      updateSessionUser(updated);
      setOpen(false);
    },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);

    if (!next) {
      mutation.reset();
      form.reset({ name: user.name });
    }
  }

  const requestError = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : "Não foi possível salvar agora. Tente de novo."
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PencilIcon />
          Editar perfil
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            O e-mail não pode ser alterado por aqui.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          id="edit-profile-form"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.name)}>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input
                id="name"
                autoComplete="name"
                aria-invalid={Boolean(form.formState.errors.name)}
                disabled={mutation.isPending}
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            {requestError && <FieldError>{requestError}</FieldError>}
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>

          <Button
            type="submit"
            form="edit-profile-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2Icon className="animate-spin" />}
            {mutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

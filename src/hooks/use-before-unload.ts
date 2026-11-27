import { useEffect } from "react";

/** Enquanto `active`, recarregar ou fechar a aba pede confirmação. */
export function useBeforeUnload(active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }

    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [active]);
}

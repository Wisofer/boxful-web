"use client";
import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
export function useNavigateWithPending() {
  const router = useRouter();
  const [navPending, startTransition] = useTransition();
  const navigate = useCallback(
    (href: string) => {
      startTransition(() => {
        void router.push(href);
      });
    },
    [router],
  );
  return { navigate, navPending };
}

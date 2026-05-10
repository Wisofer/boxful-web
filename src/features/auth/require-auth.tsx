"use client";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { getStoredAccessToken } from "@/lib/auth-token";
import { AuthFullscreenSpinner } from "./auth-fullscreen-spinner";
type RequireAuthProps = {
  children: ReactNode;
};
export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const id = window.setTimeout(() => {
      if (cancelled) return;
      if (!getStoredAccessToken()) {
        router.replace(ROUTES.login);
        return;
      }
      setReady(true);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [router]);
  if (!ready) return <AuthFullscreenSpinner />;
  return <>{children}</>;
}

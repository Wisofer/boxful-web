"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import { getStoredAccessToken } from "@/lib/auth-token";
import { AuthFullscreenSpinner } from "./auth-fullscreen-spinner";
export function RootRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getStoredAccessToken() ? ROUTES.crearOrden : ROUTES.login);
  }, [router]);
  return <AuthFullscreenSpinner />;
}

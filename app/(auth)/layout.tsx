import type { ReactNode } from "react";
import { RequireGuest } from "@/features/auth";
import { AuthLayout } from "@/layouts/auth-layout";
export default function AuthSegmentLayout({ children }: { children: ReactNode }) {
  return (
    <AuthLayout>
      <RequireGuest>{children}</RequireGuest>
    </AuthLayout>
  );
}

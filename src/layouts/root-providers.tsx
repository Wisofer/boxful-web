"use client";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <AppProviders>{children}</AppProviders>
    </AntdRegistry>
  );
}

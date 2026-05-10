"use client";
import { App, ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import type { ReactNode } from "react";
import { themeConfig } from "@/lib/theme";
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider locale={esES} theme={themeConfig}>
      <App>{children}</App>
    </ConfigProvider>
  );
}

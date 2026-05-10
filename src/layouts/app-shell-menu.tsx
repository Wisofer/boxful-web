"use client";
import { FileSearchOutlined, PlusOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  DASHBOARD_SIDEBAR_ITEMS,
  getDashboardSidebarSelectedKey,
} from "@/constants/dashboard-sidebar";
import { DASHBOARD_VIEW_QUERY, ROUTES } from "@/constants/routes";
const SIDEBAR_ICONS = {
  "crear-orden": PlusOutlined,
  historial: FileSearchOutlined,
} as const;
type AppShellMainMenuProps = {
  inlineCollapsed: boolean;
  className: string;
};
function buildMenuItems() {
  return DASHBOARD_SIDEBAR_ITEMS.map((item) => {
    const Icon = SIDEBAR_ICONS[item.key];
    return {
      key: item.key,
      icon: <Icon />,
      label: <Link href={item.href}>{item.label}</Link>,
    };
  });
}
const MENU_ITEMS_FALLBACK = buildMenuItems();
function AppShellMainMenuInner({ inlineCollapsed, className }: AppShellMainMenuProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hubView =
    pathname === ROUTES.appHub ? searchParams.get(DASHBOARD_VIEW_QUERY) : null;
  const selectedKey = getDashboardSidebarSelectedKey(pathname, hubView);
  return (
    <Menu
      mode="inline"
      theme="light"
      inlineCollapsed={inlineCollapsed}
      selectedKeys={selectedKey ? [selectedKey] : []}
      className={className}
      items={MENU_ITEMS_FALLBACK}
    />
  );
}
export function AppShellMainMenu(props: AppShellMainMenuProps) {
  return (
    <Suspense
      fallback={
        <Menu
          mode="inline"
          theme="light"
          inlineCollapsed={props.inlineCollapsed}
          selectedKeys={[]}
          className={props.className}
          items={MENU_ITEMS_FALLBACK}
        />
      }
    >
      <AppShellMainMenuInner {...props} />
    </Suspense>
  );
}

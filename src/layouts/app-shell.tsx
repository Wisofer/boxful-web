"use client";
import { LogoutOutlined } from "@ant-design/icons";
import { App, Button, Layout, Tooltip, Typography } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { ROUTES } from "@/constants/routes";
import { clearStoredAccessToken } from "@/lib/auth-token";
import {
  DashboardHeaderProvider,
  useDashboardHeaderFromShell,
} from "@/components/providers/dashboard-header-context";
import {
  ShellLayoutProvider,
  useShellLayout,
} from "@/components/providers/shell-layout-context";
import { AppShellMainMenu } from "./app-shell-menu";
import { DashboardMain } from "./dashboard-main";
import { DashboardTopBar } from "./dashboard-top-bar";
import sidebarStyles from "./app-shell-sidebar.module.css";
const { Sider } = Layout;
type AppShellProps = {
  children: ReactNode;
};
function ShellDashboardHeaderChrome() {
  const { pageHeader } = useDashboardHeaderFromShell();
  if (!pageHeader) {
    return <div className="min-h-16 min-w-0 shrink-0" aria-hidden />;
  }
  return <DashboardTopBar title={pageHeader.title} rightSlot={pageHeader.rightSlot} />;
}
export function AppShell({ children }: AppShellProps) {
  return (
    <ShellLayoutProvider>
      <AppShellInner>{children}</AppShellInner>
    </ShellLayoutProvider>
  );
}
function SidebarLogoutButton({ collapsed }: { collapsed: boolean }) {
  const { message } = App.useApp();
  const router = useRouter();
  const handleLogout = (): void => {
    clearStoredAccessToken();
    message.success("Sesión cerrada");
    router.replace(ROUTES.login);
  };
  const button = (
    <Button
      type="text"
      danger
      block={!collapsed}
      size="large"
      icon={<LogoutOutlined className="text-base" />}
      onClick={handleLogout}
      aria-label="Cerrar sesión"
      className={
        collapsed
          ? "mx-auto flex h-12 w-12 min-w-12 shrink-0 items-center justify-center rounded-xl !px-0 hover:!bg-[rgb(0_0_0_/4%)]"
          : [
              "flex h-12 w-full min-w-0 items-center justify-start gap-3 rounded-xl font-semibold text-[#ff4d4f]",
              "[&_.anticon]:mr-0 [&_.anticon]:text-[17px] [&_.anticon]:text-[#ff4d4f]",
            ].join(" ")
      }
    >
      {!collapsed ? <span>Cerrar sesión</span> : null}
    </Button>
  );
  return (
    <div
      className={`${sidebarStyles.shellFooter} shrink-0 border-t border-[rgba(0,0,0,0.06)]`}
    >
      {collapsed ? (
        <Tooltip title="Cerrar sesión" placement="right">
          {button}
        </Tooltip>
      ) : (
        button
      )}
    </div>
  );
}
function AppShellInner({ children }: AppShellProps) {
  const { sidebarCollapsed, setSidebarCollapsed, notifySiderBreakpoint, belowLg } =
    useShellLayout();
  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full min-w-0 overflow-x-hidden overflow-hidden bg-[var(--boxful-bg-canvas)]">
      <Sider
        breakpoint="lg"
        collapsed={sidebarCollapsed}
        onCollapse={(c) => setSidebarCollapsed(c)}
        onBreakpoint={(broken) => notifySiderBreakpoint(broken)}
        collapsible
        collapsedWidth={belowLg ? 0 : 88}
        width={256}
        theme="light"
        trigger={null}
        className="flex h-full max-h-[100dvh] flex-col overflow-y-auto overflow-x-hidden !border-r-0 !bg-[var(--boxful-shell-chrome,#f7f8fa)] [&_.ant-layout-sider-children]:flex [&_.ant-layout-sider-children]:h-full [&_.ant-layout-sider-children]:min-h-0 [&_.ant-layout-sider-children]:min-w-0 [&_.ant-layout-sider-children]:max-w-full [&_.ant-layout-sider-children]:flex-col [&_.ant-layout-sider-children]:overflow-x-hidden"
        style={
          {
            ["--sidebar-gutter-inline"]: sidebarCollapsed && !belowLg ? "10px" : "16px",
          } as CSSProperties
        }
      >
        <div
          className={`${sidebarStyles.shellInset} flex min-h-[52px] items-center pb-3 pt-4 md:min-h-[56px] md:pb-4 md:pt-5`}
        >
          <Link
            href={ROUTES.crearOrden}
            className="inline-flex shrink-0 items-center rounded-sm outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--ant-color-primary)]"
          >
            <Image
              src="/images/boxful.png"
              alt="boxful"
              width={176}
              height={27}
              priority={false}
              sizes="(max-width: 1023px) 132px, 176px"
              className="h-[24px] w-auto md:h-[27px]"
            />
          </Link>
        </div>
        <div className={sidebarStyles.shellNav}>
          <Typography.Text className={sidebarStyles.menuLabel}>MENÚ</Typography.Text>
          <AppShellMainMenu
            inlineCollapsed={sidebarCollapsed && !belowLg}
            className={[
              sidebarStyles.shellMenu,
              sidebarCollapsed && !belowLg ? sidebarStyles.shellMenuCollapsed : "",
              "min-h-0 flex-1",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        </div>
        <SidebarLogoutButton collapsed={sidebarCollapsed && !belowLg} />
      </Sider>
      <div className="relative isolate flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white [box-shadow:inset_1px_0_0_rgb(0_0_0/6%)]">
        <DashboardHeaderProvider>
          <header className="box-border shrink-0 border-b border-[rgba(0,0,0,0.08)] bg-[#f8fafc] shadow-[0_4px_12px_-10px_rgb(0_0_0/10%)]">
            <div className="box-border px-4 sm:px-6 md:px-8">
              <ShellDashboardHeaderChrome />
            </div>
          </header>
          <main className="box-border flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-white px-4 pb-6 pt-6 sm:px-6 sm:pb-7 md:px-8 md:pb-8">
            <DashboardMain>{children}</DashboardMain>
          </main>
        </DashboardHeaderProvider>
      </div>
    </div>
  );
}

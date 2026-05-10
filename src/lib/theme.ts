import type { ThemeConfig } from "antd";
export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: "#3b5998",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorTextBase: "#1a1a2e",
    colorBgLayout: "#f5f5f5",
    borderRadius: 8,
    fontFamily: 'var(--font-app), system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  components: {
    Button: {
      controlHeightLG: 48,
      paddingContentHorizontal: 20,
    },
    Input: {
      controlHeightLG: 44,
    },
    Layout: {
      bodyBg: "#f5f5f5",
      headerBg: "#f7f8fa",
      siderBg: "#f7f8fa",
    },
    Table: {
      headerBg: "#fafafa",
    },
    Menu: {
      itemMarginInline: 0,
      itemBorderRadius: 8,
      activeBarWidth: 0,
      activeBarBorderWidth: 0,
      itemBg: "transparent",
      subMenuItemBg: "transparent",
    },
  },
};

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "chicTrip 旅伴媒合平台",
  description: "一起找到對的人，做對的事",
  // 導覽頁
  navItems: [
    {
      label: "計畫列表",
      href: "/",
    },
    {
      label: "個人中心",
      href: "/member",
    },
  ],
  // Ｍ版欄位
  navMenuItems: [
    {
      label: "計畫列表",
      href: "/projects",
    },
    {
      label: "個人中心",
      href: "/member",
    },
    {
      label: "登入",
      href: "/login",
    },
    {
      label: "註冊",
      href: "/signup",
    },
    {
      label: "登出",
      href: "/logout",
    },
  ],
};

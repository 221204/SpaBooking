export const dashboardNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/shop", label: "Cửa hàng" },
  { href: "/services", label: "Dịch vụ" },
  { href: "/staff", label: "Nhân viên" },
  { href: "/bookings", label: "Lịch hẹn" },
] as const;

export function isDashboardNavActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

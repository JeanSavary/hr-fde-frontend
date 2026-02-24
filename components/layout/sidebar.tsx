"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Phone,
  Package,
  Truck,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/calls", label: "Calls", icon: Phone, badge: "1 live" },
  { href: "/bookings", label: "Bookings", icon: Package },
  { href: "/loads", label: "Loads", icon: Truck },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-250 overflow-hidden",
        collapsed ? "w-16 min-w-16" : "w-[220px] min-w-[220px]",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-gray-100",
          collapsed ? "px-4 py-5" : "px-5 py-5",
        )}
      >
        <div
          onClick={toggle}
          className="flex h-8 w-8 min-w-8 cursor-pointer items-center justify-center rounded-lg bg-gray-900 font-mono text-sm font-bold text-white"
        >
          A
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <div className="text-sm font-semibold tracking-tight whitespace-nowrap">
              Acme Logistics
            </div>
            <div className="text-[10px] text-gray-500 whitespace-nowrap">
              Carrier Sales AI
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg text-[13px] transition-all duration-150",
                collapsed ? "justify-center py-2.5" : "px-3 py-2.5",
                isActive
                  ? "bg-gray-100 font-semibold text-gray-900"
                  : "font-normal text-gray-400 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto flex animate-pulse items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings — separated */}
      <div className="border-t border-gray-100 px-2 py-2">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg text-[13px] transition-all duration-150",
            collapsed ? "justify-center py-2.5" : "px-3 py-2.5",
            pathname.startsWith("/settings")
              ? "bg-gray-100 font-semibold text-gray-900"
              : "font-normal text-gray-400 hover:bg-gray-50 hover:text-gray-900",
          )}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>

      {/* User */}
      <div
        className={cn(
          "flex items-center gap-2.5 border-t border-gray-100",
          collapsed ? "justify-center px-2 py-3" : "px-4 py-3",
        )}
      >
        <div className="flex h-8 w-8 min-w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-bold tracking-wide text-white">
          CB
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="truncate text-[13px] font-medium text-gray-900">
              Mathew Adams
            </div>
            <div className="truncate text-[10px] text-gray-400">
              Operations Lead
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto">
          <Link
            href="/authority/dashboard"
            className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap hover:text-[#003A70] hover:border-[#003A70] transition-colors ${
              isActive("/authority/dashboard")
                ? "border-[#003A70] text-[#003A70]"
                : "border-transparent"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/authority/reports"
            className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap hover:text-[#003A70] hover:border-[#003A70] transition-colors ${
              isActive("/authority/reports")
                ? "border-[#003A70] text-[#003A70]"
                : "border-transparent"
            }`}
          >
            Reports
          </Link>
          <Link
            href="/authority/map"
            className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap hover:text-[#003A70] hover:border-[#003A70] transition-colors ${
              isActive("/authority/map")
                ? "border-[#003A70] text-[#003A70]"
                : "border-transparent"
            }`}
          >
            Map View
          </Link>
          <Link
            href="/authority/analytics"
            className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap hover:text-[#003A70] hover:border-[#003A70] transition-colors ${
              isActive("/authority/analytics")
                ? "border-[#003A70] text-[#003A70]"
                : "border-transparent"
            }`}
          >
            Analytics
          </Link>
          <Link
            href="/authority/teams"
            className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap hover:text-[#003A70] hover:border-[#003A70] transition-colors ${
              isActive("/authority/teams")
                ? "border-[#003A70] text-[#003A70]"
                : "border-transparent"
            }`}
          >
            Teams
          </Link>
        </div>
      </div>
    </div>
  );
}

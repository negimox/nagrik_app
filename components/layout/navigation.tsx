"use client";

import { SparklesIcon } from "lucide-react";
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
          <Link
            href="/authority/nagrik-ai"
            className={`flex flex-row py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap hover:text-[#003A70] hover:border-[#003A70] transition-colors bg-gradient-to-r from-primary to-blue-800 bg-clip-text text-transparent ${
              isActive("/authority/uttarakhand-rag-test")
                ? "border-[#003A70] text-[#003A70]"
                : "border-transparent"
            }`}
          >
            <SparklesIcon className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600" />
            Nagrik AI
          </Link>
        </div>
      </div>
    </div>
  );
}

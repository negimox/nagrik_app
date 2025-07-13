"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CitizenBreadcrumb() {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="text-xs flex items-center gap-2">
        <Link href="/" className="text-[#003A70] hover:underline">
          Home
        </Link>
        <span>{">"}</span>
        <Link
          href="/citizen/dashboard"
          className="text-[#003A70] hover:underline"
        >
          Citizen Portal
        </Link>
        <span>{">"}</span>
        <span className="text-gray-600">
          {(() => {
            const segment = pathname.split("/").pop();
            return segment
              ? segment.charAt(0).toUpperCase() + segment.slice(1)
              : "Dashboard";
          })()}
        </span>
      </div>
    </div>
  );
}

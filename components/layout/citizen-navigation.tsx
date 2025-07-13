"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/citizen/dashboard" },
  { name: "Report Issue", href: "/citizen/report" },
  { name: "My Reports", href: "/citizen/reports" },
  //   { name: "Maintenance", href: "/citizen/maintenance" },
  { name: "AI Demos", href: "/citizen/image-detection-demo" },
  { name: "Notifications", href: "/citizen/notifications" },
  { name: "Help", href: "/citizen/help" },
];

export default function CitizenNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Find currently active item for mobile display
  const activeItem =
    navigation.find((item) => isActive(item.href))?.name || "Navigation";

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        {/* Mobile Navigation Dropdown */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full py-3 flex items-center justify-between font-medium text-sm text-[#003A70]"
          >
            <span>{activeItem}</span>
            {isMobileMenuOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {/* Mobile dropdown menu */}
          {isMobileMenuOpen && (
            <div className="pb-2 animate-in fade-in slide-in-from-top">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-2 px-1 text-sm font-medium border-l-4 ${
                    isActive(item.href)
                      ? "border-[#003A70] text-[#003A70] bg-blue-50"
                      : "border-transparent hover:text-[#003A70] hover:bg-blue-50/50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex overflow-x-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap hover:text-[#003A70] hover:border-[#003A70] transition-colors ${
                isActive(item.href)
                  ? "border-[#003A70] text-[#003A70]"
                  : "border-transparent"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

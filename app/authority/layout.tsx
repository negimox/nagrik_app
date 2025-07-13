import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Header from "@/components/layout/header";
import Navigation from "@/components/layout/navigation";
import Breadcrumb from "@/components/layout/breadcrumb";
import { AuthorityRAGChatBot } from "@/components/authority-rag-chatbot";

const sidebarRoutes = [
  { path: "/", label: "Home" },
  { path: "/reports", label: "Reports" },
  { path: "/map", label: "Map View" },
  { path: "/analytics", label: "Analytics" },
];

export default function AuthorityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F0F0F0]">
      {/* Header */}
      <Header showLogout={true} />

      {/* Navigation */}
      <Navigation />

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      {/* Authority RAG Chat Bot */}
      <AuthorityRAGChatBot />

      {/* Footer */}
      <footer className="bg-[#003A70] text-white py-4 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs">
              © {new Date().getFullYear()} City Government - Infrastructure
              Monitoring System. All Rights Reserved.
            </div>
            <div className="flex gap-4 text-xs">
              <Link href="/terms" className="hover:underline">
                Terms of Use
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact Us
              </Link>
              <Link href="/help" className="hover:underline">
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
import Footer from "@/components/layout/footer";
const sidebarRoutes = [
  { path: "/", label: "Home" },
  { path: "/reports", label: "Reports" },
  { path: "/map", label: "Map View" },
  { path: "/analytics", label: "Analytics" },
];

export default function AuthorityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
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
      <Footer />
    </div>
  );
}

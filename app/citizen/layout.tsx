import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import { ReportProvider } from "@/contexts/ReportContext";
import CitizenNavigation from "@/components/layout/citizen-navigation";
import CitizenBreadcrumb from "@/components/layout/citizen-breadcrumb";
import { CitizenRAGChatBot } from "@/components/citizen-rag-chatbot";

export default function CitizenLayout({ children }: { children: ReactNode }) {
  return (
    <ReportProvider>
      <div className="flex min-h-screen flex-col bg-[#F0F0F0]">
        {/* Header */}
        <Header showLogout={true} />

        {/* Navigation */}
        <CitizenNavigation />

        {/* Breadcrumb */}
        <CitizenBreadcrumb />

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

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

        {/* Citizen RAG Chatbot */}
        <CitizenRAGChatBot />
      </div>
    </ReportProvider>
  );
}

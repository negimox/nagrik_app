import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import { ReportProvider } from "@/contexts/ReportContext";
import CitizenNavigation from "@/components/layout/citizen-navigation";
import CitizenBreadcrumb from "@/components/layout/citizen-breadcrumb";
import { CitizenRAGChatBot } from "@/components/citizen-rag-chatbot";
import { CitizenVoiceAssistant } from "@/components/citizen-voice-assistant";
import Footer from "@/components/layout/footer";

export default function CitizenLayout({ children }: { children: ReactNode }) {
  return (
    <ReportProvider>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Header */}
        <Header showLogout={true} />

        {/* Navigation */}
        <CitizenNavigation />

        {/* Breadcrumb */}
        <CitizenBreadcrumb />

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

        {/* Footer */}
        <Footer />

        {/* Voice Assistant - positioned to the left of chatbot */}
        <CitizenVoiceAssistant />

        {/* Citizen RAG Chatbot */}
        <CitizenRAGChatBot />
      </div>
    </ReportProvider>
  );
}

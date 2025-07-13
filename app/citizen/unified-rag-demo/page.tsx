import { Metadata } from "next";
import { UnifiedRAGDemo } from "@/components/unified-rag-demo";

export const metadata: Metadata = {
  title: "Unified RAG Demo | Report Dashboard",
  description: "Unified AI-powered analysis using RAG technology",
};

export default function UnifiedRAGDemoPage() {
  return <UnifiedRAGDemo />;
}

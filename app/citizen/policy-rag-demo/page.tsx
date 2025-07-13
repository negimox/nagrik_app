import { Metadata } from "next";
import { PolicyRAGDemo } from "@/components/policy-rag-demo";

export const metadata: Metadata = {
  title: "Policy RAG Demo | Report Dashboard",
  description: "AI-powered policy analysis using RAG technology",
};

export default function PolicyRAGDemoPage() {
  return <PolicyRAGDemo />;
}

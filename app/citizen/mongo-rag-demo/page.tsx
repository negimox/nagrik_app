import { Metadata } from "next";
import { RAGReportsAnalyzer } from "@/components/rag-reports-analyzer";

export const metadata: Metadata = {
  title: "MongoDB RAG Demo | Report Dashboard",
  description:
    "AI-powered analysis of infrastructure reports using MongoDB data",
};

export default function MongoRAGDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">MongoDB RAG Demo</h1>
          <p className="text-muted-foreground text-lg">
            Experience AI-powered infrastructure analysis using historical
            reports data
          </p>
        </div>

        <div className="grid gap-6">
          {/* Main RAG Interface */}
          <RAGReportsAnalyzer />

          {/* Information Panel */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-medium mb-2">1. Data Collection</h3>
                <p className="text-muted-foreground">
                  MongoDB reports are processed and converted into vector
                  embeddings for semantic search.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">2. Context Analysis</h3>
                <p className="text-muted-foreground">
                  Your questions are matched with relevant historical reports
                  using AI similarity search.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">3. AI Response</h3>
                <p className="text-muted-foreground">
                  Gemini AI generates insights based on the retrieved context
                  and your specific question.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

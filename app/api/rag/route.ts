/**
 * API route for RAG-enhanced Gemini responses
 * This provides server-side RAG functionality for the main Next.js application
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getMongoKnowledgeProvider } from "@/lib/mongodb-rag";

// Knowledge base interfaces (simplified for API usage)
interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  metadata?: Record<string, any>;
  embedding?: number[];
  timestamp: Date;
}

interface RAGResponse {
  answer: string;
  sources: KnowledgeDocument[];
  confidence: number;
}

// Initialize Gemini AI
const genAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
});

// In-memory knowledge base for demo (in production, use a vector database)
class ServerKnowledgeBase {
  private documents: Map<string, KnowledgeDocument> = new Map();

  constructor() {
    this.initializeDefaultDocuments();
  }

  private initializeDefaultDocuments() {
    const defaultDocuments: KnowledgeDocument[] = [
      {
        id: "infrastructure-types",
        title: "Common Infrastructure Types",
        category: "infrastructure",
        content: `
          Roads and Transportation: Includes potholes, cracks, damaged guardrails, broken traffic lights, faded road markings.
          Water Systems: Water mains, fire hydrants, drainage systems, manholes, storm drains.
          Utilities: Street lighting, power lines, utility poles, transformers, telecommunication infrastructure.
          Public Facilities: Parks, playgrounds, public restrooms, benches, sidewalks, crosswalks.
          Waste Management: Garbage bins, recycling stations, dumpsters, litter collection areas.
        `,
        timestamp: new Date(),
      },
      {
        id: "severity-assessment",
        title: "Infrastructure Issue Severity Guidelines",
        category: "assessment",
        content: `
          HIGH SEVERITY: Immediate safety hazards requiring urgent attention
          - Large potholes that could damage vehicles or cause accidents
          - Exposed electrical wiring or damaged power lines
          - Broken traffic lights at busy intersections
          - Collapsed or severely damaged sidewalks
          - Major water leaks or burst pipes

          MEDIUM SEVERITY: Issues that should be addressed within weeks
          - Smaller potholes or road surface damage
          - Flickering or dim street lights
          - Damaged but stable playground equipment
          - Minor water leaks
          - Overgrown vegetation blocking signs

          LOW SEVERITY: Maintenance issues that can be scheduled
          - Faded road markings
          - Minor cosmetic damage to facilities
          - Full garbage bins (but not overflowing)
          - Small cracks in sidewalks
          - General wear and tear on public furniture
        `,
        timestamp: new Date(),
      },
      {
        id: "reporting-best-practices",
        title: "Infrastructure Reporting Best Practices",
        category: "reporting",
        content: `
          Clear Documentation: Take clear photos showing the entire context of the issue, not just close-ups.
          Location Details: Provide precise location information including nearby landmarks or addresses.
          Safety First: Do not put yourself in danger to document issues, especially near traffic.
          Descriptive Language: Use specific terms - instead of "broken," specify "cracked," "missing," "leaking," etc.
          Size and Scale: Include reference objects or measurements when possible.
          Time Sensitivity: Note if the issue poses immediate danger or can wait for scheduled maintenance.
          Follow-up: Check back on reported issues to see if they've been addressed.
        `,
        timestamp: new Date(),
      },
      {
        id: "common-infrastructure-problems",
        title: "Common Infrastructure Problems and Causes",
        category: "diagnosis",
        content: `
          Potholes: Caused by water infiltration, freeze-thaw cycles, heavy traffic, and aging asphalt.
          Street Light Issues: Often due to burned-out bulbs, electrical problems, or damaged fixtures.
          Water System Problems: Can result from aging pipes, ground movement, or extreme weather.
          Sidewalk Damage: Usually caused by tree root growth, ground settling, or weather damage.
          Traffic Signal Malfunctions: Often electrical issues, sensor problems, or storm damage.
          Drainage Issues: Typically caused by debris blockage, pipe damage, or inadequate capacity.
          Utility Pole Problems: Often result from vehicle impacts, weather damage, or aging infrastructure.
        `,
        timestamp: new Date(),
      },
      {
        id: "ai-detection-guidelines",
        title: "AI-Assisted Infrastructure Detection Guidelines",
        category: "ai-detection",
        content: `
          Image Quality: Ensure good lighting and clear focus for accurate AI detection.
          Multiple Angles: Capture different perspectives of the same issue for comprehensive analysis.
          Context Inclusion: Include surrounding areas to help AI understand the scope and location.
          Object Recognition: AI can identify common infrastructure elements like signs, lights, road surfaces.
          Condition Assessment: AI can evaluate damage levels, wear patterns, and structural integrity.
          Classification Accuracy: AI performs best with clear, unobstructed views of infrastructure elements.
          Limitations: AI may struggle with heavily obscured objects, unusual angles, or complex scenarios.
        `,
        timestamp: new Date(),
      },
    ];

    for (const doc of defaultDocuments) {
      this.documents.set(doc.id, doc);
    }
  }

  search(query: string, maxResults: number = 5): KnowledgeDocument[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    const results: { doc: KnowledgeDocument; score: number }[] = [];

    for (const doc of this.documents.values()) {
      let score = 0;
      const docContent = `${doc.title} ${doc.content}`.toLowerCase();

      for (const word of queryWords) {
        // Escape special regex characters to prevent regex errors
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const matches = (docContent.match(new RegExp(escapedWord, "g")) || [])
          .length;
        score += matches;
      }

      if (score > 0) {
        results.push({ doc, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map((r) => r.doc);
  }

  addDocument(doc: KnowledgeDocument) {
    this.documents.set(doc.id, doc);
  }

  getAllDocuments(): KnowledgeDocument[] {
    return Array.from(this.documents.values());
  }
}

const knowledgeBase = new ServerKnowledgeBase();

// Initialize MongoDB integration
async function initializeMongoDB() {
  try {
    const mongoProvider = getMongoKnowledgeProvider();
    await mongoProvider.connect();

    // Load recent reports as knowledge
    const recentReports = await mongoProvider.getAllReportsAsKnowledge();
    for (const report of recentReports.slice(0, 100)) {
      // Limit to prevent memory issues
      knowledgeBase.addDocument({
        id: report.id,
        title: report.title,
        content: report.content,
        category: report.category,
        metadata: report.metadata,
        timestamp: report.timestamp,
      });
    }

    console.log(
      `Loaded ${Math.min(
        recentReports.length,
        100
      )} historical reports into API knowledge base`
    );
  } catch (error) {
    console.warn(
      "MongoDB integration failed, using default knowledge only:",
      error
    );
  }
}

// Initialize on module load
initializeMongoDB();

async function generateRAGResponse(
  query: string,
  systemContext?: string,
  temperature: number = 0.3
): Promise<RAGResponse> {
  try {
    // 1. Retrieve relevant documents
    const relevantDocs = knowledgeBase.search(query, 5);

    // 2. Build context from retrieved documents
    const context = relevantDocs
      .map(
        (doc) => `### ${doc.title} (Category: ${doc.category})\n${doc.content}`
      )
      .join("\n\n");

    // 3. Construct the enhanced prompt
    const systemPrompt =
      systemContext ||
      "You are a helpful AI assistant specialized in infrastructure reporting and civic issues.";

    const enhancedPrompt = `${systemPrompt}

Based on the following knowledge base context, please answer the user's question accurately and comprehensively:

=== KNOWLEDGE BASE CONTEXT ===
${context}
=== END CONTEXT ===

User Question: ${query}

Please provide a detailed answer based on the context above. If the context doesn't contain enough information to fully answer the question, mention what additional information might be needed.`;

    // 4. Generate response using Gemini
    const result = await genAI.models.generateContent({
      model: "models/gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: enhancedPrompt }] }],
      config: {
        temperature,
      },
    });

    const answer = result.text || "";

    // 5. Calculate confidence based on retrieved documents
    const confidence =
      relevantDocs.length > 0
        ? Math.min(0.9, 0.3 + relevantDocs.length * 0.15)
        : 0.1;

    return {
      answer,
      sources: relevantDocs,
      confidence,
    };
  } catch (error) {
    console.error("Error generating RAG response:", error);
    throw new Error("Failed to generate context-aware response");
  }
}

// POST /api/rag/query
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, systemContext, temperature = 0.3 } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const ragResponse = await generateRAGResponse(
      query,
      systemContext,
      temperature
    );

    return NextResponse.json(ragResponse);
  } catch (error) {
    console.error("RAG API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// New endpoints for MongoDB reports integration

// GET /api/rag/reports/analytics
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const endpoint = url.pathname.split("/").pop();

  if (endpoint === "analytics") {
    try {
      const mongoProvider = getMongoKnowledgeProvider();
      const analytics = await mongoProvider.getReportAnalytics();
      return NextResponse.json(analytics);
    } catch (error) {
      console.error("MongoDB analytics error:", error);
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 }
      );
    }
  }

  // Default GET behavior for knowledge base
  try {
    const documents = knowledgeBase.getAllDocuments();
    return NextResponse.json({
      documents: documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        timestamp: doc.timestamp,
      })),
      count: documents.length,
    });
  } catch (error) {
    console.error("Knowledge base API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/rag/knowledge
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, metadata } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Title, content, and category are required" },
        { status: 400 }
      );
    }

    const id = `custom-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newDoc: KnowledgeDocument = {
      id,
      title,
      content,
      category,
      metadata,
      timestamp: new Date(),
    };

    knowledgeBase.addDocument(newDoc);

    return NextResponse.json({
      success: true,
      id,
      message: "Document added successfully",
    });
  } catch (error) {
    console.error("Add knowledge document error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

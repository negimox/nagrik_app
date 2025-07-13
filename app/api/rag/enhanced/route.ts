/**
 * Enhanced RAG API route with Indian infrastructure context
 * Provides comprehensive responses for Indian municipal governance
 */

import { NextRequest, NextResponse } from "next/server";
import {
  generateEnhancedRAGResponse,
  EnhancedRAGConfig,
} from "@/lib/enhanced-rag-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, config } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate and set config
    const enhancedConfig: Partial<EnhancedRAGConfig> = {
      maxContextTokens: 6000,
      similarityThreshold: 0.6,
      maxDocuments: 8,
      temperature: 0.4,
      includeIndianContext: true,
      ...config,
    };

    console.log(`Enhanced RAG Query: "${query}"`);
    console.log(`Config:`, enhancedConfig);

    // Generate enhanced response
    const ragResponse = await generateEnhancedRAGResponse(
      query,
      enhancedConfig
    );

    // Log successful response
    console.log(
      `Response generated with confidence: ${ragResponse.confidence}`
    );
    console.log(`Sources used: ${ragResponse.sources.length}`);
    console.log(`Context categories: ${ragResponse.contextUsed.join(", ")}`);

    return NextResponse.json({
      success: true,
      query,
      answer: ragResponse.answer,
      sources: ragResponse.sources,
      confidence: ragResponse.confidence,
      contextUsed: ragResponse.contextUsed,
      suggestions: ragResponse.suggestions,
      relatedIssues: ragResponse.relatedIssues,
      escalationPath: ragResponse.escalationPath,
      timestamp: new Date().toISOString(),
      enhanced: true, // Flag to indicate enhanced response
    });
  } catch (error) {
    console.error("Enhanced RAG API error:", error);

    // Provide detailed error response
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to generate enhanced response",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Enhanced RAG API for Indian Infrastructure",
    version: "2.0",
    features: [
      "Indian municipal governance context",
      "Multilingual support (Hindi/English)",
      "Seasonal awareness (Monsoon, Summer, Winter)",
      "Regional customization",
      "Enhanced escalation paths",
      "Actionable suggestions",
      "Related issue identification",
      "Confidence scoring",
    ],
    usage: {
      endpoint: "POST /api/rag/enhanced",
      parameters: {
        query: "string (required) - Your question about infrastructure",
        config: {
          includeIndianContext: "boolean - Enable Indian context",
          regionalContext: "string - north/south/east/west",
          governanceContext: {
            state: "string - State name",
            district: "string - District name",
            ward: "string - Ward number",
            governanceLevel: "string - municipal/panchayat/corporation",
          },
          temperature: "number - Response creativity (0.1-1.0)",
          maxDocuments: "number - Max knowledge sources",
        },
      },
    },
    examples: [
      {
        query: "How to report drainage problems during monsoon?",
        response: "Comprehensive guidance with seasonal considerations",
      },
      {
        query: "Which department handles road maintenance in my ward?",
        response: "Authority hierarchy with escalation paths",
      },
    ],
  });
}

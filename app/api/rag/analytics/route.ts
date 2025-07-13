/**
 * RAG Analytics API Route
 * Provides analytics data from MongoDB reports for the RAG system
 */

import { NextRequest, NextResponse } from "next/server";
import { getMongoKnowledgeProvider } from "@/lib/mongodb-rag";

// GET /api/rag/analytics
export async function GET() {
  try {
    const mongoProvider = getMongoKnowledgeProvider();

    // Check if MongoDB is available
    try {
      await mongoProvider.connect();
    } catch (error) {
      return NextResponse.json(
        {
          error: "MongoDB connection not available",
          analytics: null,
          message: "Analytics data requires MongoDB connection",
        },
        { status: 503 }
      );
    }

    // Get analytics data
    const analytics = await mongoProvider.getReportAnalytics();

    // Clean up connection
    await mongoProvider.disconnect();

    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("RAG Analytics API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// POST /api/rag/analytics/search
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, location, status, limit = 10 } = body;

    const mongoProvider = getMongoKnowledgeProvider();

    try {
      await mongoProvider.connect();
    } catch (error) {
      return NextResponse.json(
        {
          error: "MongoDB connection not available",
          results: [],
          message: "Search requires MongoDB connection",
        },
        { status: 503 }
      );
    }

    let results = [];

    // Search by different criteria
    if (category) {
      results = await mongoProvider.getReportsByCategory(category);
    } else if (location) {
      results = await mongoProvider.getReportsByLocation(location);
    } else if (status) {
      results = await mongoProvider.getReportsByStatus(status);
    } else {
      results = await mongoProvider.getAllReportsAsKnowledge();
    }

    // Limit results
    results = results.slice(0, limit);

    await mongoProvider.disconnect();

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
      filters: { category, location, status, limit },
    });
  } catch (error) {
    console.error("RAG Analytics Search API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

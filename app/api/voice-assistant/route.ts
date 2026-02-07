/**
 * API route for Voice Assistant function calling
 * Handles Vapi function calls and integrates with RAG system
 */

import { NextRequest, NextResponse } from "next/server";
import { getMongoKnowledgeProvider } from "@/lib/mongodb-rag";
import { genAI } from "@/lib/genai-utils";

interface FunctionCallRequest {
  message: {
    type: "function-call";
    functionCall: {
      name: string;
      parameters: Record<string, any>;
    };
  };
  call: {
    id: string;
  };
}

/**
 * POST /api/voice-assistant
 * Handle function calls from Vapi voice assistant
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("🎤 Voice Assistant Raw Body:", JSON.stringify(body, null, 2));

    // Vapi sends different payloads - handle both structures
    let functionCall:
      | { name: string; parameters: Record<string, any> }
      | undefined;

    if (body.message?.functionCall) {
      // Expected structure
      functionCall = body.message.functionCall;
    } else if (body.functionCall) {
      // Alternative structure
      functionCall = body.functionCall;
    } else if (body.message?.type === "function-call") {
      // Another possible structure
      functionCall = body.message.function;
    }

    if (!functionCall) {
      console.log(
        "⚠️ No function call found in body, returning acknowledgment",
      );
      return NextResponse.json({
        result: "Request received but no function to execute.",
      });
    }

    const { name, parameters } = functionCall;
    console.log("🎤 Voice Assistant Function Call:", { name, parameters });

    // Get userId from request headers or query params
    const userId =
      request.headers.get("x-user-id") ||
      request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          result:
            "I couldn't identify your user account. Please make sure you're logged in.",
        },
        { status: 400 },
      );
    }

    let result: any;

    // Handle different function calls
    switch (name) {
      case "getReportStatus":
        result = await handleGetReportStatus(userId, parameters.reportId);
        break;

      case "getLatestReport":
        result = await handleGetLatestReport(userId);
        break;

      case "getPendingReports":
        result = await handleGetPendingReports(userId);
        break;

      case "getReportCount":
        result = await handleGetReportCount(userId, parameters.status);
        break;

      case "getReportSubmitLink":
        result = await handleGetReportSubmitLink();
        break;

      case "queryInfrastructure":
        result = await handleQueryInfrastructure(parameters.query, userId);
        break;

      default:
        result = {
          success: false,
          message: `Unknown function: ${name}`,
        };
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Voice Assistant API Error:", error);
    return NextResponse.json(
      {
        result:
          "I encountered an error processing your request. Please try again.",
      },
      { status: 500 },
    );
  }
}

/**
 * Get report status for a specific report or all user reports
 */
async function handleGetReportStatus(
  userId: string,
  reportId?: string,
): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = reportId
      ? `${baseUrl}/api/report?reportId=${reportId}`
      : `${baseUrl}/api/report?userId=${userId}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return "I couldn't find that report. Please check the report ID and try again.";
    }

    if (reportId) {
      // Single report
      const report = data;
      return formatSingleReportForVoice(report);
    } else {
      // Multiple reports
      const reports = data;
      if (!reports || reports.length === 0) {
        return "You haven't submitted any reports yet. Would you like to submit one?";
      }
      return formatMultipleReportsForVoice(reports);
    }
  } catch (error) {
    console.error("Error fetching report status:", error);
    return "I had trouble retrieving your reports. Please try again.";
  }
}

/**
 * Get the latest report for the user
 */
async function handleGetLatestReport(userId: string): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/report?userId=${userId}`);
    const reports = await response.json();

    if (!response.ok || !reports || reports.length === 0) {
      return "You haven't submitted any reports yet.";
    }

    // Sort by date and get the most recent
    const sortedReports = reports.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const latestReport = sortedReports[0];

    return formatSingleReportForVoice(latestReport, "Your latest report is: ");
  } catch (error) {
    console.error("Error fetching latest report:", error);
    return "I had trouble retrieving your latest report.";
  }
}

/**
 * Get pending reports for the user
 */
async function handleGetPendingReports(userId: string): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/report?userId=${userId}`);
    const reports = await response.json();

    if (!response.ok || !reports) {
      return "I had trouble retrieving your reports.";
    }

    const pendingReports = reports.filter(
      (r: any) => r.status === "pending" || r.status === "Pending",
    );

    if (pendingReports.length === 0) {
      return "You have no pending reports. All your reports have been processed.";
    }

    if (pendingReports.length === 1) {
      return (
        "You have 1 pending report. " +
        formatSingleReportForVoice(pendingReports[0])
      );
    }

    return `You have ${pendingReports.length} pending reports waiting to be reviewed.`;
  } catch (error) {
    console.error("Error fetching pending reports:", error);
    return "I had trouble retrieving your pending reports.";
  }
}

/**
 * Get report count for the user
 */
async function handleGetReportCount(
  userId: string,
  status?: string,
): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/report?userId=${userId}`);
    const reports = await response.json();

    if (!response.ok || !reports) {
      return "I had trouble retrieving your report count.";
    }

    if (status && status !== "all") {
      const filteredReports = reports.filter(
        (r: any) => r.status?.toLowerCase() === status.toLowerCase(),
      );
      return `You have ${filteredReports.length} ${status} ${
        filteredReports.length === 1 ? "report" : "reports"
      }.`;
    }

    // Count by status
    const statusCounts = reports.reduce((acc: any, report: any) => {
      const reportStatus = report.status || "unknown";
      acc[reportStatus] = (acc[reportStatus] || 0) + 1;
      return acc;
    }, {});

    const total = reports.length;
    const statusSummary = Object.entries(statusCounts)
      .map(([status, count]) => `${count} ${status}`)
      .join(", ");

    return `You have submitted ${total} ${
      total === 1 ? "report" : "reports"
    } in total. ${statusSummary}.`;
  } catch (error) {
    console.error("Error fetching report count:", error);
    return "I had trouble counting your reports.";
  }
}

/**
 * Get the link to submit a new report
 */
async function handleGetReportSubmitLink(): Promise<string> {
  return "आप नई रिपोर्ट सबमिट कर सकते हैं। मैंने चैट में लिंक शेयर कर दिया है। [Link: /citizen/report] क्या आप जानना चाहेंगे कि कौन सी जानकारी की आवश्यकता होगी?";
}

/**
 * Query infrastructure knowledge using RAG
 */
async function handleQueryInfrastructure(
  query: string,
  userId: string,
): Promise<string> {
  try {
    const knowledgeProvider = await getMongoKnowledgeProvider();

    // Search knowledge base using MongoDB reports
    const relevantDocs = await knowledgeProvider.searchReports(query);

    if (relevantDocs.length === 0) {
      return "I can help with questions about infrastructure reporting, severity assessment, and reporting guidelines. What would you like to know?";
    }

    // Build context from documents (limit to 3 for voice response)
    const context = relevantDocs
      .slice(0, 3)
      .map((doc: any) => `${doc.title}: ${doc.content}`)
      .join("\n\n");

    // Generate response using Gemini
    const prompt = `You are a helpful voice assistant for infrastructure reporting. Answer this question concisely for voice response (2-3 sentences max).

Context from knowledge base:
${context}

User question: ${query}

Provide a clear, conversational voice response:`;

    const result = await genAI.models.generateContent({
      model: "models/gemini-2.5-flash-exp",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        temperature: 0.3,
      },
    });

    const answer =
      result.text ||
      "I can help with infrastructure questions. Please try asking again.";

    return answer;
  } catch (error) {
    console.error("Error querying infrastructure:", error);
    return "I can help with questions about infrastructure reporting, severity assessment, and reporting guidelines. What would you like to know?";
  }
}

/**
 * Format a single report for voice response
 */
function formatSingleReportForVoice(report: any, prefix: string = ""): string {
  const status = report.status || "unknown";
  const category = report.category || "infrastructure issue";
  const location = report.location?.address || "unknown location";
  const date = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "unknown date";

  let response = prefix;
  response += `A ${category} report at ${location}, submitted on ${date}. `;
  response += `The current status is ${status}. `;

  if (report.id) {
    response += `The report ID is ${report.id}.`;
  }

  return response;
}

/**
 * Format multiple reports for voice response
 */
function formatMultipleReportsForVoice(reports: any[]): string {
  if (reports.length === 0) {
    return "You have no reports.";
  }

  const statusCounts = reports.reduce((acc: any, report: any) => {
    const status = report.status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const total = reports.length;
  const statusSummary = Object.entries(statusCounts)
    .map(([status, count]) => `${count} ${status}`)
    .join(", ");

  return `You have ${total} ${
    total === 1 ? "report" : "reports"
  } in total. ${statusSummary}. Would you like details on any specific report?`;
}

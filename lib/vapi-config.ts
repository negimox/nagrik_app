/**
 * Vapi Voice Assistant Configuration
 * Handles assistant setup, function calling, and context management
 */

export interface VapiFunction {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Define available functions that the voice assistant can call
 */
export const vapiAssistantFunctions: VapiFunction[] = [
  {
    name: "getReportStatus",
    description:
      "Get the current status and details of a specific report by report ID or get all reports for the user",
    parameters: {
      type: "object",
      properties: {
        reportId: {
          type: "string",
          description:
            "The ID of the report to check (optional - if not provided, returns all user reports)",
        },
      },
    },
  },
  {
    name: "getLatestReport",
    description: "Get the most recent report submitted by the user",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "getPendingReports",
    description: "Get all reports that are currently pending for the user",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "getReportCount",
    description:
      "Get the total count of reports submitted by the user, optionally filtered by status",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          description:
            "Optional status filter: 'pending', 'in-progress', 'resolved', or 'all'",
          enum: ["pending", "in-progress", "resolved", "all"],
        },
      },
    },
  },
  {
    name: "getReportSubmitLink",
    description: "Get the link to submit a new infrastructure report",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "queryInfrastructure",
    description:
      "Ask questions about infrastructure issues, reporting guidelines, severity assessment, or general infrastructure knowledge using RAG",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The infrastructure-related question to ask",
        },
      },
      required: ["query"],
    },
  },
];

/**
 * Create the assistant configuration for Vapi
 */
export function createVapiAssistantConfig() {
  return {
    name: "Nagrik Infrastructure Assistant",
    model: {
      provider: "openai",
      model: "gpt-4",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are a helpful voice assistant for the Nagrik Infrastructure Monitoring System. You help citizens:

1. **Check Report Status**: Provide detailed information about their submitted infrastructure reports including status, submission date, and resolution timeline
2. **Report Statistics**: Tell them how many reports they've submitted and their current statuses
3. **Navigation Help**: Guide them to submit new reports or view existing ones
4. **Infrastructure Knowledge**: Answer questions about infrastructure issues, reporting best practices, and severity assessment using your knowledge base

**Communication Style**:
- Be concise and clear in voice responses
- Use natural, conversational language
- For report IDs, spell them out clearly
- When providing links, say "I can help you with that" and provide the link through the function
- Always confirm what action you're taking before doing it

**Report Status Context**:
- "Pending" means the report is submitted but not yet reviewed
- "In Progress" means authorities are working on it
- "Resolved" means the issue has been fixed

**When to use functions**:
- Use getReportStatus when user asks about a specific report or "my reports"
- Use getLatestReport when user asks about their "latest" or "most recent" report
- Use getPendingReports when user asks about "pending" reports
- Use getReportCount when user asks "how many reports"
- Use getReportSubmitLink when user wants to submit a new report
- Use queryInfrastructure when user asks general infrastructure questions

Be helpful, professional, and efficient. Keep responses under 3 sentences when possible for better voice experience.`,
        },
      ],
    },
    voice: {
      provider: "11labs",
      voiceId: "paula", // Professional, clear female voice
    },
    functions: vapiAssistantFunctions,
    firstMessage:
      "Hello! I'm your Nagrik Infrastructure Assistant. How can I help you today?",
    endCallMessage: "Thank you for using Nagrik. Have a great day!",
    recordingEnabled: false, // Privacy-focused
    hipaaEnabled: false,
    clientMessages: [
      "transcript",
      "function-call",
      "hang",
      "speech-update",
      "metadata",
      "conversation-update",
    ],
    serverMessages: [
      "end-of-call-report",
      "status-update",
      "hang",
      "function-call",
    ],
    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 600, // 10 minutes max call
    backgroundSound: "off",
    backchannelingEnabled: false,
    backgroundDenoisingEnabled: true,
  };
}

/**
 * Format report data for voice response
 */
export function formatReportForVoice(report: any): string {
  const status = report.status || "unknown";
  const category = report.category || "infrastructure issue";
  const date = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString()
    : "unknown date";

  return `Report ID ${report.id} for ${category}, submitted on ${date}, is currently ${status}.`;
}

/**
 * Format multiple reports for voice response
 */
export function formatReportsForVoice(reports: any[]): string {
  if (reports.length === 0) {
    return "You have no reports to display.";
  }

  if (reports.length === 1) {
    return formatReportForVoice(reports[0]);
  }

  const summary = `You have ${reports.length} reports. `;
  const statusCounts = reports.reduce(
    (acc, report) => {
      const status = report.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const statusSummary = Object.entries(statusCounts)
    .map(([status, count]) => `${count} ${status}`)
    .join(", ");

  return summary + statusSummary + ".";
}

/**
 * Parse voice input for report IDs
 */
export function parseReportIdFromVoice(input: string): string | null {
  // Try to extract report ID patterns
  const patterns = [
    /report\s+id\s+([A-Za-z0-9-]+)/i,
    /report\s+([A-Za-z0-9-]+)/i,
    /id\s+([A-Za-z0-9-]+)/i,
    /([A-Za-z0-9]{8,})/i, // Generic ID pattern
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

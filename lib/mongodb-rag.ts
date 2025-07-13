/**
 * MongoDB Reports Integration for RAG System
 * This module integrates historical reports from MongoDB as knowledge sources
 */

import { MongoClient, Db, Collection } from "mongodb";

export interface ReportDocument {
  _id?: any;
  title: string;
  category: string;
  status?: string;
  priority?: string;
  date?: string;
  time?: string;
  location: string;
  coordinates?: string;
  description: string;
  submittedBy?: string;
  userId?: string; // User ID for filtering user-specific reports
  assignedTo?: string;
  estimatedCompletion?: string;
  images?: string[];
  updates?: Array<{
    date: string;
    time: string;
    status?: string;
    comment: string;
    by: string;
  }>;
  createdAt: string | Date;
  updatedAt?: string;
  createdBy?: string;
  user?: any; // Flexible user object field
  [key: string]: any; // Allow additional fields for flexible schema
}

export interface ProcessedReportKnowledge {
  id: string;
  title: string;
  content: string;
  category: string;
  metadata: {
    reportId: string;
    originalCategory: string;
    status: string;
    priority: string;
    location: string;
    coordinates?: string;
    submittedBy: string;
    assignedTo?: string;
    createdAt: string;
    resolutionTime?: number; // days to complete
    updateCount: number;
    hasImages: boolean;
  };
  timestamp: Date;
}

class MongoDBReportsKnowledgeProvider {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private reportsCollection: Collection<ReportDocument> | null = null;

  constructor(
    private connectionString: string,
    private dbName: string = "nagrik"
  ) {}

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.reportsCollection = this.db.collection<ReportDocument>("reports");
      console.log("Connected to MongoDB for RAG knowledge integration");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.reportsCollection = null;
    }
  }

  /**
   * Convert a MongoDB report document into structured knowledge
   */
  private processReportAsKnowledge(
    report: ReportDocument
  ): ProcessedReportKnowledge {
    // Create comprehensive content from the report
    const content = this.generateReportContent(report);

    // Calculate resolution time if completed
    let resolutionTime: number | undefined;
    if (report.status === "Completed" && report.estimatedCompletion) {
      const createdDate = new Date(report.createdAt);
      const completedDate = new Date(report.estimatedCompletion);
      resolutionTime = Math.ceil(
        (completedDate.getTime() - createdDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
    }

    const reportId = report._id?.toString() || `report-${Date.now()}`;
    const createdAtString =
      report.createdAt instanceof Date
        ? report.createdAt.toISOString()
        : report.createdAt.toString();

    return {
      id: `report-${reportId}`,
      title: `${report.category}: ${report.title} (${report.location})`,
      content,
      category: "historical-reports",
      metadata: {
        reportId: reportId,
        originalCategory: report.category,
        status: report.status || "Unknown",
        priority: report.priority || "Medium",
        location: report.location,
        coordinates: report.coordinates,
        submittedBy: report.submittedBy || "Unknown",
        assignedTo: report.assignedTo,
        createdAt: createdAtString,
        resolutionTime,
        updateCount: report.updates?.length || 0,
        hasImages: (report.images?.length || 0) > 0,
      },
      timestamp: new Date(report.createdAt),
    };
  }

  /**
   * Generate comprehensive content text from report data
   */
  private generateReportContent(report: ReportDocument): string {
    const reportId = report._id?.toString() || "N/A";
    const sections = [
      `Report ID: ${reportId}`,
      `Title: ${report.title}`,
      `Category: ${report.category}`,
      `Status: ${report.status || "Unknown"}`,
      `Priority: ${report.priority || "Medium"}`,
      `Location: ${report.location}`,
      report.coordinates ? `Coordinates: ${report.coordinates}` : "",
      report.date && report.time
        ? `Date Submitted: ${report.date} at ${report.time}`
        : "",
      `Submitted By: ${report.submittedBy || "Unknown"}`,
      report.assignedTo ? `Assigned To: ${report.assignedTo}` : "",
      report.estimatedCompletion
        ? `Estimated Completion: ${report.estimatedCompletion}`
        : "",
      "",
      "Description:",
      report.description,
    ];

    // Add updates information
    if (report.updates && report.updates.length > 0) {
      sections.push("", "Update History:");
      report.updates.forEach((update, index) => {
        sections.push(
          `Update ${index + 1} (${update.date} ${update.time}) by ${update.by}:`
        );
        if (update.status) sections.push(`Status changed to: ${update.status}`);
        sections.push(`Comment: ${update.comment}`);
        sections.push("");
      });
    }

    // Add images information
    if (report.images && report.images.length > 0) {
      sections.push(`Images: ${report.images.length} image(s) attached`);
    }

    return sections.filter(Boolean).join("\n");
  }

  /**
   * Fetch all reports and convert to knowledge documents
   */
  async getAllReportsAsKnowledge(): Promise<ProcessedReportKnowledge[]> {
    if (!this.reportsCollection) {
      throw new Error("MongoDB connection not established");
    }

    try {
      const reports = await this.reportsCollection.find({}).toArray();
      return reports.map((report) => this.processReportAsKnowledge(report));
    } catch (error) {
      console.error("Error fetching reports for knowledge base:", error);
      throw error;
    }
  }

  /**
   * Fetch reports by category
   */
  async getReportsByCategory(
    category: string
  ): Promise<ProcessedReportKnowledge[]> {
    if (!this.reportsCollection) {
      throw new Error("MongoDB connection not established");
    }

    try {
      const reports = await this.reportsCollection.find({ category }).toArray();
      return reports.map((report) => this.processReportAsKnowledge(report));
    } catch (error) {
      console.error(`Error fetching ${category} reports:`, error);
      throw error;
    }
  }

  /**
   * Fetch reports by location
   */
  async getReportsByLocation(
    location: string
  ): Promise<ProcessedReportKnowledge[]> {
    if (!this.reportsCollection) {
      throw new Error("MongoDB connection not established");
    }

    try {
      const reports = await this.reportsCollection
        .find({
          location: { $regex: location, $options: "i" },
        })
        .toArray();
      return reports.map((report) => this.processReportAsKnowledge(report));
    } catch (error) {
      console.error(`Error fetching reports for location ${location}:`, error);
      throw error;
    }
  }

  /**
   * Fetch reports by status
   */
  async getReportsByStatus(
    status: string
  ): Promise<ProcessedReportKnowledge[]> {
    if (!this.reportsCollection) {
      throw new Error("MongoDB connection not established");
    }

    try {
      const reports = await this.reportsCollection.find({ status }).toArray();
      return reports.map((report) => this.processReportAsKnowledge(report));
    } catch (error) {
      console.error(`Error fetching ${status} reports:`, error);
      throw error;
    }
  }

  /**
   * Get analytics data for knowledge insights
   */
  async getReportAnalytics(): Promise<{
    totalReports: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    averageResolutionTime: number;
    commonLocations: Array<{ location: string; count: number }>;
  }> {
    if (!this.reportsCollection) {
      throw new Error("MongoDB connection not established");
    }

    try {
      const [
        totalReports,
        categoryStats,
        statusStats,
        priorityStats,
        locationStats,
      ] = await Promise.all([
        this.reportsCollection.countDocuments(),
        this.reportsCollection
          .aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }])
          .toArray(),
        this.reportsCollection
          .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
          .toArray(),
        this.reportsCollection
          .aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }])
          .toArray(),
        this.reportsCollection
          .aggregate([
            { $group: { _id: "$location", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ])
          .toArray(),
      ]);

      // Calculate average resolution time for completed reports
      const completedReports = await this.reportsCollection
        .find({
          status: "Completed",
          estimatedCompletion: { $exists: true },
        })
        .toArray();

      let averageResolutionTime = 0;
      if (completedReports.length > 0) {
        const totalDays = completedReports.reduce((sum, report) => {
          const created = new Date(report.createdAt);
          const completed = new Date(report.estimatedCompletion!);
          const days =
            (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0);
        averageResolutionTime = totalDays / completedReports.length;
      }

      return {
        totalReports,
        byCategory: Object.fromEntries(
          categoryStats.map((s) => [s._id, s.count])
        ),
        byStatus: Object.fromEntries(statusStats.map((s) => [s._id, s.count])),
        byPriority: Object.fromEntries(
          priorityStats.map((s) => [s._id, s.count])
        ),
        averageResolutionTime: Math.round(averageResolutionTime * 10) / 10,
        commonLocations: locationStats.map((s) => ({
          location: s._id,
          count: s.count,
        })),
      };
    } catch (error) {
      console.error("Error fetching report analytics:", error);
      throw error;
    }
  }

  /**
   * Search reports by text content with intelligent keyword extraction
   */
  async searchReports(query: string): Promise<ProcessedReportKnowledge[]> {
    if (!this.reportsCollection) {
      throw new Error("MongoDB connection not established");
    }

    try {
      console.log(`Searching MongoDB reports for: "${query}"`);

      // Extract keywords from the query
      const keywords = this.extractSearchKeywords(query);
      console.log("Extracted keywords:", keywords);

      // Build search conditions
      const searchConditions = [];

      // Search for each keyword
      for (const keyword of keywords) {
        const keywordRegex = { $regex: keyword, $options: "i" };
        searchConditions.push({
          $or: [
            { title: keywordRegex },
            { description: keywordRegex },
            { location: keywordRegex },
            { category: keywordRegex },
          ],
        });
      }

      // Also search for the full query (in case it's a specific term)
      const fullQueryRegex = { $regex: query, $options: "i" };
      searchConditions.push({
        $or: [
          { title: fullQueryRegex },
          { description: fullQueryRegex },
          { location: fullQueryRegex },
          { category: fullQueryRegex },
        ],
      });

      // Execute search with OR conditions
      const searchQuery =
        searchConditions.length > 0 ? { $or: searchConditions } : {};
      console.log(
        "MongoDB search query:",
        JSON.stringify(searchQuery, null, 2)
      );

      const reports = await this.reportsCollection.find(searchQuery).toArray();
      console.log(`Found ${reports.length} raw reports in MongoDB`);

      if (reports.length > 0) {
        console.log(
          "Sample report titles:",
          reports.slice(0, 3).map((r) => r.title)
        );
      }

      return reports.map((report) => this.processReportAsKnowledge(report));
    } catch (error) {
      console.error(`Error searching reports for "${query}":`, error);
      throw error;
    }
  }

  /**
   * Search reports by text content with user filtering
   */
  async searchUserReports(
    query: string,
    userId: string
  ): Promise<ProcessedReportKnowledge[]> {
    if (!this.reportsCollection) {
      throw new Error("MongoDB connection not established");
    }

    try {
      console.log(
        `Searching MongoDB reports for user ${userId} with query: "${query}"`
      );

      // Extract keywords from the query
      const keywords = this.extractSearchKeywords(query);
      console.log("Extracted keywords:", keywords);

      // Build search conditions
      const searchConditions = [];

      // Search for each keyword
      for (const keyword of keywords) {
        const keywordRegex = { $regex: keyword, $options: "i" };
        searchConditions.push({
          $or: [
            { title: keywordRegex },
            { description: keywordRegex },
            { location: keywordRegex },
            { category: keywordRegex },
          ],
        });
      }

      // Also search for the full query (in case it's a specific term)
      const fullQueryRegex = { $regex: query, $options: "i" };
      searchConditions.push({
        $or: [
          { title: fullQueryRegex },
          { description: fullQueryRegex },
          { location: fullQueryRegex },
          { category: fullQueryRegex },
        ],
      });

      // Build final query with improved user filter
      const userFilters = [
        { createdBy: userId }, // Primary: Firebase UID
        { userId: userId }, // Secondary: Direct userId field
        { submittedBy: userId }, // Tertiary: submittedBy field
        { "user.uid": userId }, // Quaternary: Nested user object
        { "user.id": userId }, // Quinary: Alternative nested structure
      ];

      const searchQuery = {
        $and: [
          { $or: userFilters }, // User filter with multiple strategies
          searchConditions.length > 0 ? { $or: searchConditions } : {},
        ],
      };

      console.log(
        "MongoDB user-specific search query:",
        JSON.stringify(searchQuery, null, 2)
      );

      const reports = await this.reportsCollection.find(searchQuery).toArray();
      console.log(`Found ${reports.length} user reports in MongoDB`);

      if (reports.length > 0) {
        console.log(
          "Sample user report titles:",
          reports.slice(0, 3).map((r) => r.title)
        );
      }

      return reports.map((report) => this.processReportAsKnowledge(report));
    } catch (error) {
      console.error(`Error searching user reports for "${query}":`, error);
      throw error;
    }
  }

  /**
   * Extract meaningful search keywords from a natural language query
   */
  private extractSearchKeywords(query: string): string[] {
    // Common infrastructure-related terms to look for
    const infrastructureTerms = [
      "streetlight",
      "street light",
      "lighting",
      "lamp",
      "pole",
      "road",
      "pothole",
      "pavement",
      "traffic",
      "water",
      "pipe",
      "supply",
      "leak",
      "drainage",
      "electricity",
      "power",
      "electrical",
      "transformer",
      "waste",
      "garbage",
      "trash",
      "cleaning",
      "dustbin",
      "damaged",
      "broken",
      "repair",
      "maintenance",
      "issue",
      "problem",
    ];

    const queryLower = query.toLowerCase();
    const foundTerms = infrastructureTerms.filter((term) =>
      queryLower.includes(term)
    );

    // Also add individual meaningful words (3+ characters, not common words)
    const commonWords = new Set([
      "the",
      "and",
      "or",
      "but",
      "are",
      "was",
      "were",
      "been",
      "have",
      "has",
      "had",
      "what",
      "where",
      "when",
      "why",
      "how",
      "some",
      "any",
      "all",
      "many",
      "most",
      "recent",
      "latest",
      "new",
      "old",
      "about",
      "tell",
      "show",
      "give",
      "get",
    ]);

    const words = queryLower
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length >= 3 && !commonWords.has(word));

    // Combine infrastructure terms and meaningful words
    const allKeywords = [...foundTerms, ...words];

    // Remove duplicates and return
    return [...new Set(allKeywords)];
  }

  /**
   * Get all reports for a specific user
   */
  async getUserReports(userId: string): Promise<ProcessedReportKnowledge[]> {
    if (!this.reportsCollection) {
      throw new Error("MongoDB connection not established");
    }

    try {
      console.log(`Fetching all reports for user: ${userId}`);

      // Try multiple user identification strategies
      const userQueries = [
        { createdBy: userId }, // Primary: Firebase UID
        { userId: userId }, // Secondary: Direct userId field
        { submittedBy: userId }, // Tertiary: submittedBy field
        { "user.uid": userId }, // Quaternary: Nested user object
        { "user.id": userId }, // Quinary: Alternative nested structure
      ];

      let reports: any[] = [];
      let matchedField = "";

      // Try each query strategy until we find reports
      for (let i = 0; i < userQueries.length; i++) {
        const query = userQueries[i];
        console.log(
          `Trying user query ${i + 1}:`,
          JSON.stringify(query, null, 2)
        );

        const foundReports = await this.reportsCollection
          .find(query)
          .sort({ createdAt: -1 }) // Latest first
          .toArray();

        if (foundReports.length > 0) {
          reports = foundReports;
          matchedField = Object.keys(query)[0];
          console.log(
            `✅ Found ${reports.length} reports using field: ${matchedField}`
          );
          break;
        } else {
          console.log(`❌ No reports found with query ${i + 1}`);
        }
      }

      if (reports.length === 0) {
        console.log(
          "🔍 No reports found with any user identification strategy"
        );
        console.log("📋 Checking sample documents in collection...");

        // Get a few sample documents to understand the schema
        const sampleDocs = await this.reportsCollection
          .find({})
          .limit(3)
          .toArray();
        sampleDocs.forEach((doc, idx) => {
          console.log(`Sample doc ${idx + 1}:`, {
            _id: doc._id,
            submittedBy: doc.submittedBy,
            userId: doc.userId,
            createdBy: doc.createdBy,
            user: doc.user || "N/A",
          });
        });
      } else {
        console.log(
          `✅ Successfully found ${reports.length} reports for user ${userId} using field: ${matchedField}`
        );
        console.log("📊 User reports summary:");
        reports.forEach((report, idx) => {
          console.log(
            `${idx + 1}. ${report.title} - Status: ${
              report.status || "Unknown"
            } - Created: ${report.createdAt}`
          );
        });
      }

      return reports.map((report) => this.processReportAsKnowledge(report));
    } catch (error) {
      console.error(`Error fetching reports for user ${userId}:`, error);
      throw error;
    }
  }
}

// Singleton instance
let mongoKnowledgeProvider: MongoDBReportsKnowledgeProvider | null = null;

/**
 * Get or create MongoDB knowledge provider instance
 */
export function getMongoKnowledgeProvider(): MongoDBReportsKnowledgeProvider {
  if (!mongoKnowledgeProvider) {
    const connectionString =
      process.env.MONGODB_URI || "mongodb://localhost:27017";
    const dbName = process.env.MONGODB_DB_NAME || "infrastructure_reports";
    mongoKnowledgeProvider = new MongoDBReportsKnowledgeProvider(
      connectionString,
      dbName
    );
  }
  return mongoKnowledgeProvider;
}

/**
 * Initialize MongoDB knowledge provider
 */
export async function initializeMongoKnowledge(): Promise<void> {
  const provider = getMongoKnowledgeProvider();
  await provider.connect();
}

/**
 * Cleanup MongoDB connections
 */
export async function cleanupMongoKnowledge(): Promise<void> {
  if (mongoKnowledgeProvider) {
    await mongoKnowledgeProvider.disconnect();
    mongoKnowledgeProvider = null;
  }
}

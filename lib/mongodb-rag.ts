/**
 * MongoDB Reports Integration for RAG System
 * This module integrates historical reports from MongoDB as knowledge sources
 */

import { MongoClient, Db, Collection } from "mongodb";

export interface ReportDocument {
  _id?: any;
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  date: string;
  time: string;
  location: string;
  coordinates?: string;
  description: string;
  submittedBy: string;
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
  createdAt: string;
  updatedAt: string;
  createdBy: string;
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
    private dbName: string = "infrastructure_reports"
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

    return {
      id: `report-${report.id}`,
      title: `${report.category}: ${report.title} (${report.location})`,
      content,
      category: "historical-reports",
      metadata: {
        reportId: report.id,
        originalCategory: report.category,
        status: report.status,
        priority: report.priority,
        location: report.location,
        coordinates: report.coordinates,
        submittedBy: report.submittedBy,
        assignedTo: report.assignedTo,
        createdAt: report.createdAt,
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
    const sections = [
      `Report ID: ${report.id}`,
      `Title: ${report.title}`,
      `Category: ${report.category}`,
      `Status: ${report.status}`,
      `Priority: ${report.priority}`,
      `Location: ${report.location}`,
      report.coordinates ? `Coordinates: ${report.coordinates}` : "",
      `Date Submitted: ${report.date} at ${report.time}`,
      `Submitted By: ${report.submittedBy}`,
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
   * Search reports by text content
   */
  async searchReports(query: string): Promise<ProcessedReportKnowledge[]> {
    if (!this.reportsCollection) {
      throw new Error("MongoDB connection not established");
    }

    try {
      // Search in title, description, and location
      const searchRegex = { $regex: query, $options: "i" };
      const reports = await this.reportsCollection
        .find({
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { location: searchRegex },
            { category: searchRegex },
          ],
        })
        .toArray();

      return reports.map((report) => this.processReportAsKnowledge(report));
    } catch (error) {
      console.error(`Error searching reports for "${query}":`, error);
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

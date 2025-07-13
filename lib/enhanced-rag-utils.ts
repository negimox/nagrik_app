/**
 * Enhanced RAG Utils for Indian Infrastructure Context
 * Improved retrieval-augmented generation with India-specific knowledge
 */

import { GoogleGenAI } from "@google/genai";
import { genAI } from "./genai-utils";
import {
  getMongoKnowledgeProvider,
  initializeMongoKnowledge,
  type ProcessedReportKnowledge,
} from "./mongodb-rag";
import {
  INDIAN_INFRASTRUCTURE_KNOWLEDGE,
  generateIndianContextPrompt,
  IndianInfrastructureContext,
  INDIAN_REGIONAL_CONTEXTS,
} from "./india-rag-context";

export interface EnhancedRAGConfig {
  maxContextTokens: number;
  similarityThreshold: number;
  maxDocuments: number;
  temperature: number;
  includeIndianContext: boolean;
  regionalContext?: keyof typeof INDIAN_REGIONAL_CONTEXTS;
  governanceContext?: IndianInfrastructureContext;
  userSpecific?: boolean;
  userId?: string;
}

export interface EnhancedRAGResponse {
  answer: string;
  sources: any[];
  confidence: number;
  contextUsed: string[];
  suggestions?: string[];
  relatedIssues?: string[];
  escalationPath?: string;
  faq?: { question: string; answer: string }[];
}

/**
 * Default enhanced RAG configuration for Indian context with Uttarakhand focus
 */
export const ENHANCED_RAG_CONFIG: EnhancedRAGConfig = {
  maxContextTokens: 6000, // Increased for richer context
  similarityThreshold: 0.5, // Lowered for broader matches including MongoDB data
  maxDocuments: 10, // Increased for more comprehensive context including reports
  temperature: 0.4, // Slightly higher for more natural responses
  includeIndianContext: true,
  regionalContext: "north", // Default to north for Uttarakhand
};

/**
 * Enhanced Knowledge Base with Indian Infrastructure Context
 */
class IndianInfrastructureKnowledgeBase {
  private documents: Map<string, any> = new Map();
  private embeddings: Map<string, number[]> = new Map();
  private mongoProvider: any = null;
  private reportKnowledgeLoaded = false;

  constructor() {
    this.initializeIndianKnowledge();
    // Initialize MongoDB connection
    this.initializeWithMongoDB().catch((error) => {
      console.warn("MongoDB initialization failed during constructor:", error);
    });
  }

  /**
   * Initialize with Indian infrastructure knowledge
   */
  private async initializeIndianKnowledge(): Promise<void> {
    for (const doc of INDIAN_INFRASTRUCTURE_KNOWLEDGE) {
      await this.addDocument(doc);
    }
    console.log(
      `Loaded ${INDIAN_INFRASTRUCTURE_KNOWLEDGE.length} Indian infrastructure documents`
    );
  }

  /**
   * Enhanced document addition with better embedding
   */
  async addDocument(doc: any): Promise<void> {
    const embedding = await this.generateEnhancedEmbedding(doc.content);
    const docWithEmbedding = {
      ...doc,
      embedding,
    };

    this.documents.set(doc.id, docWithEmbedding);
    this.embeddings.set(doc.id, embedding);
  }

  /**
   * Enhanced embedding generation with Indian context keywords - Simplified approach
   */
  private async generateEnhancedEmbedding(text: string): Promise<number[]> {
    try {
      // Use simple text-based embedding approach to avoid API issues
      const enhancedText = this.addIndianKeywords(text);
      return this.simpleTextEmbedding(enhancedText);
    } catch (error) {
      console.error("Error generating embedding:", error);
      return this.simpleTextEmbedding(text);
    }
  }

  /**
   * Add Indian infrastructure keywords for better context matching
   */
  private addIndianKeywords(text: string): string {
    const indianKeywords = [
      "municipal corporation",
      "nagar panchayat",
      "ward",
      "monsoon",
      "drainage",
      "sewerage",
      "bharat",
      "infrastructure",
      "civic",
      "governance",
      "municipality",
      "urban",
      "rural",
    ];

    const textLower = text.toLowerCase();
    const relevantKeywords = indianKeywords.filter(
      (keyword) =>
        textLower.includes(keyword) ||
        textLower.includes(keyword.replace(" ", ""))
    );

    return relevantKeywords.length > 0
      ? `${text} [Context: ${relevantKeywords.join(", ")}]`
      : text;
  }

  /**
   * Enhanced similarity calculation with semantic understanding
   */
  private enhancedSimilarity(
    queryEmbedding: number[],
    docEmbedding: number[],
    queryText: string,
    docText: string
  ): number {
    // Basic cosine similarity
    const cosineSim = this.cosineSimilarity(queryEmbedding, docEmbedding);

    // Keyword overlap bonus for Indian context
    const keywordBonus = this.calculateKeywordOverlap(queryText, docText);

    // Seasonal relevance bonus
    const seasonalBonus = this.calculateSeasonalRelevance(queryText, docText);

    return Math.min(1.0, cosineSim + keywordBonus + seasonalBonus);
  }

  /**
   * Calculate keyword overlap for better semantic matching
   */
  private calculateKeywordOverlap(query: string, text: string): number {
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const textWords = new Set(text.toLowerCase().split(/\s+/));

    const intersection = new Set(
      [...queryWords].filter((x) => textWords.has(x))
    );
    const union = new Set([...queryWords, ...textWords]);

    return (intersection.size / Math.max(union.size, 1)) * 0.2; // Max 0.2 bonus
  }

  /**
   * Calculate seasonal relevance for time-sensitive issues
   */
  private calculateSeasonalRelevance(query: string, text: string): number {
    const seasonalTerms = {
      monsoon: ["monsoon", "rain", "flood", "drainage", "waterlog"],
      summer: ["heat", "water shortage", "scarcity", "temperature"],
      winter: ["fog", "visibility", "cold"],
    };

    const currentSeason = this.getCurrentSeason();
    const relevantTerms =
      seasonalTerms[currentSeason as keyof typeof seasonalTerms] || [];

    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    const hasSeasonalRelevance = relevantTerms.some(
      (term) => queryLower.includes(term) && textLower.includes(term)
    );

    return hasSeasonalRelevance ? 0.15 : 0; // 0.15 bonus for seasonal relevance
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 9) return "monsoon";
    if (month >= 3 && month <= 5) return "summer";
    return "winter";
  }

  /**
   * Simple text embedding fallback
   */
  private simpleTextEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(512).fill(0); // Increased dimensions

    words.forEach((word, idx) => {
      const hash = this.simpleHash(word);
      embedding[hash % 512] += 1;
    });

    // Normalize
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    return embedding.map((val) => (magnitude > 0 ? val / magnitude : 0));
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Enhanced search with Indian context - with fallback for embedding issues
   */
  async enhancedSearch(
    query: string,
    config: Partial<EnhancedRAGConfig> = {}
  ): Promise<any[]> {
    const fullConfig = { ...ENHANCED_RAG_CONFIG, ...config };

    // Extract original query by removing enhanced context annotations
    const cleanQuery = this.extractOriginalQuery(query);

    try {
      const queryEmbedding = await this.generateEnhancedEmbedding(query);
      const similarities: { doc: any; score: number }[] = [];

      // Search in knowledge base using embeddings
      for (const [id, doc] of this.documents) {
        if (doc.embedding) {
          const score = this.enhancedSimilarity(
            queryEmbedding,
            doc.embedding,
            query,
            doc.content
          );
          if (score >= fullConfig.similarityThreshold) {
            similarities.push({ doc, score });
          }
        }
      }

      // Search in MongoDB reports if available
      if (this.mongoProvider) {
        try {
          console.log("Searching MongoDB for clean query:", cleanQuery);

          let reportKnowledge;
          // Use user-specific search if configured
          if (fullConfig.userSpecific && fullConfig.userId) {
            console.log(
              "🔍 Enhanced RAG - Using user-specific search for user:",
              fullConfig.userId
            );

            // For status/summary queries, get all user reports
            const statusKeywords = [
              "status",
              "latest",
              "recent",
              "my",
              "how many",
              "submitted",
              "pending",
              "resolved",
              "completed",
            ];
            const isStatusQuery = statusKeywords.some((keyword) =>
              cleanQuery.toLowerCase().includes(keyword)
            );

            console.log(
              `📊 Query analysis: "${cleanQuery}" - isStatusQuery: ${isStatusQuery}`
            );

            if (isStatusQuery) {
              console.log(
                "📋 Detected status query, fetching all user reports"
              );
              reportKnowledge = await this.mongoProvider.getUserReports(
                fullConfig.userId
              );
            } else {
              console.log("🔎 Using keyword-based user search");
              reportKnowledge = await this.mongoProvider.searchUserReports(
                cleanQuery,
                fullConfig.userId
              );
            }
          } else {
            reportKnowledge = await this.mongoProvider.searchReports(
              cleanQuery
            );
          }

          console.log(
            "MongoDB search results:",
            reportKnowledge.length,
            "reports found"
          );

          for (const knowledge of reportKnowledge) {
            const score = this.calculateReportRelevance(cleanQuery, knowledge);
            console.log(`Report "${knowledge.title}" relevance score:`, score);

            // Lower threshold for user-specific queries to include more results
            const threshold = fullConfig.userSpecific
              ? 0.3
              : fullConfig.similarityThreshold;

            if (score >= threshold) {
              similarities.push({
                doc: {
                  id: knowledge.id,
                  title: knowledge.title,
                  content: knowledge.content,
                  category: knowledge.category,
                  metadata: knowledge.metadata,
                  timestamp: knowledge.timestamp,
                },
                score,
              });
            }
          }
        } catch (error) {
          console.error("Error searching MongoDB reports:", error);
        }
      } else {
        console.warn("MongoDB provider not available, using fallback search");
        // Try to initialize MongoDB if not already done
        await this.initializeWithMongoDB();

        // Try search again if provider is now available
        if (this.mongoProvider) {
          try {
            console.log("Retrying MongoDB search after initialization...");
            console.log("Retrying MongoDB for clean query:", cleanQuery);

            let reportKnowledge: ProcessedReportKnowledge[] = [];

            if (fullConfig.userSpecific && fullConfig.userId) {
              console.log(
                "🔄 Retry: User-specific search for user:",
                fullConfig.userId
              );

              // For status/summary queries, get all user reports
              const statusKeywords = [
                "status",
                "latest",
                "recent",
                "my",
                "how many",
                "submitted",
                "pending",
                "resolved",
                "completed",
              ];
              const isStatusQuery = statusKeywords.some((keyword) =>
                cleanQuery.toLowerCase().includes(keyword)
              );
              console.log(
                `📊 Retry query analysis: "${cleanQuery}" - isStatusQuery: ${isStatusQuery}`
              );

              if (isStatusQuery) {
                console.log(
                  "📋 Retry: Detected status query, fetching all user reports"
                );
                reportKnowledge = await this.mongoProvider.getUserReports(
                  fullConfig.userId
                );
              } else {
                console.log("🔎 Retry: Using keyword-based user search");
                reportKnowledge = await this.mongoProvider.searchUserReports(
                  cleanQuery,
                  fullConfig.userId
                );
              }
            } else {
              reportKnowledge = await this.mongoProvider.searchReports(
                cleanQuery
              );
            }

            console.log(
              "MongoDB retry search results:",
              reportKnowledge.length,
              "reports found"
            );

            for (const knowledge of reportKnowledge) {
              const score = this.calculateReportRelevance(
                cleanQuery,
                knowledge
              );
              console.log(
                `Report "${knowledge.title}" relevance score:`,
                score
              );

              // Lower threshold for user-specific queries to include more results
              const threshold = fullConfig.userSpecific
                ? 0.3
                : fullConfig.similarityThreshold;

              if (score >= threshold) {
                similarities.push({
                  doc: {
                    id: knowledge.id,
                    title: knowledge.title,
                    content: knowledge.content,
                    category: knowledge.category,
                    metadata: knowledge.metadata,
                    timestamp: knowledge.timestamp,
                  },
                  score,
                });
              }
            }
          } catch (error) {
            console.error("Error in MongoDB retry search:", error);
          }
        }
      }

      // If no results with embeddings, fall back to text search
      if (similarities.length === 0) {
        console.log("No results found, falling back to text search");
        return this.fallbackTextSearch(cleanQuery, fullConfig);
      }

      // Sort by similarity score
      similarities.sort((a, b) => b.score - a.score);

      return similarities
        .slice(0, fullConfig.maxDocuments)
        .map((item) => item.doc);
    } catch (error) {
      console.error(
        "Error in enhanced search, falling back to text search:",
        error
      );
      return this.fallbackTextSearch(cleanQuery, fullConfig);
    }
  }

  /**
   * Extract original query from enhanced query with context annotations
   */
  private extractOriginalQuery(enhancedQuery: string): string {
    // Remove context annotations like [User-specific query for user: xyz], [Category context: xyz], etc.
    let cleanQuery = enhancedQuery;

    // Remove user-specific context annotations
    cleanQuery = cleanQuery.replace(
      /\s*\[User-specific query for user:.*?\]/gi,
      ""
    );

    // Remove category context annotations
    cleanQuery = cleanQuery.replace(/\s*\[Category context:.*?\]/gi, "");

    // Remove regional context annotations
    cleanQuery = cleanQuery.replace(/\s*\[Regional context:.*?\]/gi, "");

    // Remove any other square bracket annotations
    cleanQuery = cleanQuery.replace(/\s*\[.*?\]/g, "");

    // Trim whitespace and clean up multiple spaces
    cleanQuery = cleanQuery.trim().replace(/\s+/g, " ");

    return cleanQuery;
  }

  /**
   * Fallback text-based search when embeddings fail
   */
  private async fallbackTextSearch(
    query: string,
    config: EnhancedRAGConfig
  ): Promise<any[]> {
    const queryLower = query.toLowerCase();
    const matches: { doc: any; score: number }[] = [];

    // Simple keyword matching for knowledge base
    for (const [id, doc] of this.documents) {
      const score = this.calculateTextSimilarity(
        queryLower,
        doc.content,
        doc.title,
        doc.category
      );
      if (score > 0.1) {
        // Lower threshold for text matching
        matches.push({ doc, score });
      }
    }

    // Also search MongoDB with text-based approach
    if (this.mongoProvider) {
      try {
        console.log("Fallback: Searching MongoDB for query:", query);
        const reportKnowledge = await this.mongoProvider.searchReports(query);
        console.log(
          "Fallback MongoDB search results:",
          reportKnowledge.length,
          "reports found"
        );

        for (const knowledge of reportKnowledge) {
          const score = this.calculateReportRelevance(query, knowledge);
          console.log(
            `Fallback Report "${knowledge.title}" relevance score:`,
            score
          );

          if (score > 0.1) {
            // Lower threshold for fallback
            matches.push({
              doc: {
                id: knowledge.id,
                title: knowledge.title,
                content: knowledge.content,
                category: knowledge.category,
                metadata: knowledge.metadata,
                timestamp: knowledge.timestamp,
              },
              score,
            });
          }
        }
      } catch (error) {
        console.error("Error in fallback MongoDB search:", error);
      }
    }

    // Sort by score and return top results
    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, config.maxDocuments).map((item) => item.doc);
  }

  /**
   * Calculate text similarity score
   */
  private calculateTextSimilarity(
    query: string,
    content: string,
    title: string,
    category: string
  ): number {
    const contentLower = content.toLowerCase();
    const titleLower = title.toLowerCase();
    const categoryLower = category.toLowerCase();

    let score = 0;

    // Check for exact phrase matches
    if (contentLower.includes(query)) score += 0.8;
    if (titleLower.includes(query)) score += 0.6;
    if (categoryLower.includes(query)) score += 0.4;

    // Check for keyword matches
    const queryWords = query.split(" ").filter((word) => word.length > 2);
    let wordMatches = 0;

    for (const word of queryWords) {
      if (contentLower.includes(word)) wordMatches++;
      if (titleLower.includes(word)) wordMatches++;
      if (categoryLower.includes(word)) wordMatches++;
    }

    score += (wordMatches / (queryWords.length * 3)) * 0.5;

    // Boost for Uttarakhand-specific content
    if (
      contentLower.includes("uttarakhand") ||
      contentLower.includes("dehradun") ||
      contentLower.includes("chakrata") ||
      contentLower.includes("selakui")
    ) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate relevance score for MongoDB reports with Uttarakhand-specific context
   */
  private calculateReportRelevance(query: string, report: any): number {
    const queryLower = query.toLowerCase();
    const contentLower = (report.content || "").toLowerCase();
    const titleLower = (report.title || "").toLowerCase();
    const locationLower = (report.metadata?.location || "").toLowerCase();
    const categoryLower = (
      report.metadata?.originalCategory ||
      report.category ||
      ""
    ).toLowerCase();

    let score = 0;

    // Direct category match gets very high score
    if (
      categoryLower.includes(queryLower) ||
      queryLower.includes(categoryLower)
    ) {
      score += 0.9;
    }

    // Title match gets high score
    if (titleLower.includes(queryLower)) score += 0.8;

    // Content match
    if (contentLower.includes(queryLower)) score += 0.6;

    // Keyword matching for better relevance
    const queryWords = queryLower.split(" ").filter((word) => word.length > 2);
    let keywordMatches = 0;

    for (const word of queryWords) {
      if (titleLower.includes(word)) keywordMatches += 3;
      if (categoryLower.includes(word)) keywordMatches += 3;
      if (contentLower.includes(word)) keywordMatches += 1;
      if (locationLower.includes(word)) keywordMatches += 1;
    }

    score += Math.min(0.6, keywordMatches * 0.1);

    // Category relevance for infrastructure terms
    const infrastructureKeywords = {
      streetlight: [
        "streetlight",
        "street light",
        "lighting",
        "lamp",
        "pole",
        "damaged",
      ],
      road: ["pothole", "road", "street", "asphalt", "pavement", "traffic"],
      water: ["water", "pipe", "supply", "leak", "drainage"],
      electricity: ["light", "power", "electrical", "transformer", "pole"],
      waste: ["garbage", "waste", "trash", "cleaning", "dustbin"],
    };

    for (const [type, keywords] of Object.entries(infrastructureKeywords)) {
      if (
        keywords.some(
          (keyword) =>
            queryLower.includes(keyword) &&
            (categoryLower.includes(type) ||
              titleLower.includes(keyword) ||
              contentLower.includes(keyword))
        )
      ) {
        score += 0.4;
        break;
      }
    }

    // Special handling for "recent" queries
    if (queryLower.includes("recent") || queryLower.includes("latest")) {
      if (report.metadata?.createdAt) {
        const reportDate = new Date(report.metadata.createdAt);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        if (reportDate > oneMonthAgo) {
          score += 0.5; // High bonus for recent reports when asking for recent
        }
      }
    }

    // Location relevance with Uttarakhand-specific matching
    const uttarakhandLocations = [
      "dehradun",
      "haridwar",
      "nainital",
      "mussoorie",
      "rishikesh",
      "chakrata",
      "selakui",
      "dhoolkot",
      "uttarakhand",
    ];

    // Boost score for Uttarakhand locations
    if (
      uttarakhandLocations.some(
        (loc) => locationLower.includes(loc) || queryLower.includes(loc)
      )
    ) {
      score += 0.3;
    }

    // General location relevance
    if (report.metadata?.location && queryLower.includes(locationLower)) {
      score += 0.2;
    }

    // Status relevance for current issues
    if (report.metadata?.status) {
      const status = report.metadata.status.toLowerCase();
      if (
        ["pending", "assigned", "in progress", "new"].includes(status) &&
        ["current", "ongoing", "active", "recent"].some((term) =>
          queryLower.includes(term)
        )
      ) {
        score += 0.3;
      }
    }

    // Priority relevance
    if (
      report.metadata?.priority &&
      queryLower.includes(report.metadata.priority.toLowerCase())
    ) {
      score += 0.2;
    }

    // Recent report bonus (within last 6 months)
    if (report.metadata?.createdAt) {
      const reportDate = new Date(report.metadata.createdAt);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      if (reportDate > sixMonthsAgo) {
        score += 0.2;
      }

      // Extra bonus for very recent reports (within last week)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      if (reportDate > oneWeekAgo) {
        score += 0.2;
      }
    }

    console.log(`Report relevance calculation for "${report.title}":`, {
      query: queryLower,
      category: categoryLower,
      title: titleLower,
      finalScore: Math.min(1.0, score),
    });

    return Math.min(1.0, score);
  }

  /**
   * Initialize MongoDB integration
   */
  async initializeWithMongoDB(): Promise<void> {
    try {
      await initializeMongoKnowledge();
      this.mongoProvider = getMongoKnowledgeProvider();
      console.log("MongoDB knowledge provider initialized");
    } catch (error) {
      console.warn("MongoDB knowledge provider initialization failed:", error);
    }
  }

  getAllDocuments(): any[] {
    return Array.from(this.documents.values());
  }
}

// Global instance
const enhancedKnowledgeBase = new IndianInfrastructureKnowledgeBase();

/**
 * Enhanced RAG response generation with Indian context
 */
export async function generateEnhancedRAGResponse(
  query: string,
  config: Partial<EnhancedRAGConfig> = {}
): Promise<EnhancedRAGResponse> {
  const fullConfig = { ...ENHANCED_RAG_CONFIG, ...config };

  try {
    // 1. Retrieve relevant documents
    const relevantDocs = await enhancedKnowledgeBase.enhancedSearch(
      query,
      fullConfig
    );

    // 2. Build enhanced context
    const context =
      relevantDocs.length > 0
        ? relevantDocs
            .map(
              (doc) =>
                `### ${doc.title} (Category: ${doc.category})\n${doc.content}`
            )
            .join("\n\n")
        : "No specific context available from knowledge base. Providing general guidance for Uttarakhand infrastructure.";

    // 3. Generate Indian context prompt
    const indianContextPrompt = fullConfig.includeIndianContext
      ? generateIndianContextPrompt(
          fullConfig.governanceContext,
          fullConfig.regionalContext
        )
      : "You are a helpful AI assistant specialized in infrastructure reporting and civic issues.";

    // 4. Enhanced prompt with suggestions and escalation paths
    const isUserSpecific = fullConfig.userSpecific && fullConfig.userId;
    const userContextNote = isUserSpecific
      ? "\n\nNOTE: This is a user-specific query. The context above contains ONLY reports submitted by this specific user. Answer questions about 'my reports', 'my latest report', etc. based on this user's data."
      : "";

    const enhancedPrompt = `${indianContextPrompt}

Based on the following knowledge base context, please provide a focused response:

=== KNOWLEDGE BASE CONTEXT ===
${context}
=== END CONTEXT ===${userContextNote}

User Question: ${query}

IMPORTANT: Only provide what the user specifically asks for. Do not add extra information unless explicitly requested.

Guidelines:
- If this is a user-specific query (asking about "my reports", "my latest", etc.), use ONLY the reports from the context above
- If asked about "recent issues" or "problems" - list only the issues/problems
- If asked about "solutions" - provide only solutions
- If asked about "next steps" - provide only action steps
- If asked about "authorities" - list only relevant contacts
- If asked for "details" or "comprehensive response" - then provide full analysis
- For status queries, provide specific report status information from the context

Keep your response concise and directly answer what was asked. If no relevant data is found in the context for user-specific queries, clearly state that no reports were found for this user.`;

    // 5. Generate response using Gemini
    const result = await genAI.models.generateContent({
      model: "models/gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: enhancedPrompt }] }],
      config: {
        temperature: fullConfig.temperature,
      },
    });

    const answer = result.text || "";

    // 6. Generate suggestions, escalation paths, and FAQ
    const suggestions = await generateSuggestions(query, relevantDocs);
    const escalationPath = generateEscalationPath(query);
    const relatedIssues = await findRelatedIssues(query, relevantDocs);
    const faq = generateFAQ(query, relevantDocs);

    // 7. Calculate enhanced confidence
    const confidence = calculateEnhancedConfidence(relevantDocs, query, answer);

    return {
      answer,
      sources: relevantDocs,
      confidence,
      contextUsed: relevantDocs.map((doc) => doc.category),
      suggestions,
      relatedIssues,
      escalationPath,
      faq,
    };
  } catch (error) {
    console.error("Error generating enhanced RAG response:", error);
    throw new Error("Failed to generate context-aware response");
  }
}

/**
 * Generate actionable suggestions based on query and context with Uttarakhand focus
 * Only provides suggestions when appropriate for the query type
 */
async function generateSuggestions(
  query: string,
  docs: any[]
): Promise<string[]> {
  const suggestions: string[] = [];
  const queryLower = query.toLowerCase();

  // Don't provide suggestions for general information queries
  const isInformationQuery = [
    "recent",
    "list",
    "what are",
    "show me",
    "tell me about",
  ].some((phrase) => queryLower.includes(phrase));

  // Don't provide suggestions for status/information-only queries
  if (
    isInformationQuery &&
    !queryLower.includes("how") &&
    !queryLower.includes("solution") &&
    !queryLower.includes("fix")
  ) {
    return suggestions; // Return empty array
  }

  // Location-specific suggestions
  const isUttarakhandQuery = [
    "uttarakhand",
    "dehradun",
    "haridwar",
    "chakrata",
    "selakui",
    "dhoolkot",
  ].some((loc) => queryLower.includes(loc));

  // Only provide suggestions for action-oriented queries
  if (
    queryLower.includes("how") ||
    queryLower.includes("solution") ||
    queryLower.includes("fix") ||
    queryLower.includes("resolve") ||
    queryLower.includes("report")
  ) {
    if (queryLower.includes("pothole") || queryLower.includes("गड्ढ")) {
      suggestions.push(
        "Take photos showing the size and exact location with nearby landmarks"
      );
      suggestions.push(
        "Note the road name and nearest kilometer stone or building number"
      );
      if (isUttarakhandQuery) {
        suggestions.push(
          "For hill roads, report slope stability issues if visible around potholes"
        );
        suggestions.push(
          "Contact Dehradun Municipal Corporation or local Nagar Panchayat"
        );
      }
      suggestions.push(
        "Report through Uttarakhand state portal or municipal app"
      );
      suggestions.push(
        "Follow up if not resolved within 7-15 days depending on road type"
      );
    }

    if (queryLower.includes("drainage") || queryLower.includes("water")) {
      suggestions.push(
        "Check if the issue is seasonal (monsoon-related) or year-round"
      );
      suggestions.push("Identify if it's a maintenance or design problem");
      if (isUttarakhandQuery) {
        suggestions.push(
          "For hill areas, check for natural drainage flow and slope issues"
        );
        suggestions.push(
          "Contact Public Health Engineering Department (PHED) for water supply issues"
        );
      }
      suggestions.push("Contact ward office for immediate attention");
      suggestions.push(
        "Take photos during different weather conditions if possible"
      );
    }

    if (
      queryLower.includes("street light") ||
      queryLower.includes("lighting")
    ) {
      suggestions.push("Note the pole number if visible");
      suggestions.push("Report during evening hours with exact location");
      suggestions.push("Check if multiple lights in area are affected");
      if (isUttarakhandQuery) {
        suggestions.push(
          "For hill stations, mention tourist area priority if applicable"
        );
        suggestions.push(
          "Contact Uttarakhand Power Corporation Limited (UPCL) for grid issues"
        );
      }
    }

    if (queryLower.includes("road") && queryLower.includes("chakrata")) {
      suggestions.push(
        "Chakrata Road is a major hill route - report to PWD for highway sections"
      );
      suggestions.push(
        "For Selakui and Dhoolkot areas, contact Dehradun Municipal Corporation"
      );
      suggestions.push(
        "Include vehicle damage details if applicable for compensation claims"
      );
      suggestions.push(
        "Report during dry weather for better assessment visibility"
      );
    }

    // General Uttarakhand suggestions for action queries
    if (isUttarakhandQuery) {
      suggestions.push(
        "Consider seasonal timing - avoid monsoon season for non-urgent repairs"
      );
      suggestions.push(
        "Check with local tourism department if issue affects tourist areas"
      );
      suggestions.push(
        "Coordinate with forest department if issue is near protected areas"
      );
    }

    // Add category-specific suggestions based on documents
    const categories = docs.map((doc) => doc.category);
    if (categories.includes("seasonal") || categories.includes("monsoon")) {
      suggestions.push(
        "Plan repairs considering Uttarakhand's monsoon season (June-September)"
      );
      suggestions.push("Check for landslide risk assessment if in hilly areas");
    }
  }

  return suggestions;
}

/**
 * Generate escalation path for issues with Uttarakhand-specific authorities
 */
function generateEscalationPath(query: string): string {
  const queryLower = query.toLowerCase();

  // Don't provide escalation path for general information queries
  const isInformationQuery = [
    "recent",
    "list",
    "what are",
    "show me",
    "tell me about",
  ].some((phrase) => queryLower.includes(phrase));

  if (
    isInformationQuery &&
    !queryLower.includes("contact") &&
    !queryLower.includes("report")
  ) {
    return ""; // Return empty string
  }

  // Only provide escalation path for action-oriented queries
  if (
    !queryLower.includes("how") &&
    !queryLower.includes("contact") &&
    !queryLower.includes("report") &&
    !queryLower.includes("authority") &&
    !queryLower.includes("escalat")
  ) {
    return "";
  }

  const priority = determinePriority(query);

  // Check if it's a road-related issue on major highways
  const isHighwayIssue = [
    "chakrata road",
    "highway",
    "national highway",
    "state highway",
  ].some((term) => queryLower.includes(term));

  // Check if it's within municipal limits
  const isMunicipalIssue = ["dehradun", "selakui", "municipal", "ward"].some(
    (term) => queryLower.includes(term)
  );

  // Check if it's a hill station or tourist area
  const isTouristArea = [
    "mussoorie",
    "nainital",
    "chakrata",
    "tourist",
    "hill station",
  ].some((term) => queryLower.includes(term));

  let escalationPath = "";

  if (isHighwayIssue) {
    escalationPath =
      "PWD Division → PWD Superintending Engineer → PWD Chief Engineer → Secretary PWD Uttarakhand";
  } else if (isTouristArea) {
    escalationPath =
      "Local Nagar Panchayat/Municipal Council → Tourism Development Board → District Collector → State Tourism Secretary";
  } else if (isMunicipalIssue) {
    switch (priority) {
      case "high":
        escalationPath =
          "Ward Officer → Executive Officer → Municipal Commissioner → District Magistrate → Secretary Urban Development";
        break;
      case "medium":
        escalationPath =
          "Ward Officer → Executive Officer → Municipal Commissioner";
        break;
      case "low":
        escalationPath =
          "Ward Officer → Assistant Executive Officer → Executive Officer";
        break;
      default:
        escalationPath = "Ward Officer → Municipal Corporation Dehradun";
    }
  } else {
    // Rural/Panchayat areas
    switch (priority) {
      case "high":
        escalationPath =
          "Gram Panchayat → Block Development Officer → District Panchayati Raj Officer → District Collector";
        break;
      case "medium":
        escalationPath =
          "Gram Panchayat → Block Development Officer → District Panchayati Raj Officer";
        break;
      case "low":
        escalationPath = "Gram Panchayat → Block Development Officer";
        break;
      default:
        escalationPath = "Gram Panchayat → Block Development Officer";
    }
  }

  // Add department-specific escalation
  if (queryLower.includes("water") || queryLower.includes("jal")) {
    escalationPath +=
      " | Water Issues: PHED Division → PHED Superintending Engineer → PHED Chief Engineer";
  }

  if (
    queryLower.includes("electricity") ||
    queryLower.includes("power") ||
    queryLower.includes("light")
  ) {
    escalationPath +=
      " | Power Issues: UPCL Sub-Division → UPCL Division → UPCL Circle → UPCL Managing Director";
  }

  if (
    queryLower.includes("forest") ||
    queryLower.includes("tree") ||
    queryLower.includes("environment")
  ) {
    escalationPath +=
      " | Forest Issues: Range Officer → Divisional Forest Officer → Conservator of Forests → Principal Chief Conservator";
  }

  return escalationPath;
}

/**
 * Determine priority level based on query content
 */
function determinePriority(query: string): string {
  const highPriorityTerms = [
    "accident",
    "emergency",
    "fallen tree",
    "electrical wire",
    "sewage overflow",
  ];
  const mediumPriorityTerms = [
    "pothole",
    "street light",
    "drainage",
    "garbage",
  ];

  const queryLower = query.toLowerCase();

  if (highPriorityTerms.some((term) => queryLower.includes(term)))
    return "high";
  if (mediumPriorityTerms.some((term) => queryLower.includes(term)))
    return "medium";
  return "low";
}

/**
 * Find related issues based on current query with Uttarakhand context
 * Only provides related issues when relevant to the context
 */
async function findRelatedIssues(
  query: string,
  docs: any[]
): Promise<string[]> {
  const relatedIssues: string[] = [];
  const queryLower = query.toLowerCase();

  // Don't provide related issues for general information queries unless asking for analysis
  const isInformationQuery = [
    "recent",
    "list",
    "what are",
    "show me",
    "tell me about",
  ].some((phrase) => queryLower.includes(phrase));

  if (
    isInformationQuery &&
    !queryLower.includes("related") &&
    !queryLower.includes("similar") &&
    !queryLower.includes("analysis") &&
    !queryLower.includes("impact")
  ) {
    return relatedIssues; // Return empty array
  }

  // Extract categories from relevant documents
  const categories = docs.map((doc) => doc.category);

  // Uttarakhand-specific related issues
  const isUttarakhandContext = [
    "uttarakhand",
    "dehradun",
    "chakrata",
    "selakui",
    "dhoolkot",
    "hill",
  ].some((term) => queryLower.includes(term));

  if (
    categories.includes("drainage") ||
    queryLower.includes("water") ||
    queryLower.includes("drainage")
  ) {
    relatedIssues.push("Monsoon waterlogging in low-lying areas");
    relatedIssues.push("Mosquito breeding in stagnant water");
    if (isUttarakhandContext) {
      relatedIssues.push("Hill slope erosion due to poor drainage");
      relatedIssues.push("Spring water contamination during monsoon");
    }
    relatedIssues.push("Road damage due to water logging");
    relatedIssues.push("Sewage system overflow");
  }

  if (
    categories.includes("roads") ||
    queryLower.includes("road") ||
    queryLower.includes("pothole")
  ) {
    relatedIssues.push("Traffic congestion due to poor roads");
    relatedIssues.push("Vehicle damage claims");
    relatedIssues.push("Pedestrian safety concerns");
    if (isUttarakhandContext) {
      relatedIssues.push("Landslide risks on hill roads during monsoon");
      relatedIssues.push("Tourist vehicle safety on winding hill roads");
      relatedIssues.push("Heavy vehicle restrictions on narrow hill roads");
    }
  }

  if (queryLower.includes("chakrata") || queryLower.includes("dhoolkot")) {
    relatedIssues.push("Heavy commercial vehicle damage to road surface");
    relatedIssues.push("Dust pollution from unpaved sections");
    relatedIssues.push("Visibility issues during fog season");
    relatedIssues.push("Wildlife crossing safety measures needed");
  }

  if (
    categories.includes("electricity") ||
    queryLower.includes("light") ||
    queryLower.includes("power")
  ) {
    relatedIssues.push("Power outages during storms");
    relatedIssues.push("Transformer overloading in summer");
    if (isUttarakhandContext) {
      relatedIssues.push("Grid connectivity issues in remote hill areas");
      relatedIssues.push("Solar panel maintenance in hilly terrain");
      relatedIssues.push("Wildlife damage to power lines");
    }
  }

  if (isUttarakhandContext) {
    // Add general Uttarakhand-related issues
    relatedIssues.push("Seasonal accessibility issues");
    relatedIssues.push("Tourist influx management during peak season");
    relatedIssues.push("Environmental clearance requirements");
  }

  // Check for seasonal patterns
  const currentMonth = new Date().getMonth() + 1;
  if (currentMonth >= 6 && currentMonth <= 9) {
    // Monsoon
    relatedIssues.push("Monsoon-related infrastructure damage");
    if (isUttarakhandContext) {
      relatedIssues.push("Landslide monitoring and road closure risks");
    }
  } else if (currentMonth >= 12 || currentMonth <= 2) {
    // Winter
    if (isUttarakhandContext) {
      relatedIssues.push("Winter road connectivity in higher altitudes");
      relatedIssues.push("Water pipe freezing in hill stations");
    }
  }

  return [...new Set(relatedIssues)]; // Remove duplicates
}

/**
 * Generate context-aware FAQ based on query patterns with Uttarakhand specifics
 * Only provides FAQ when appropriate for the query type
 */
function generateFAQ(
  query: string,
  docs: any[]
): { question: string; answer: string }[] {
  const faq: { question: string; answer: string }[] = [];
  const queryLower = query.toLowerCase();

  // Don't provide FAQ for general information queries unless explicitly asking for help
  const isInformationQuery = [
    "recent",
    "list",
    "what are",
    "show me",
    "tell me about",
  ].some((phrase) => queryLower.includes(phrase));

  if (
    isInformationQuery &&
    !queryLower.includes("help") &&
    !queryLower.includes("how") &&
    !queryLower.includes("faq") &&
    !queryLower.includes("question")
  ) {
    return faq; // Return empty array
  }

  // Only provide FAQ for help-seeking or action-oriented queries
  if (
    !queryLower.includes("how") &&
    !queryLower.includes("help") &&
    !queryLower.includes("faq") &&
    !queryLower.includes("question") &&
    !queryLower.includes("procedure")
  ) {
    return faq;
  }

  // Check if this is Uttarakhand context
  const isUttarakhandContext = [
    "uttarakhand",
    "dehradun",
    "chakrata",
    "selakui",
    "dhoolkot",
    "hill",
  ].some((term) => queryLower.includes(term));

  // Road-related FAQ
  if (queryLower.includes("road") || queryLower.includes("pothole")) {
    faq.push({
      question: "How long does road repair typically take?",
      answer: isUttarakhandContext
        ? "In Uttarakhand, road repairs in hill areas typically take 7-15 days depending on weather conditions and accessibility. Monsoon season repairs may take longer due to terrain challenges."
        : "Road repairs typically take 3-7 days depending on the extent of damage and weather conditions.",
    });

    if (isUttarakhandContext) {
      faq.push({
        question: "Are there restrictions for heavy vehicles on hill roads?",
        answer:
          "Yes, in Uttarakhand hill areas, heavy commercial vehicles are often restricted during monsoon season and have specific timings on narrow mountain roads like Chakrata Road.",
      });

      faq.push({
        question: "What should I do about landslide-damaged roads?",
        answer:
          "Report landslide-affected roads immediately to the District Magistrate office and PWD. These are treated as emergency cases in Uttarakhand due to safety concerns.",
      });
    }
  }

  // Drainage-related FAQ
  if (queryLower.includes("drain") || queryLower.includes("water")) {
    faq.push({
      question: "How to prevent waterlogging during monsoon?",
      answer: isUttarakhandContext
        ? "In Uttarakhand's hilly terrain, ensure proper hill slope drainage and maintain natural water channels. Report blocked drains immediately as they can cause slope instability."
        : "Ensure regular cleaning of storm drains and report blocked drains to prevent waterlogging during heavy rains.",
    });

    if (isUttarakhandContext) {
      faq.push({
        question: "What about spring water contamination issues?",
        answer:
          "Spring water contamination in Uttarakhand hills should be reported to the Public Health Engineering Department (PHED). They handle water quality testing and purification in mountain areas.",
      });
    }
  }

  // Electricity-related FAQ
  if (
    queryLower.includes("light") ||
    queryLower.includes("power") ||
    queryLower.includes("electricity")
  ) {
    faq.push({
      question: "How to report power outages?",
      answer: isUttarakhandContext
        ? "In Uttarakhand, report power outages to UPCL (Uttarakhand Power Corporation Limited) helpline. Hill area outages may take longer to restore due to terrain challenges."
        : "Report power outages to your local electricity board helpline or through their mobile app.",
    });

    if (isUttarakhandContext) {
      faq.push({
        question: "Can I get solar panels installed in hill areas?",
        answer:
          "Yes, Uttarakhand government provides subsidies for solar installations in hill areas. Contact the Uttarakhand Renewable Energy Development Agency (UREDA) for assistance.",
      });
    }
  }

  // Location-specific FAQ
  if (queryLower.includes("chakrata") || queryLower.includes("dhoolkot")) {
    faq.push({
      question: "How to report issues on Chakrata Road?",
      answer:
        "Chakrata Road issues should be reported to Dehradun Municipal Corporation for urban sections and PWD for highway sections. Mention the specific kilometer marker for faster response.",
    });
  }

  if (queryLower.includes("selakui")) {
    faq.push({
      question: "What are the development priorities for Selakui area?",
      answer:
        "Selakui is a developing area near Dehradun with focus on industrial development. Infrastructure issues here fall under Vikasnagar block administration.",
    });
  }

  // General governance FAQ for Uttarakhand
  if (isUttarakhandContext) {
    faq.push({
      question:
        "Which office should I contact for urgent infrastructure issues?",
      answer:
        "For urgent issues in Uttarakhand: District Magistrate office for emergencies, Municipal Corporation for urban areas, Block Development Office for rural areas, and PWD for major roads and bridges.",
    });

    faq.push({
      question: "How does weather affect infrastructure response times?",
      answer:
        "In Uttarakhand's mountainous terrain, monsoon season (June-September) and winter (December-February) can significantly impact response times due to accessibility and weather-related safety concerns.",
    });
  }

  return faq;
}

/**
 * Calculate enhanced confidence score
 */
function calculateEnhancedConfidence(
  docs: any[],
  query: string,
  answer: string
): number {
  let confidence = 0.1; // Base confidence

  // Document relevance factor
  confidence += Math.min(0.4, docs.length * 0.05);

  // Indian context factor
  const hasIndianTerms =
    /municipal|corporation|ward|monsoon|drainage|नगर|निगम/i.test(
      query + answer
    );
  if (hasIndianTerms) confidence += 0.2;

  // Completeness factor
  const answerLength = answer.length;
  if (answerLength > 200) confidence += 0.1;
  if (answerLength > 500) confidence += 0.1;

  // Specific solution factor
  const hasSolution = /contact|report|visit|call|submit/i.test(answer);
  if (hasSolution) confidence += 0.1;

  return Math.min(0.95, confidence);
}

/**
 * Initialize enhanced knowledge base
 */
export async function initializeEnhancedKnowledgeBase(): Promise<void> {
  await enhancedKnowledgeBase.initializeWithMongoDB();
  console.log("Enhanced Indian infrastructure knowledge base initialized");
}

export { enhancedKnowledgeBase };

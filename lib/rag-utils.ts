/**
 * RAG (Retrieval-Augmented Generation) utilities for Gemini AI
 * This module provides context-aware AI responses using custom knowledge datasets
 */

import { GoogleGenAI } from "@google/genai";
import { genAI } from "./genai-utils";
import {
  getMongoKnowledgeProvider,
  initializeMongoKnowledge,
  type ProcessedReportKnowledge,
} from "./mongodb-rag";

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  metadata?: Record<string, any>;
  embedding?: number[];
  timestamp: Date;
}

export interface RAGConfig {
  maxContextTokens: number;
  similarityThreshold: number;
  maxDocuments: number;
  temperature: number;
}

export interface RAGResponse {
  answer: string;
  sources: KnowledgeDocument[];
  confidence: number;
}

/**
 * Default RAG configuration
 */
export const DEFAULT_RAG_CONFIG: RAGConfig = {
  maxContextTokens: 4000,
  similarityThreshold: 0.7,
  maxDocuments: 5,
  temperature: 0.3,
};

/**
 * In-memory knowledge base (for demo purposes)
 * In production, this would be stored in a vector database like ChromaDB, Pinecone, or Supabase
 */
class KnowledgeBase {
  private documents: Map<string, KnowledgeDocument> = new Map();
  private embeddings: Map<string, number[]> = new Map();

  /**
   * Add a document to the knowledge base
   */
  async addDocument(doc: Omit<KnowledgeDocument, "embedding">): Promise<void> {
    const embedding = await this.generateEmbedding(doc.content);
    const docWithEmbedding: KnowledgeDocument = {
      ...doc,
      embedding,
    };

    this.documents.set(doc.id, docWithEmbedding);
    this.embeddings.set(doc.id, embedding);
  }

  /**
   * Generate embedding for text using Gemini
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await genAI.models.generateContent({
        model: "text-embedding-004",
        contents: [{ parts: [{ text }] }],
      });
      // Note: Embedding API might not be available, fallback to simple method
      return this.simpleTextEmbedding(text);
    } catch (error) {
      console.error("Error generating embedding:", error);
      // Fallback: simple text-based similarity (not recommended for production)
      return this.simpleTextEmbedding(text);
    }
  }

  /**
   * Simple fallback embedding using text characteristics
   * This is not recommended for production - use proper embeddings
   */
  private simpleTextEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0);

    words.forEach((word, idx) => {
      const hash = this.simpleHash(word);
      embedding[hash % 384] += 1;
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
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
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
   * Search for similar documents
   */
  async search(
    query: string,
    config: Partial<RAGConfig> = {}
  ): Promise<KnowledgeDocument[]> {
    const fullConfig = { ...DEFAULT_RAG_CONFIG, ...config };
    const queryEmbedding = await this.generateEmbedding(query);

    const similarities: { doc: KnowledgeDocument; score: number }[] = [];

    for (const [id, doc] of this.documents) {
      if (doc.embedding) {
        const score = this.cosineSimilarity(queryEmbedding, doc.embedding);
        if (score >= fullConfig.similarityThreshold) {
          similarities.push({ doc, score });
        }
      }
    }

    // Sort by similarity score (descending)
    similarities.sort((a, b) => b.score - a.score);

    return similarities
      .slice(0, fullConfig.maxDocuments)
      .map((item) => item.doc);
  }

  /**
   * Get all documents by category
   */
  getDocumentsByCategory(category: string): KnowledgeDocument[] {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.category === category
    );
  }

  /**
   * Get document by ID
   */
  getDocument(id: string): KnowledgeDocument | undefined {
    return this.documents.get(id);
  }

  /**
   * Get all documents
   */
  getAllDocuments(): KnowledgeDocument[] {
    return Array.from(this.documents.values());
  }
}

// Enhanced knowledge base instance (declared after class definition)
// This will be initialized at the bottom of the file

/**
 * Generate a context-aware response using RAG
 */
export async function generateRAGResponse(
  query: string,
  systemContext?: string,
  config: Partial<RAGConfig> = {}
): Promise<RAGResponse> {
  const fullConfig = { ...DEFAULT_RAG_CONFIG, ...config };

  try {
    // 1. Retrieve relevant documents using enhanced search
    const relevantDocs = await enhancedKnowledgeBase.enhancedSearch(
      query,
      fullConfig
    );

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
        temperature: fullConfig.temperature,
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

/**
 * Initialize the enhanced knowledge base with default infrastructure documents and MongoDB reports
 */
export async function initializeKnowledgeBase(): Promise<void> {
  const defaultDocuments: Omit<KnowledgeDocument, "embedding">[] = [
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

  // Add all default documents to the knowledge base
  for (const doc of defaultDocuments) {
    await enhancedKnowledgeBase.addDocument(doc);
  }

  // Initialize MongoDB integration
  await enhancedKnowledgeBase.initializeWithMongoDB();

  // Load historical reports
  await enhancedKnowledgeBase.loadReportsKnowledge();

  const totalDocs = enhancedKnowledgeBase.getAllDocuments().length;
  console.log(
    `Initialized enhanced knowledge base with ${totalDocs} documents (including historical reports)`
  );
}

/**
 * Add a custom document to the knowledge base
 */
export async function addKnowledgeDocument(
  title: string,
  content: string,
  category: string,
  metadata?: Record<string, any>
): Promise<string> {
  const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  await enhancedKnowledgeBase.addDocument({
    id,
    title,
    content,
    category,
    metadata,
    timestamp: new Date(),
  });

  return id;
}

/**
 * Enhanced image analysis with RAG context
 */
export async function analyzeImageWithContext(
  imageFile: File,
  query?: string,
  temperature = 0.2
): Promise<{
  analysis: any;
  contextualInsights: RAGResponse;
}> {
  try {
    // First, perform standard image analysis
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const maxSize = 640;

    // Load and process image
    const image = await loadImage(imageFile);
    const scale = Math.min(maxSize / image.width, maxSize / image.height);
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);

    const dataURL = canvas.toDataURL("image/png");
    const base64Data = dataURL.replace("data:image/png;base64,", "");

    // Standard image analysis
    const analysisResponse = await genAI.models.generateContent({
      model: "models/gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/png",
              },
            },
            {
              text: `Analyze this infrastructure image and identify any issues, damage, or maintenance needs.
                   Return a JSON object with: detected_objects (array of objects with name, confidence, condition, description, severity).`,
            },
          ],
        },
      ],
      config: { temperature },
    });

    let analysisText = analysisResponse.text || "";
    if (analysisText.includes("```json")) {
      analysisText = analysisText.split("```json")[1].split("```")[0];
    }

    const analysis = JSON.parse(analysisText);

    // Get contextual insights using RAG
    const contextQuery =
      query ||
      `Infrastructure analysis for detected objects: ${
        analysis.detected_objects?.map((obj: any) => obj.name).join(", ") ||
        "general infrastructure"
      }`;

    const contextualInsights = await generateRAGResponse(
      contextQuery,
      "You are an expert infrastructure analyst. Provide detailed insights about the detected infrastructure issues."
    );

    return {
      analysis,
      contextualInsights,
    };
  } catch (error) {
    console.error("Error in contextual image analysis:", error);
    throw error;
  }
}

/**
 * Load an image from File
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Enhanced Knowledge Base with MongoDB Reports Integration
 */
class EnhancedKnowledgeBase extends KnowledgeBase {
  private mongoProvider: any = null;
  private reportKnowledgeLoaded = false;

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
      console.log("Continuing with default knowledge base only");
    }
  }

  /**
   * Load historical reports as knowledge documents
   */
  async loadReportsKnowledge(): Promise<void> {
    if (!this.mongoProvider || this.reportKnowledgeLoaded) return;

    try {
      console.log("Loading historical reports into knowledge base...");
      const reportKnowledge =
        await this.mongoProvider.getAllReportsAsKnowledge();

      for (const knowledge of reportKnowledge) {
        const doc: KnowledgeDocument = {
          id: knowledge.id,
          title: knowledge.title,
          content: knowledge.content,
          category: knowledge.category,
          metadata: knowledge.metadata,
          timestamp: knowledge.timestamp,
        };

        await this.addDocument(doc);
      }

      this.reportKnowledgeLoaded = true;
      console.log(
        `Loaded ${reportKnowledge.length} historical reports into knowledge base`
      );
    } catch (error) {
      console.error("Error loading reports knowledge:", error);
    }
  }

  /**
   * Search reports by specific criteria
   */
  async searchReportsByCategory(
    category: string
  ): Promise<KnowledgeDocument[]> {
    if (!this.mongoProvider) return [];

    try {
      const reportKnowledge = await this.mongoProvider.getReportsByCategory(
        category
      );
      return reportKnowledge.map((knowledge: ProcessedReportKnowledge) => ({
        id: knowledge.id,
        title: knowledge.title,
        content: knowledge.content,
        category: knowledge.category,
        metadata: knowledge.metadata,
        timestamp: knowledge.timestamp,
      }));
    } catch (error) {
      console.error(`Error searching reports by category ${category}:`, error);
      return [];
    }
  }

  /**
   * Search reports by location
   */
  async searchReportsByLocation(
    location: string
  ): Promise<KnowledgeDocument[]> {
    if (!this.mongoProvider) return [];

    try {
      const reportKnowledge = await this.mongoProvider.getReportsByLocation(
        location
      );
      return reportKnowledge.map((knowledge: ProcessedReportKnowledge) => ({
        id: knowledge.id,
        title: knowledge.title,
        content: knowledge.content,
        category: knowledge.category,
        metadata: knowledge.metadata,
        timestamp: knowledge.timestamp,
      }));
    } catch (error) {
      console.error(`Error searching reports by location ${location}:`, error);
      return [];
    }
  }

  /**
   * Get report analytics for contextual insights
   */
  async getReportAnalytics() {
    if (!this.mongoProvider) return null;

    try {
      return await this.mongoProvider.getReportAnalytics();
    } catch (error) {
      console.error("Error fetching report analytics:", error);
      return null;
    }
  }

  /**
   * Enhanced search with MongoDB integration
   */
  async enhancedSearch(
    query: string,
    config: Partial<RAGConfig> = {}
  ): Promise<KnowledgeDocument[]> {
    const results: KnowledgeDocument[] = [];

    // Search default knowledge base
    const defaultResults = await this.search(query, config);
    results.push(...defaultResults);

    // Search MongoDB reports if available
    if (this.mongoProvider) {
      try {
        const reportKnowledge = await this.mongoProvider.searchReports(query);
        const reportDocs = reportKnowledge.map(
          (knowledge: ProcessedReportKnowledge) => ({
            id: knowledge.id,
            title: knowledge.title,
            content: knowledge.content,
            category: knowledge.category,
            metadata: knowledge.metadata,
            timestamp: knowledge.timestamp,
          })
        );
        results.push(...reportDocs);
      } catch (error) {
        console.error("Error searching MongoDB reports:", error);
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = results.filter(
      (doc, index, self) => index === self.findIndex((d) => d.id === doc.id)
    );

    return uniqueResults.slice(
      0,
      config.maxDocuments || DEFAULT_RAG_CONFIG.maxDocuments
    );
  }
}

// Create enhanced knowledge base instance
const enhancedKnowledgeBase = new EnhancedKnowledgeBase();

// Export enhanced knowledge base
export const knowledgeBase = enhancedKnowledgeBase;

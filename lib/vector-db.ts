/**
 * Vector Database integration for production RAG system
 * This provides an interface for vector databases like ChromaDB, Pinecone, or Supabase
 */

import { KnowledgeDocument } from "./rag-utils";

export interface VectorDBConfig {
  provider: "chromadb" | "pinecone" | "supabase" | "local";
  apiKey?: string;
  endpoint?: string;
  collection?: string;
}

export interface VectorSearchResult {
  document: KnowledgeDocument;
  score: number;
  distance: number;
}

/**
 * Abstract Vector Database interface
 */
export abstract class VectorDatabase {
  protected config: VectorDBConfig;

  constructor(config: VectorDBConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract addDocument(
    doc: KnowledgeDocument,
    embedding: number[]
  ): Promise<void>;
  abstract search(
    queryEmbedding: number[],
    topK: number
  ): Promise<VectorSearchResult[]>;
  abstract deleteDocument(id: string): Promise<void>;
  abstract updateDocument(
    id: string,
    doc: KnowledgeDocument,
    embedding: number[]
  ): Promise<void>;
}

/**
 * ChromaDB implementation
 */
export class ChromaDBProvider extends VectorDatabase {
  private baseUrl: string;
  private collectionName: string;

  constructor(config: VectorDBConfig) {
    super(config);
    this.baseUrl = config.endpoint || "http://localhost:8000";
    this.collectionName = config.collection || "infrastructure_knowledge";
  }

  async initialize(): Promise<void> {
    try {
      // Create collection if it doesn't exist
      const response = await fetch(`${this.baseUrl}/api/v1/collections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: this.collectionName,
          metadata: { description: "Infrastructure knowledge base" },
        }),
      });

      if (!response.ok && response.status !== 409) {
        // 409 = already exists
        throw new Error(`Failed to create collection: ${response.statusText}`);
      }
    } catch (error) {
      console.error("ChromaDB initialization error:", error);
      throw error;
    }
  }

  async addDocument(
    doc: KnowledgeDocument,
    embedding: number[]
  ): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/collections/${this.collectionName}/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ids: [doc.id],
            documents: [doc.content],
            metadatas: [
              {
                title: doc.title,
                category: doc.category,
                timestamp: doc.timestamp.toISOString(),
                ...doc.metadata,
              },
            ],
            embeddings: [embedding],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add document: ${response.statusText}`);
      }
    } catch (error) {
      console.error("ChromaDB add document error:", error);
      throw error;
    }
  }

  async search(
    queryEmbedding: number[],
    topK: number
  ): Promise<VectorSearchResult[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/collections/${this.collectionName}/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query_embeddings: [queryEmbedding],
            n_results: topK,
            include: ["documents", "metadatas", "distances"],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search: ${response.statusText}`);
      }

      const data = await response.json();
      const results: VectorSearchResult[] = [];

      if (data.ids && data.ids[0]) {
        for (let i = 0; i < data.ids[0].length; i++) {
          const metadata = data.metadatas[0][i];
          const document: KnowledgeDocument = {
            id: data.ids[0][i],
            title: metadata.title,
            content: data.documents[0][i],
            category: metadata.category,
            timestamp: new Date(metadata.timestamp),
            metadata: { ...metadata },
          };

          results.push({
            document,
            score: 1 - data.distances[0][i], // Convert distance to similarity score
            distance: data.distances[0][i],
          });
        }
      }

      return results;
    } catch (error) {
      console.error("ChromaDB search error:", error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/collections/${this.collectionName}/delete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ids: [id],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.statusText}`);
      }
    } catch (error) {
      console.error("ChromaDB delete document error:", error);
      throw error;
    }
  }

  async updateDocument(
    id: string,
    doc: KnowledgeDocument,
    embedding: number[]
  ): Promise<void> {
    // ChromaDB doesn't have a direct update, so we delete and add
    await this.deleteDocument(id);
    await this.addDocument(doc, embedding);
  }
}

/**
 * Supabase Vector Database implementation
 */
export class SupabaseVectorProvider extends VectorDatabase {
  private supabaseUrl: string;
  private apiKey: string;

  constructor(config: VectorDBConfig) {
    super(config);
    this.supabaseUrl = config.endpoint!;
    this.apiKey = config.apiKey!;
  }

  async initialize(): Promise<void> {
    // Initialize Supabase client and ensure vector extension is enabled
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/rpc/enable_vector_extension`,
        {
          method: "POST",
          headers: {
            apikey: this.apiKey,
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Create table if it doesn't exist
      const createTableResponse = await fetch(
        `${this.supabaseUrl}/rest/v1/knowledge_documents`,
        {
          method: "POST",
          headers: {
            apikey: this.apiKey,
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({}), // This will fail if table doesn't exist, which is expected
        }
      );

      console.log("Supabase vector database initialized");
    } catch (error) {
      console.log(
        "Supabase initialization completed (table may already exist)"
      );
    }
  }

  async addDocument(
    doc: KnowledgeDocument,
    embedding: number[]
  ): Promise<void> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/knowledge_documents`,
        {
          method: "POST",
          headers: {
            apikey: this.apiKey,
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            id: doc.id,
            title: doc.title,
            content: doc.content,
            category: doc.category,
            metadata: doc.metadata,
            embedding: embedding,
            created_at: doc.timestamp.toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add document: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Supabase add document error:", error);
      throw error;
    }
  }

  async search(
    queryEmbedding: number[],
    topK: number
  ): Promise<VectorSearchResult[]> {
    try {
      // Use Supabase's vector similarity search
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/rpc/search_knowledge_documents`,
        {
          method: "POST",
          headers: {
            apikey: this.apiKey,
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query_embedding: queryEmbedding,
            match_count: topK,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((item: any) => ({
        document: {
          id: item.id,
          title: item.title,
          content: item.content,
          category: item.category,
          metadata: item.metadata,
          timestamp: new Date(item.created_at),
        },
        score: item.similarity,
        distance: 1 - item.similarity,
      }));
    } catch (error) {
      console.error("Supabase search error:", error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/knowledge_documents?id=eq.${id}`,
        {
          method: "DELETE",
          headers: {
            apikey: this.apiKey,
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Supabase delete document error:", error);
      throw error;
    }
  }

  async updateDocument(
    id: string,
    doc: KnowledgeDocument,
    embedding: number[]
  ): Promise<void> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/knowledge_documents?id=eq.${id}`,
        {
          method: "PATCH",
          headers: {
            apikey: this.apiKey,
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: doc.title,
            content: doc.content,
            category: doc.category,
            metadata: doc.metadata,
            embedding: embedding,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update document: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Supabase update document error:", error);
      throw error;
    }
  }
}

/**
 * Factory function to create vector database provider
 */
export function createVectorDatabase(config: VectorDBConfig): VectorDatabase {
  switch (config.provider) {
    case "chromadb":
      return new ChromaDBProvider(config);
    case "supabase":
      return new SupabaseVectorProvider(config);
    case "pinecone":
      throw new Error("Pinecone provider not implemented yet");
    case "local":
    default:
      throw new Error("Local provider should use the in-memory knowledge base");
  }
}

/**
 * Production RAG configuration with vector database
 */
export interface ProductionRAGConfig {
  vectorDB: VectorDBConfig;
  embeddingModel: string;
  maxContextLength: number;
  chunkSize: number;
  chunkOverlap: number;
}

export const DEFAULT_PRODUCTION_CONFIG: ProductionRAGConfig = {
  vectorDB: {
    provider: "local",
  },
  embeddingModel: "text-embedding-004",
  maxContextLength: 4000,
  chunkSize: 1000,
  chunkOverlap: 200,
};

/**
 * Document chunking for large texts
 */
export function chunkDocument(
  content: string,
  chunkSize: number,
  overlap: number
): string[] {
  const chunks: string[] = [];
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  let currentChunk = "";
  let currentSize = 0;

  for (const sentence of sentences) {
    const sentenceLength = sentence.trim().length;

    if (currentSize + sentenceLength > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());

      // Start new chunk with overlap
      const words = currentChunk.split(" ");
      const overlapWords = words.slice(-Math.floor(overlap / 10)); // Approximate overlap
      currentChunk = overlapWords.join(" ") + " " + sentence.trim();
      currentSize = currentChunk.length;
    } else {
      currentChunk += (currentChunk ? ". " : "") + sentence.trim();
      currentSize = currentChunk.length;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * React hooks for RAG functionality
 * Provides easy access to RAG-enhanced AI responses in React components
 */

import { useState, useCallback } from "react";

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  timestamp: string;
}

export interface RAGResponse {
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    metadata?: Record<string, any>;
    timestamp: Date;
  }>;
  confidence: number;
}

export interface RAGError {
  message: string;
  code?: string;
}

/**
 * Hook for querying the RAG system
 */
export function useRAGQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<RAGError | null>(null);
  const [response, setResponse] = useState<RAGResponse | null>(null);

  const query = useCallback(
    async (
      question: string,
      systemContext?: string,
      temperature: number = 0.3
    ): Promise<RAGResponse | null> => {
      setIsLoading(true);
      setError(null);
      setResponse(null);

      try {
        const res = await fetch("/api/rag", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: question,
            systemContext,
            temperature,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP ${res.status}`);
        }

        const ragResponse: RAGResponse = await res.json();
        setResponse(ragResponse);
        return ragResponse;
      } catch (err) {
        const error: RAGError = {
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
        };
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    query,
    reset,
    isLoading,
    error,
    response,
  };
}

/**
 * Hook for managing knowledge base documents
 */
export function useKnowledgeBase() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<RAGError | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rag");

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setDocuments(data.documents);
    } catch (err) {
      const error: RAGError = {
        message:
          err instanceof Error ? err.message : "Failed to fetch documents",
      };
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addDocument = useCallback(
    async (
      title: string,
      content: string,
      category: string,
      metadata?: Record<string, any>
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/rag", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
            category,
            metadata,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP ${res.status}`);
        }

        // Refresh documents list
        await fetchDocuments();
        return true;
      } catch (err) {
        const error: RAGError = {
          message:
            err instanceof Error ? err.message : "Failed to add document",
        };
        setError(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchDocuments]
  );

  return {
    documents,
    fetchDocuments,
    addDocument,
    isLoading,
    error,
  };
}

/**
 * Hook for enhanced image analysis with RAG context
 */
export function useRAGImageAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<RAGError | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [contextualInsights, setContextualInsights] =
    useState<RAGResponse | null>(null);

  const { query: ragQuery } = useRAGQuery();

  const analyzeImage = useCallback(
    async (imageFile: File, context?: string, temperature: number = 0.2) => {
      setIsLoading(true);
      setError(null);
      setAnalysis(null);
      setContextualInsights(null);

      try {
        // First, perform standard image analysis using existing genai-utils
        const { detectObjectsInImage } = await import("../lib/genai-utils");
        const detectedObjects = await detectObjectsInImage(
          imageFile,
          temperature
        );

        setAnalysis({ detected_objects: detectedObjects });

        // Then get contextual insights using RAG
        const contextQuery =
          context ||
          `Infrastructure analysis for detected objects: ${
            detectedObjects.map((obj) => obj.name).join(", ") ||
            "general infrastructure"
          }`;

        const insights = await ragQuery(
          contextQuery,
          "You are an expert infrastructure analyst. Provide detailed insights about the detected infrastructure issues."
        );

        setContextualInsights(insights);

        return {
          analysis: { detected_objects: detectedObjects },
          contextualInsights: insights,
        };
      } catch (err) {
        const error: RAGError = {
          message: err instanceof Error ? err.message : "Analysis failed",
        };
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [ragQuery]
  );

  const reset = useCallback(() => {
    setAnalysis(null);
    setContextualInsights(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    analyzeImage,
    reset,
    isLoading,
    error,
    analysis,
    contextualInsights,
  };
}

/**
 * Hook for MongoDB reports integration with RAG
 */
export function useMongoRAG() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<RAGError | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rag/analytics");

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      const error: RAGError = {
        message:
          err instanceof Error ? err.message : "Failed to fetch analytics",
      };
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const queryWithReportsContext = useCallback(
    async (
      question: string,
      location?: string,
      category?: string
    ): Promise<RAGResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Build context from location and category if provided
        let contextualQuery = question;
        if (location || category) {
          const contextParts = [];
          if (location) contextParts.push(`location: ${location}`);
          if (category) contextParts.push(`category: ${category}`);
          contextualQuery = `${question} (Context: ${contextParts.join(", ")})`;
        }

        const res = await fetch("/api/rag", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: contextualQuery,
            systemContext:
              "You are an expert infrastructure analyst with access to historical report data. Use past reports to provide insights about patterns, common issues, and resolution strategies.",
            temperature: 0.2,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP ${res.status}`);
        }

        const ragResponse: RAGResponse = await res.json();
        return ragResponse;
      } catch (err) {
        const error: RAGError = {
          message: err instanceof Error ? err.message : "Query failed",
        };
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    fetchAnalytics,
    queryWithReportsContext,
    isLoading,
    error,
    analytics,
  };
}

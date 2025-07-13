/**
 * Enhanced React hooks for Indian Infrastructure RAG functionality
 * Provides comprehensive AI responses with Indian context
 */

import { useState, useCallback } from "react";

export interface EnhancedRAGConfig {
  includeIndianContext?: boolean;
  regionalContext?: "north" | "south" | "east" | "west";
  governanceContext?: {
    state?: string;
    district?: string;
    ward?: string;
    governanceLevel?: "municipal" | "panchayat" | "corporation" | "cantonment";
    seasonalContext?:
      | "pre-monsoon"
      | "monsoon"
      | "post-monsoon"
      | "winter"
      | "summer";
  };
  temperature?: number;
  maxDocuments?: number;
  language?: "en" | "hi";
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
  enhanced: boolean;
}

export interface EnhancedRAGError {
  message: string;
  details?: string;
  code?: string;
}

/**
 * Enhanced hook for querying the RAG system with Indian context
 */
export function useEnhancedRAG() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<EnhancedRAGError | null>(null);
  const [lastResponse, setLastResponse] = useState<EnhancedRAGResponse | null>(
    null
  );

  const query = useCallback(
    async (
      question: string,
      config: EnhancedRAGConfig = {}
    ): Promise<EnhancedRAGResponse | null> => {
      if (!question.trim()) {
        setError({ message: "Question cannot be empty" });
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/rag/enhanced", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: question,
            config: {
              includeIndianContext: true,
              temperature: 0.4,
              maxDocuments: 8,
              ...config,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        const ragResponse: EnhancedRAGResponse = {
          answer: data.answer,
          sources: data.sources || [],
          confidence: data.confidence || 0,
          contextUsed: data.contextUsed || [],
          suggestions: data.suggestions || [],
          relatedIssues: data.relatedIssues || [],
          escalationPath: data.escalationPath,
          enhanced: data.enhanced || false,
        };

        setLastResponse(ragResponse);
        return ragResponse;
      } catch (err) {
        const error: EnhancedRAGError = {
          message:
            err instanceof Error ? err.message : "Failed to get response",
          details: err instanceof Error ? err.stack : undefined,
        };
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResponse = useCallback(() => {
    setLastResponse(null);
  }, []);

  return {
    query,
    isLoading,
    error,
    lastResponse,
    clearError,
    clearResponse,
  };
}

/**
 * Hook for context-aware queries with automatic context detection
 */
export function useContextAwareRAG(
  initialContext?: EnhancedRAGConfig["governanceContext"]
) {
  const [context, setContext] =
    useState<EnhancedRAGConfig["governanceContext"]>(initialContext);
  const { query, isLoading, error, lastResponse, clearError, clearResponse } =
    useEnhancedRAG();

  const contextAwareQuery = useCallback(
    async (
      question: string,
      overrideConfig?: Partial<EnhancedRAGConfig>
    ): Promise<EnhancedRAGResponse | null> => {
      // Detect regional context from state
      const getRegionalContext = (
        state?: string
      ): "north" | "south" | "east" | "west" | undefined => {
        if (!state) return undefined;

        const stateToRegion: Record<
          string,
          "north" | "south" | "east" | "west"
        > = {
          Maharashtra: "west",
          Gujarat: "west",
          Rajasthan: "west",
          Goa: "west",
          "Tamil Nadu": "south",
          Karnataka: "south",
          Kerala: "south",
          "Andhra Pradesh": "south",
          Telangana: "south",
          Puducherry: "south",
          "West Bengal": "east",
          Odisha: "east",
          Assam: "east",
          Tripura: "east",
          Manipur: "east",
          Meghalaya: "east",
          Mizoram: "east",
          Nagaland: "east",
          Sikkim: "east",
          "Arunachal Pradesh": "east",
          Punjab: "north",
          Haryana: "north",
          "Uttar Pradesh": "north",
          Delhi: "north",
          "Himachal Pradesh": "north",
          Uttarakhand: "north",
          "Jammu and Kashmir": "north",
          Ladakh: "north",
          Chandigarh: "north",
          "Madhya Pradesh": "north",
          Chhattisgarh: "east",
          Jharkhand: "east",
          Bihar: "east",
        };

        return stateToRegion[state];
      };

      // Detect seasonal context
      const getSeasonalContext = ():
        | "pre-monsoon"
        | "monsoon"
        | "post-monsoon"
        | "winter"
        | "summer" => {
        const month = new Date().getMonth() + 1;
        if (month >= 4 && month <= 5) return "pre-monsoon";
        if (month >= 6 && month <= 9) return "monsoon";
        if (month >= 10 && month <= 11) return "post-monsoon";
        if (month >= 12 || month <= 2) return "winter";
        return "summer";
      };

      const enhancedConfig: EnhancedRAGConfig = {
        includeIndianContext: true,
        regionalContext: getRegionalContext(context?.state),
        governanceContext: {
          ...context,
          seasonalContext: getSeasonalContext(),
        },
        temperature: 0.4,
        maxDocuments: 8,
        ...overrideConfig,
      };

      return await query(question, enhancedConfig);
    },
    [context, query]
  );

  const updateContext = useCallback(
    (newContext: Partial<EnhancedRAGConfig["governanceContext"]>) => {
      setContext((prev) => ({ ...prev, ...newContext }));
    },
    []
  );

  return {
    contextAwareQuery,
    updateContext,
    context,
    isLoading,
    error,
    lastResponse,
    clearError,
    clearResponse,
  };
}

/**
 * Hook for MongoDB reports integration with enhanced RAG
 */
export function useEnhancedMongoRAG() {
  const [analytics, setAnalytics] = useState<any>(null);
  const { query, isLoading, error, lastResponse, clearError } =
    useEnhancedRAG();

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch("/api/rag/analytics");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setAnalytics(data.analytics);
      return data.analytics;
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      return null;
    }
  }, []);

  const queryWithReportsContext = useCallback(
    async (
      question: string,
      location?: string,
      category?: string,
      config?: Partial<EnhancedRAGConfig>
    ): Promise<EnhancedRAGResponse | null> => {
      // Enhance query with location and category context
      let enhancedQuestion = question;

      if (location) {
        enhancedQuestion += ` [Location context: ${location}]`;
      }

      if (category) {
        enhancedQuestion += ` [Category context: ${category}]`;
      }

      // Add user-specific context if specified
      if (config?.userSpecific && config?.userId) {
        enhancedQuestion += ` [User-specific query for user: ${config.userId}]`;
      }

      return await query(enhancedQuestion, {
        includeIndianContext: true,
        maxDocuments: 10, // More documents for report context
        ...config,
      });
    },
    [query]
  );

  const searchReportsByContext = useCallback(
    async (searchParams: {
      category?: string;
      location?: string;
      status?: string;
      priority?: string;
      timeframe?: string;
    }) => {
      try {
        const response = await fetch("/api/rag/analytics/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchParams),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.results || [];
      } catch (err) {
        console.error("Failed to search reports:", err);
        return [];
      }
    },
    []
  );

  return {
    queryWithReportsContext,
    searchReportsByContext,
    fetchAnalytics,
    analytics,
    isLoading,
    error,
    lastResponse,
    clearError,
  };
}

/**
 * Hook for seasonal infrastructure insights
 */
export function useSeasonalRAG() {
  const { query, isLoading, error, lastResponse } = useEnhancedRAG();

  const getSeasonalInsights = useCallback(
    async (
      issueType: string,
      location?: string
    ): Promise<EnhancedRAGResponse | null> => {
      const currentMonth = new Date().getMonth() + 1;
      let seasonContext = "";

      if (currentMonth >= 6 && currentMonth <= 9) {
        seasonContext =
          "monsoon season - focus on drainage, flooding, waterlogging issues";
      } else if (currentMonth >= 3 && currentMonth <= 5) {
        seasonContext =
          "summer season - focus on water scarcity, heat-related infrastructure stress";
      } else if (currentMonth >= 4 && currentMonth <= 5) {
        seasonContext =
          "pre-monsoon season - focus on preventive maintenance and preparation";
      } else {
        seasonContext =
          "post-monsoon/winter season - focus on recovery and maintenance";
      }

      const seasonalQuery = `What are the seasonal considerations for ${issueType} ${
        location ? `in ${location}` : ""
      } during ${seasonContext}? Include preventive measures and typical resolution approaches.`;

      return await query(seasonalQuery, {
        includeIndianContext: true,
        temperature: 0.3, // Lower temperature for more focused seasonal advice
      });
    },
    [query]
  );

  const getPreventiveMeasures = useCallback(
    async (
      upcomingSeason: "monsoon" | "summer" | "winter",
      infrastructureType?: string
    ): Promise<EnhancedRAGResponse | null> => {
      const preventiveQuery = `What preventive infrastructure measures should be taken before ${upcomingSeason} season${
        infrastructureType ? ` for ${infrastructureType}` : ""
      } in Indian urban areas? Include timing, responsible departments, and citizen preparation.`;

      return await query(preventiveQuery, {
        includeIndianContext: true,
        temperature: 0.3,
      });
    },
    [query]
  );

  return {
    getSeasonalInsights,
    getPreventiveMeasures,
    isLoading,
    error,
    lastResponse,
  };
}

/**
 * Hook for emergency response guidance
 */
export function useEmergencyRAG() {
  const { query, isLoading, error, lastResponse } = useEnhancedRAG();

  const getEmergencyGuidance = useCallback(
    async (
      emergencyType: string,
      location?: string,
      severity?: "low" | "medium" | "high"
    ): Promise<EnhancedRAGResponse | null> => {
      const emergencyQuery = `Emergency guidance for ${emergencyType}${
        location ? ` in ${location}` : ""
      } - provide immediate steps, authority contacts, safety measures, and escalation procedures. Severity level: ${
        severity || "medium"
      }.`;

      return await query(emergencyQuery, {
        includeIndianContext: true,
        temperature: 0.2, // Very focused responses for emergencies
        maxDocuments: 5,
      });
    },
    [query]
  );

  return {
    getEmergencyGuidance,
    isLoading,
    error,
    lastResponse,
  };
}

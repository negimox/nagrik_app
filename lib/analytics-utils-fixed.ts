/**
 * Analytics utilities for generating insights from infrastructure report data
 * Uses Gemini AI to process and analyze reports in various ways
 */

import { genAI } from "./genai-utils";

/**
 * Types of insights that can be generated from report data
 */
export enum InsightType {
  EXECUTIVE_SUMMARY = "executive_summary",
  ANOMALY_DETECTION = "anomaly_detection",
  PREDICTIVE_FORECAST = "predictive_forecast",
  POLICY_IMPACT = "policy_impact",
  RESOURCE_ALLOCATION = "resource_allocation",
  DEMOGRAPHIC_ANALYSIS = "demographic_analysis",
  SEASONAL_PATTERNS = "seasonal_patterns",
  BUDGET_OPTIMIZATION = "budget_optimization",
}

/**
 * Interface for demographic data that can be included in analysis
 */
export interface DemographicData {
  populationDensity?: number; // people per square km
  medianIncome?: number; // average income in the area
  ageDistribution?: Record<string, number>; // percentage by age group
  residentialVsCommercial?: number; // ratio (1 = equal, >1 more residential, <1 more commercial)
  trafficVolume?: "low" | "medium" | "high";
}

/**
 * Interface for report analytics request
 */
export interface AnalyticsRequest {
  timeRange: string;
  reportData: any;
  categoryData?: any[];
  districtData?: any[];
  resolutionTimeData?: any[];
  policyImpactData?: any[];
  anomalyData?: any[];
  demographicData?: Record<string, DemographicData>;
  weatherData?: any[];
  selectedDistricts?: string[];
  selectedCategories?: string[];
  maxRecommendations?: number;
  insightTypes?: InsightType[];
}

/**
 * Interface for structured analytics response
 */
export interface StructuredAnalyticsResponse {
  criticalInsights: string[];
  anomalies: {
    category: string;
    district: string;
    severity: "low" | "medium" | "high";
    increase: number;
    description: string;
    recommendedAction: string;
  }[];
  policyImpacts: {
    policyName: string;
    effectiveness: "low" | "medium" | "high";
    metrics: Record<string, any>;
    description: string;
  }[];
  predictions: {
    category: string;
    district: string;
    predictedIssueCount: number;
    confidence: number;
    timeframe: string;
    contributingFactors: string[];
    recommendedAction: string;
  }[];
  recommendations: string[];
}

/**
 * Generate executive insights from infrastructure report data
 */
export async function generateReportInsights(
  request: AnalyticsRequest,
  temperature = 0.2
): Promise<string> {
  try {
    // Create a comprehensive prompt based on available data
    let prompt = `Analyze the following infrastructure report data and generate executive insights:
      - Time period: ${request.timeRange}
      - Total reports: ${request.reportData.totalReports || "N/A"}
      - Resolved reports: ${request.reportData.resolvedReports || "N/A"}
      - Resolution rate: ${
        request.reportData.resolvedReports && request.reportData.totalReports
          ? (
              (request.reportData.resolvedReports /
                request.reportData.totalReports) *
              100
            ).toFixed(1) + "%"
          : "N/A"
      }
      - Average resolution time: ${
        request.reportData.averageResolutionTime || "N/A"
      }
      `;

    // Add category data if available
    if (request.categoryData && request.categoryData.length > 0) {
      prompt += `\n- Distribution by category: ${JSON.stringify(
        request.categoryData
      )}`;
    }

    // Add district data if available
    if (request.districtData && request.districtData.length > 0) {
      prompt += `\n- Distribution by district: ${JSON.stringify(
        request.districtData
      )}`;
    }

    // Add resolution time data if available
    if (request.resolutionTimeData && request.resolutionTimeData.length > 0) {
      prompt += `\n- Resolution times: ${JSON.stringify(
        request.resolutionTimeData
      )}`;
    }

    // Add policy impact data if available
    if (request.policyImpactData && request.policyImpactData.length > 0) {
      prompt += `\n- Policy impact data: ${JSON.stringify(
        request.policyImpactData
      )}`;
    }

    // Add anomaly data if available
    if (request.anomalyData && request.anomalyData.length > 0) {
      prompt += `\n- Anomaly data: ${JSON.stringify(request.anomalyData)}`;
    }

    // Add demographic data if available
    if (
      request.demographicData &&
      Object.keys(request.demographicData).length > 0
    ) {
      prompt += `\n- Demographic data: ${JSON.stringify(
        request.demographicData
      )}`;
    }

    // Add weather data if available
    if (request.weatherData && request.weatherData.length > 0) {
      prompt += `\n- Weather data: ${JSON.stringify(request.weatherData)}`;
    }

    // Filter by specific districts if requested
    if (
      request.selectedDistricts &&
      request.selectedDistricts.length > 0 &&
      request.selectedDistricts[0] !== "all"
    ) {
      prompt += `\n- Focus analysis on these districts: ${request.selectedDistricts.join(
        ", "
      )}`;
    }

    // Filter by specific categories if requested
    if (
      request.selectedCategories &&
      request.selectedCategories.length > 0 &&
      request.selectedCategories[0] !== "all"
    ) {
      prompt += `\n- Focus analysis on these categories: ${request.selectedCategories.join(
        ", "
      )}`;
    }

    // Filter insight types if specified
    const insightTypes = request.insightTypes || [
      InsightType.EXECUTIVE_SUMMARY,
      InsightType.ANOMALY_DETECTION,
      InsightType.POLICY_IMPACT,
      InsightType.PREDICTIVE_FORECAST,
    ];

    // Define the sections needed based on requested insight types
    const sections = [];
    if (insightTypes.includes(InsightType.EXECUTIVE_SUMMARY)) {
      sections.push("Critical Insights");
    }
    if (insightTypes.includes(InsightType.ANOMALY_DETECTION)) {
      sections.push("Anomaly Detection");
    }
    if (insightTypes.includes(InsightType.POLICY_IMPACT)) {
      sections.push("Policy Impact Assessment");
    }
    if (insightTypes.includes(InsightType.PREDICTIVE_FORECAST)) {
      sections.push("Predictive Insights");
    }
    if (insightTypes.includes(InsightType.RESOURCE_ALLOCATION)) {
      sections.push("Resource Allocation Recommendations");
    }
    if (insightTypes.includes(InsightType.DEMOGRAPHIC_ANALYSIS)) {
      sections.push("Demographic Impact Analysis");
    }
    if (insightTypes.includes(InsightType.SEASONAL_PATTERNS)) {
      sections.push("Seasonal Patterns and Cyclical Trends");
    }
    if (insightTypes.includes(InsightType.BUDGET_OPTIMIZATION)) {
      sections.push("Budget Optimization Strategies");
    }

    // Always include recommendations
    sections.push("Policy Recommendations");

    prompt += `\nGenerate an executive summary with these sections:\n`;
    sections.forEach((section, index) => {
      prompt += `${index + 1}. ${section}\n`;
    });

    // Add specific instructions for the number of recommendations
    if (request.maxRecommendations) {
      prompt += `\nProvide at most ${request.maxRecommendations} clear, actionable recommendations.`;
    }

    // Add formatting instructions
    prompt += `\n\nFormat your response as Markdown with proper headings and bullet points. Be specific, data-driven, and insightful.`;

    console.log("Gemini Insight Prompt:", prompt);

    try {
      // Call the Gemini API with the constructed prompt
      const model = genAI.models.get("models/gemini-2.0-flash");
      const result = await model.generateContent(prompt);

      // Extract text from result
      if (result && result.response && result.response.text) {
        return result.response.text();
      }

      // Handle new API format
      if (
        result &&
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        return result.candidates[0].content.parts[0].text || "";
      }

      return "No valid response generated";
    } catch (apiError) {
      console.error(
        "API Error:",
        apiError instanceof Error ? apiError.message : String(apiError)
      );
      return "Failed to generate insights due to API error. Please try again later.";
    }
  } catch (error) {
    console.error(
      "Error generating infrastructure insights:",
      error instanceof Error ? error.message : String(error)
    );
    return "Failed to generate insights. Please try again later.";
  }
}

/**
 * Generate structured analytics data optimized for visualization and UI components
 */
export async function generateStructuredInsights(
  request: AnalyticsRequest,
  temperature = 0.1
): Promise<StructuredAnalyticsResponse> {
  try {
    // Create a prompt for generating structured data
    const prompt = `
      Analyze the following infrastructure report data and generate structured insights in JSON format:
      ${JSON.stringify(request)}

      Return a JSON object with these fields exactly:
      {
        "criticalInsights": ["insight 1", "insight 2", ...],
        "anomalies": [
          {
            "category": "string",
            "district": "string",
            "severity": "low|medium|high",
            "increase": number,
            "description": "string",
            "recommendedAction": "string"
          }
        ],
        "policyImpacts": [
          {
            "policyName": "string",
            "effectiveness": "low|medium|high",
            "metrics": {},
            "description": "string"
          }
        ],
        "predictions": [
          {
            "category": "string",
            "district": "string",
            "predictedIssueCount": number,
            "confidence": number,
            "timeframe": "string",
            "contributingFactors": ["factor1", "factor2"],
            "recommendedAction": "string"
          }
        ],
        "recommendations": ["recommendation 1", "recommendation 2", ...]
      }

      Ensure you return valid JSON with no trailing commas. Be specific, data-driven, and insightful.
    `;

    try {
      // Call the Gemini API with proper model structure
      const model = genAI.models.get("models/gemini-2.0-flash");
      const result = await model.generateContent(prompt);

      let responseText = "";

      // Extract text from result
      if (result && result.response && result.response.text) {
        responseText = result.response.text();
      } else if (
        result &&
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        responseText = result.candidates[0].content.parts[0].text || "";
      }

      // Clean up JSON (in case the AI adds markdown code blocks or whitespace)
      if (responseText.includes("```json")) {
        responseText = responseText.split("```json")[1].split("```")[0].trim();
      } else if (responseText.includes("```")) {
        responseText = responseText.split("```")[1].split("```")[0].trim();
      }

      // Parse and return the structured data
      return JSON.parse(responseText) as StructuredAnalyticsResponse;
    } catch (apiError) {
      console.error(
        "API Error:",
        apiError instanceof Error ? apiError.message : String(apiError)
      );
      throw apiError;
    }
  } catch (error) {
    console.error(
      "Error generating structured infrastructure insights:",
      error instanceof Error ? error.message : String(error)
    );
    // Return a default response with an error message
    return {
      criticalInsights: [
        "Failed to generate insights. Please try again later.",
      ],
      anomalies: [],
      policyImpacts: [],
      predictions: [],
      recommendations: [
        "System encountered an error. Please try refreshing or contact support.",
      ],
    };
  }
}

/**
 * Generate geospatial analysis insights with specific focus on geographic patterns
 */
export async function generateGeospatialInsights(
  districtData: any[],
  reportData: any[],
  geoFeatures?: any[],
  temperature = 0.2
): Promise<string> {
  try {
    const prompt = `
      Analyze the following infrastructure report data with a focus on geospatial patterns:
      - District data: ${JSON.stringify(districtData)}
      - Report data: ${JSON.stringify(reportData)}
      ${
        geoFeatures
          ? `- Geographic features: ${JSON.stringify(geoFeatures)}`
          : ""
      }

      Generate insights addressing:
      1. Spatial clustering of infrastructure issues
      2. Geographic disparities in issue resolution times
      3. Relationships between issue types and specific areas
      4. Geographic prioritization recommendations based on severity and density
      5. Spatial correlations between different issue types

      Format your response as Markdown with proper headings and bullet points.
    `;

    try {
      // Call the Gemini API with proper model structure
      const model = genAI.models.get("models/gemini-2.0-flash");
      const result = await model.generateContent(prompt);

      // Extract text from result
      if (result && result.response && result.response.text) {
        return result.response.text();
      }

      // Handle new API format
      if (
        result &&
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        return result.candidates[0].content.parts[0].text || "";
      }

      return "No valid geospatial insights generated";
    } catch (apiError) {
      console.error(
        "API Error:",
        apiError instanceof Error ? apiError.message : String(apiError)
      );
      return "Failed to generate geospatial insights due to API error. Please try again later.";
    }
  } catch (error) {
    console.error(
      "Error generating geospatial insights:",
      error instanceof Error ? error.message : String(error)
    );
    return "Failed to generate geospatial insights. Please try again later.";
  }
}

/**
 * Generate budget and resource allocation recommendations based on report data
 */
export async function generateResourceAllocationInsights(
  categoryData: any[],
  resolutionTimeData: any[],
  budgetConstraints?: number,
  temperature = 0.2
): Promise<string> {
  try {
    const prompt = `
      Analyze the following infrastructure report data and generate recommendations for optimal resource allocation:
      - Category distribution: ${JSON.stringify(categoryData)}
      - Resolution time by category: ${JSON.stringify(resolutionTimeData)}
      ${budgetConstraints ? `- Budget constraints: ${budgetConstraints}` : ""}

      Generate insights addressing:
      1. Optimal allocation of maintenance resources by category
      2. Staff distribution recommendations by district and issue type
      3. Efficiency opportunities to reduce resolution time
      4. Cost-benefit analysis of preventative vs. reactive maintenance
      5. Priority order for addressing different issue types

      Format your response as Markdown with proper headings and bullet points.
    `;

    try {
      // Call the Gemini API with proper model structure
      const model = genAI.models.get("models/gemini-2.0-flash");
      const result = await model.generateContent(prompt);

      // Extract text from result
      if (result && result.response && result.response.text) {
        return result.response.text();
      }

      // Handle new API format
      if (
        result &&
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        return result.candidates[0].content.parts[0].text || "";
      }

      return "No valid resource allocation insights generated";
    } catch (apiError) {
      console.error(
        "API Error:",
        apiError instanceof Error ? apiError.message : String(apiError)
      );
      return "Failed to generate resource allocation insights due to API error. Please try again later.";
    }
  } catch (error) {
    console.error(
      "Error generating resource allocation insights:",
      error instanceof Error ? error.message : String(error)
    );
    return "Failed to generate resource allocation insights. Please try again later.";
  }
}

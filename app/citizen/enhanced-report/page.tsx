/**
 * Enhanced Report Creation Page with RAG Integration
 * Shows how to integrate RAG functionality into existing workflows
 */

"use client";

import React, { useState, useCallback } from "react";
import { Brain, MapPin, Camera, FileText, Lightbulb } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RAGImageDetector } from "@/components/rag-image-detector";
import { useRAGQuery } from "@/hooks/use-rag";
import type { EnhancedDetectedObject } from "@/lib/genai-utils";

export default function EnhancedReportPage() {
  const [reportData, setReportData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    priority: "",
    imageDetections: [] as EnhancedDetectedObject[],
  });

  const [showRAGAssistant, setShowRAGAssistant] = useState(false);
  const [assistantQuery, setAssistantQuery] = useState("");

  const {
    query: askRAG,
    isLoading: isQuerying,
    response: ragResponse,
  } = useRAGQuery();

  const handleDetectionComplete = useCallback(
    (objects: EnhancedDetectedObject[], insights?: any) => {
      setReportData((prev) => ({
        ...prev,
        imageDetections: objects,
      }));

      // Auto-populate fields based on AI detection
      if (objects.length > 0) {
        const primaryObject = objects[0];
        const highPriorityIssues = objects.filter(
          (obj) => obj.severity === "High"
        );

        // Generate title
        const title =
          highPriorityIssues.length > 0
            ? `${highPriorityIssues[0].condition || "Damaged"} ${
                highPriorityIssues[0].name
              }`
            : `${primaryObject.condition || "Issue with"} ${
                primaryObject.name
              }`;

        // Generate description
        const descriptions = objects
          .filter((obj) => obj.description)
          .map((obj) => obj.description)
          .join(" ");

        // Determine priority
        const priority =
          highPriorityIssues.length > 0
            ? "High"
            : objects.some((obj) => obj.severity === "Medium")
            ? "Medium"
            : "Low";

        // Determine category
        const category = inferCategory(objects);

        setReportData((prev) => ({
          ...prev,
          title: title,
          description:
            descriptions ||
            `Detected ${objects.length} infrastructure issue(s) requiring attention.`,
          priority: priority.toLowerCase(),
          category: category,
        }));
      }

      // Show contextual insights if available
      if (insights?.answer) {
        setAssistantQuery(
          "Based on the detected issues, what are the recommended next steps?"
        );
      }
    },
    []
  );

  const inferCategory = (objects: EnhancedDetectedObject[]): string => {
    const categoryMap: Record<string, string> = {
      pothole: "roads",
      streetlight: "lighting",
      sign: "signage",
      sidewalk: "pedestrian",
      drain: "drainage",
      bench: "public-facilities",
      garbage: "waste-management",
      tree: "landscaping",
    };

    for (const obj of objects) {
      for (const [keyword, category] of Object.entries(categoryMap)) {
        if (obj.name.toLowerCase().includes(keyword)) {
          return category;
        }
      }
    }

    return "other";
  };

  const handleAskAssistant = useCallback(async () => {
    if (!assistantQuery.trim()) return;

    const context =
      reportData.imageDetections.length > 0
        ? `Current report context: Detected objects: ${reportData.imageDetections
            .map(
              (obj) =>
                `${obj.name} (${obj.condition}, ${obj.severity} priority)`
            )
            .join(", ")}`
        : "";

    const fullQuery = context
      ? `${context}\n\nQuestion: ${assistantQuery}`
      : assistantQuery;

    await askRAG(
      fullQuery,
      "You are an expert infrastructure analyst helping with report creation. Provide specific, actionable advice.",
      0.3
    );
  }, [assistantQuery, reportData.imageDetections, askRAG]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual report submission
    console.log("Submitting enhanced report:", reportData);
    alert("Report submitted successfully! (This is a demo)");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          Enhanced Infrastructure Report
        </h1>
        <p className="text-gray-600">
          Create detailed infrastructure reports with AI-powered analysis and
          contextual insights
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Analysis Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              AI-Powered Image Analysis
            </CardTitle>
            <CardDescription>
              Upload or capture an image to automatically detect and analyze
              infrastructure issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RAGImageDetector onDetectionComplete={handleDetectionComplete} />
          </CardContent>
        </Card>

        {/* Report Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Report Details
            </CardTitle>
            <CardDescription>
              Review and edit the auto-generated report information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Detection Summary */}
            {reportData.imageDetections.length > 0 && (
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  AI detected {reportData.imageDetections.length} infrastructure
                  issue(s). Report fields have been auto-populated based on the
                  analysis.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  value={reportData.title}
                  onChange={(e) =>
                    setReportData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    value={reportData.location}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Street address or nearby landmark"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={reportData.category}
                  onValueChange={(value) =>
                    setReportData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roads">
                      Roads & Transportation
                    </SelectItem>
                    <SelectItem value="lighting">Street Lighting</SelectItem>
                    <SelectItem value="signage">Signs & Signals</SelectItem>
                    <SelectItem value="pedestrian">
                      Pedestrian Infrastructure
                    </SelectItem>
                    <SelectItem value="drainage">Drainage & Water</SelectItem>
                    <SelectItem value="public-facilities">
                      Public Facilities
                    </SelectItem>
                    <SelectItem value="waste-management">
                      Waste Management
                    </SelectItem>
                    <SelectItem value="landscaping">Landscaping</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level *</Label>
                <Select
                  value={reportData.priority}
                  onValueChange={(value) =>
                    setReportData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      High - Immediate Attention Required
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium - Address Within Weeks
                    </SelectItem>
                    <SelectItem value="low">
                      Low - Routine Maintenance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                value={reportData.description}
                onChange={(e) =>
                  setReportData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Provide a detailed description of the issue, including any safety concerns"
                rows={4}
                required
              />
            </div>

            {/* AI Detection Results */}
            {reportData.imageDetections.length > 0 && (
              <div className="space-y-3">
                <Label>AI-Detected Issues</Label>
                <div className="space-y-2">
                  {reportData.imageDetections.map((obj, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <span className="font-medium capitalize">
                          {obj.name}
                        </span>
                        {obj.condition && (
                          <span className="ml-2 text-gray-600">
                            ({obj.condition})
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {obj.confidence?.toFixed(1)}%
                        </Badge>
                        {obj.severity && (
                          <Badge
                            variant={
                              obj.severity === "High"
                                ? "destructive"
                                : obj.severity === "Medium"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {obj.severity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RAG Assistant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              AI Report Assistant
            </CardTitle>
            <CardDescription>
              Get expert advice and recommendations for your infrastructure
              report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRAGAssistant(!showRAGAssistant)}
              className="w-full"
            >
              {showRAGAssistant ? "Hide" : "Show"} AI Assistant
            </Button>

            {showRAGAssistant && (
              <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border">
                <div className="flex gap-2">
                  <Input
                    value={assistantQuery}
                    onChange={(e) => setAssistantQuery(e.target.value)}
                    placeholder="Ask for reporting advice, severity assessment, or next steps..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAskAssistant}
                    disabled={isQuerying || !assistantQuery.trim()}
                  >
                    {isQuerying ? "Thinking..." : "Ask"}
                  </Button>
                </div>

                {ragResponse && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">AI Recommendation</span>
                      <Badge variant="outline">
                        {(ragResponse.confidence * 100).toFixed(1)}% confidence
                      </Badge>
                    </div>
                    <div className="text-sm bg-white p-3 rounded border">
                      <p className="whitespace-pre-wrap">
                        {ragResponse.answer}
                      </p>
                    </div>

                    {ragResponse.sources.length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer">
                          Sources ({ragResponse.sources.length})
                        </summary>
                        <ul className="mt-1 space-y-1">
                          {ragResponse.sources.map((source, idx) => (
                            <li key={idx} className="ml-4">
                              • {source.title} ({source.category})
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                )}

                {/* Quick Questions */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Quick Questions:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "How should I prioritize this issue?",
                      "What additional information should I include?",
                      "Are there any safety concerns I should mention?",
                      "What are the next steps after submitting this report?",
                    ].map((question, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAssistantQuery(question)}
                        className="text-xs"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Submit Report
          </Button>
        </div>
      </form>
    </div>
  );
}

/**
 * RAG Infrastructure AI Demo Page
 * Showcases the advanced RAG-enhanced AI capabilities for infrastructure analysis
 */

"use client";

import React, { useState } from "react";
import {
  Brain,
  Database,
  Lightbulb,
  FileText,
  Settings,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RAGImageDetector } from "@/components/rag-image-detector";
import { useKnowledgeBase } from "@/hooks/use-rag";
import type { EnhancedDetectedObject } from "@/lib/genai-utils";

export default function RAGDemoPage() {
  const [detectedObjects, setDetectedObjects] = useState<
    EnhancedDetectedObject[]
  >([]);
  const [insights, setInsights] = useState<any>(null);

  const {
    documents,
    fetchDocuments,
    isLoading: kbLoading,
  } = useKnowledgeBase();

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDetectionComplete = (
    objects: EnhancedDetectedObject[],
    contextualInsights?: any
  ) => {
    setDetectedObjects(objects);
    setInsights(contextualInsights);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center gap-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">RAG-Enhanced Infrastructure AI</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Experience advanced AI-powered infrastructure analysis with
          Retrieval-Augmented Generation (RAG). Our system combines real-time
          image analysis with a comprehensive knowledge base for more accurate
          and contextual insights.
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Image Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Advanced computer vision powered by Google Gemini 2.0 Flash for
              detecting infrastructure issues with high accuracy and detailed
              condition assessment.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Curated infrastructure knowledge including best practices,
              severity guidelines, maintenance procedures, and diagnostic
              information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Contextual Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              RAG technology provides context-aware responses by retrieving
              relevant knowledge and generating enhanced insights tailored to
              detected issues.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Demo Interface */}
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">Image Analysis</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="results">Results & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <RAGImageDetector
            onDetectionComplete={handleDetectionComplete}
            className="max-w-4xl mx-auto"
          />
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-600" />
                Infrastructure Knowledge Base
              </CardTitle>
              <CardDescription>
                Our curated knowledge base contains expert information about
                infrastructure types, assessment guidelines, and best practices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {kbLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  <span className="ml-2">Loading knowledge base...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-sm">
                      {documents.length} Documents
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      5 Categories
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{doc.title}</h4>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {doc.category}
                            </Badge>
                          </div>
                          <FileText className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The knowledge base is automatically queried during image analysis
              to provide contextual insights. You can also add custom documents
              through the analysis interface.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {detectedObjects.length > 0 ? (
            <div className="space-y-6">
              {/* Detection Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {detectedObjects.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Objects Detected
                      </div>
                    </div>

                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {
                          detectedObjects.filter(
                            (obj) => obj.severity === "High"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        High Priority Issues
                      </div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {insights
                          ? `${(insights.confidence * 100).toFixed(0)}%`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        RAG Confidence
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Detected Infrastructure Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {detectedObjects.map((obj, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg capitalize">
                            {obj.name}
                          </h3>
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
                                {obj.severity} Priority
                              </Badge>
                            )}
                          </div>
                        </div>

                        {obj.condition && (
                          <div>
                            <span className="font-medium">Condition: </span>
                            <span className="text-gray-600">
                              {obj.condition}
                            </span>
                          </div>
                        )}

                        {obj.description && (
                          <div>
                            <span className="font-medium">Description: </span>
                            <span className="text-gray-600">
                              {obj.description}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* RAG Insights */}
              {insights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      RAG-Enhanced Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{insights.answer}</p>
                      </div>

                      {insights.sources && insights.sources.length > 0 && (
                        <details>
                          <summary className="cursor-pointer font-medium">
                            Knowledge Sources ({insights.sources.length})
                          </summary>
                          <div className="mt-2 space-y-2">
                            {insights.sources.map(
                              (source: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-sm p-2 bg-gray-50 rounded"
                                >
                                  <div className="font-medium">
                                    {source.title}
                                  </div>
                                  <div className="text-gray-600">
                                    Category: {source.category}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No Analysis Results Yet
                </h3>
                <p className="text-gray-500">
                  Upload and analyze an image in the "Image Analysis" tab to see
                  detailed results here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Technical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            Technical Implementation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">AI Models</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Google Gemini 2.0 Flash for image analysis</li>
                <li>• Text Embedding 004 for vector embeddings</li>
                <li>• Custom prompting with RAG context</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">RAG Components</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Vector similarity search</li>
                <li>• Context-aware prompt engineering</li>
                <li>• Knowledge base management</li>
                <li>• Confidence scoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

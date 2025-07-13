"use client";

import React, { useState } from "react";
import {
  Brain,
  Layers,
  Search,
  Image as ImageIcon,
  MessageCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RAGImageDetector } from "@/components/rag-image-detector";
import { useRAGQuery } from "@/hooks/use-rag";
import type { EnhancedDetectedObject } from "@/lib/genai-utils";

export function UnifiedRAGDemo() {
  const [query, setQuery] = useState("");
  const [detectedObjects, setDetectedObjects] = useState<
    EnhancedDetectedObject[]
  >([]);
  const { query: ragQuery, isLoading, response, error } = useRAGQuery();

  const handleTextQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    await ragQuery(
      query,
      "You are a comprehensive infrastructure expert with knowledge across all domains including policy, maintenance, safety, and analysis.",
      0.3
    );
  };

  const handleImageAnalysis = (
    objects: EnhancedDetectedObject[],
    insights?: any
  ) => {
    setDetectedObjects(objects);
    // The insights are handled by the RAGImageDetector component itself
  };

  const sampleQueries = [
    "What are the most effective infrastructure maintenance strategies?",
    "How can smart city technologies improve urban infrastructure?",
    "What are the environmental considerations for infrastructure projects?",
    "How should cities prepare infrastructure for climate change?",
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3">
            <Layers className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Unified RAG Demo</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Comprehensive AI-powered infrastructure analysis combining text,
            image, and knowledge base insights
          </p>
        </div>

        {/* Main Interface */}
        <Tabs defaultValue="text" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Text Analysis
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Image Analysis
            </TabsTrigger>
          </TabsList>

          {/* Text Analysis Tab */}
          <TabsContent value="text" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Comprehensive Text Analysis
                </CardTitle>
                <CardDescription>
                  Ask any infrastructure-related question for AI-powered
                  insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleTextQuery} className="space-y-4">
                  <Textarea
                    placeholder="Enter your infrastructure question here..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <Button type="submit" disabled={isLoading || !query.trim()}>
                    {isLoading ? (
                      "Analyzing..."
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Analyze Query
                      </>
                    )}
                  </Button>
                </form>

                {/* Sample Queries */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Sample Questions:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sampleQueries.map((sampleQuery, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery(sampleQuery)}
                        className="text-xs text-left justify-start h-auto p-3"
                      >
                        {sampleQuery}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Results */}
                {response && (
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {(response.confidence * 100).toFixed(1)}% confidence
                      </Badge>
                      <span className="text-sm font-medium">
                        Analysis Results
                      </span>
                    </div>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{response.answer}</p>
                    </div>

                    {response.sources.length > 0 && (
                      <details className="space-y-2">
                        <summary className="cursor-pointer font-medium text-sm">
                          Knowledge Sources ({response.sources.length})
                        </summary>
                        <div className="space-y-2 mt-2">
                          {response.sources.map((source, index) => (
                            <div
                              key={index}
                              className="p-2 bg-background rounded border"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  {source.category}
                                </Badge>
                                <span className="font-medium text-sm">
                                  {source.title}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {source.content.substring(0, 150)}...
                              </p>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image Analysis Tab */}
          <TabsContent value="image" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  RAG-Enhanced Image Analysis
                </CardTitle>
                <CardDescription>
                  Upload infrastructure images for AI analysis with contextual
                  insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RAGImageDetector
                  onDetectionComplete={handleImageAnalysis}
                  className="w-full"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Unified RAG Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  Text Analysis
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Natural language queries</li>
                  <li>• Knowledge base search</li>
                  <li>• Contextual responses</li>
                  <li>• Source attribution</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-green-500" />
                  Image Analysis
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Object detection</li>
                  <li>• Damage assessment</li>
                  <li>• Contextual insights</li>
                  <li>• Safety evaluation</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  AI Integration
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Multi-modal analysis</li>
                  <li>• Knowledge synthesis</li>
                  <li>• Confidence scoring</li>
                  <li>• Expert recommendations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { FileText, Brain, Search, Lightbulb } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRAGQuery } from "@/hooks/use-rag";

export function PolicyRAGDemo() {
  const [query, setQuery] = useState("");
  const { query: ragQuery, isLoading, response, error } = useRAGQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    await ragQuery(
      query,
      "You are a policy expert specializing in infrastructure and urban planning. Provide detailed analysis based on policy knowledge.",
      0.3
    );
  };

  const sampleQueries = [
    "What are the key infrastructure policies in urban planning?",
    "How should municipal authorities prioritize infrastructure investments?",
    "What are best practices for public-private partnerships in infrastructure?",
    "How can cities improve infrastructure maintenance policies?",
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Policy RAG Demo</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            AI-powered policy analysis using Retrieval-Augmented Generation
          </p>
        </div>

        {/* Query Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Policy Analysis Query
            </CardTitle>
            <CardDescription>
              Ask questions about infrastructure policies and best practices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Enter your policy question here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[100px]"
              />
              <Button type="submit" disabled={isLoading || !query.trim()}>
                {isLoading ? (
                  "Analyzing..."
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze Policy
                  </>
                )}
              </Button>
            </form>

            {/* Sample Queries */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Sample Questions:</p>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((sampleQuery, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(sampleQuery)}
                    className="text-xs"
                  >
                    {sampleQuery}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {response && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Policy Analysis Results
                <Badge variant="outline">
                  {(response.confidence * 100).toFixed(1)}% confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{response.answer}</p>
              </div>

              {response.sources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Knowledge Sources:</h4>
                  <div className="space-y-2">
                    {response.sources.map((source, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {source.category}
                          </Badge>
                          <span className="font-medium text-sm">
                            {source.title}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {source.content.substring(0, 200)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Info Panel */}
        <Card>
          <CardHeader>
            <CardTitle>About Policy RAG</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">How it works:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Searches policy knowledge base</li>
                  <li>• Retrieves relevant context</li>
                  <li>• Generates informed responses</li>
                  <li>• Provides source attribution</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Best for:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Policy analysis and recommendations</li>
                  <li>• Infrastructure planning guidance</li>
                  <li>• Regulatory compliance questions</li>
                  <li>• Best practice identification</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

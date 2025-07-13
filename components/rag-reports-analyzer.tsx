"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Search,
  Database,
  TrendingUp,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { useMongoRAG } from "@/hooks/use-rag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportsAnalyzerProps {
  className?: string;
}

export function RAGReportsAnalyzer({ className }: ReportsAnalyzerProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [response, setResponse] = useState("");
  const [recentQueries, setRecentQueries] = useState<string[]>([]);

  const {
    queryWithReportsContext,
    fetchAnalytics,
    isLoading,
    error,
    analytics,
  } = useMongoRAG();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleQuery = async () => {
    if (!query.trim()) return;

    // Convert "all" category to empty string for the API
    const categoryFilter = category === "all" ? "" : category;

    const result = await queryWithReportsContext(
      query,
      location,
      categoryFilter
    );
    if (result) {
      setResponse(result.answer);
      setRecentQueries((prev) => [query, ...prev.slice(0, 4)]);
    }
  };

  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  const exampleQueries = [
    "What are the most common infrastructure issues in downtown areas?",
    "Show me patterns in pothole reports over the last 6 months",
    "What's the average resolution time for electrical issues?",
    "Which areas have the highest number of unresolved reports?",
    "Compare infrastructure issues between residential and commercial zones",
  ];

  const categories = [
    "Roads & Transportation",
    "Utilities",
    "Public Safety",
    "Environment",
    "Buildings & Structures",
    "Lighting",
    "Water & Drainage",
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            RAG Reports Analyzer
          </CardTitle>
          <CardDescription>
            Ask questions about infrastructure reports using AI-powered analysis
            of historical data
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Analytics Overview */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Knowledge Base Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.totalReports || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Reports
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.resolvedReports || 0}
                </div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.pendingReports || 0}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.uniqueLocations || 0}
                </div>
                <div className="text-sm text-muted-foreground">Locations</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Ask About Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Context Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Location (Optional)
              </label>
              <Input
                placeholder="e.g., Downtown, 5th Street, Zone A"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Category (Optional)
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Query Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Your Question
            </label>
            <Textarea
              placeholder="Ask anything about infrastructure reports..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Button */}
          <Button
            onClick={handleQuery}
            disabled={!query.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Reports...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analyze Reports
              </>
            )}
          </Button>

          {/* Context Indicators */}
          {(location || (category && category !== "all")) && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Context:</span>
              {location && (
                <Badge variant="secondary">
                  <MapPin className="h-3 w-3 mr-1" />
                  {location}
                </Badge>
              )}
              {category && category !== "all" && (
                <Badge variant="secondary">{category}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Example Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Example Questions</CardTitle>
          <CardDescription>
            Try these sample queries to explore your reports data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {exampleQueries.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleExampleQuery(example)}
                className="justify-start text-left h-auto p-3"
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Response Display */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                {response}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Queries */}
      {recentQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentQueries.map((recentQuery, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery(recentQuery)}
                  className="justify-start text-left h-auto p-2 w-full"
                >
                  <Search className="h-3 w-3 mr-2 shrink-0" />
                  <span className="truncate">{recentQuery}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

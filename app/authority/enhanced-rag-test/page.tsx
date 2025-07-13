"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useEnhancedRAG,
  useContextAwareRAG,
  useSeasonalRAG,
  useEmergencyRAG,
} from "@/hooks/use-enhanced-rag";
import { EnhancedAuthorityRAGChatBot } from "@/components/enhanced-authority-rag-chatbot";
import {
  Bot,
  MapPin,
  Calendar,
  AlertTriangle,
  Lightbulb,
  ArrowUp,
  CheckCircle,
  Globe,
  Building,
  Users,
} from "lucide-react";

export default function EnhancedRAGTestPage() {
  const [selectedState, setSelectedState] = useState<string>("Maharashtra");
  const [selectedWard, setSelectedWard] = useState<string>("12");
  const [testQuery, setTestQuery] = useState<string>("");
  const [emergencyType, setEmergencyType] =
    useState<string>("drainage_overflow");

  // Hooks
  const {
    query: basicQuery,
    isLoading: basicLoading,
    error: basicError,
    lastResponse: basicResponse,
  } = useEnhancedRAG();

  const {
    contextAwareQuery,
    updateContext,
    context,
    isLoading: contextLoading,
    lastResponse: contextResponse,
  } = useContextAwareRAG({
    state: selectedState,
    ward: selectedWard,
    governanceLevel: "municipal",
  });

  const {
    getSeasonalInsights,
    getPreventiveMeasures,
    isLoading: seasonalLoading,
    lastResponse: seasonalResponse,
  } = useSeasonalRAG();

  const {
    getEmergencyGuidance,
    isLoading: emergencyLoading,
    lastResponse: emergencyResponse,
  } = useEmergencyRAG();

  // Update context when state/ward changes
  const handleContextUpdate = () => {
    updateContext({
      state: selectedState,
      ward: selectedWard,
      governanceLevel: "municipal",
    });
  };

  const handleBasicQuery = async () => {
    if (!testQuery.trim()) return;
    await basicQuery(testQuery);
  };

  const handleContextQuery = async () => {
    if (!testQuery.trim()) return;
    await contextAwareQuery(testQuery);
  };

  const handleSeasonalQuery = async () => {
    await getSeasonalInsights("drainage and waterlogging", selectedState);
  };

  const handlePreventiveQuery = async () => {
    await getPreventiveMeasures("monsoon", "drainage systems");
  };

  const handleEmergencyQuery = async () => {
    await getEmergencyGuidance(emergencyType, selectedState, "high");
  };

  const exampleQueries = [
    "What are the common monsoon problems in Mumbai?",
    "How to report street light issues in my ward?",
    "Which department handles road maintenance?",
    "What is the escalation process for urgent drainage issues?",
    "How to track complaint status online?",
  ];

  const ResponseDisplay = ({
    response,
    title,
  }: {
    response: any;
    title: string;
  }) => {
    if (!response) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Answer */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="whitespace-pre-wrap">{response.answer}</p>
          </div>

          {/* Confidence and Context */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                Confidence: {Math.round((response.confidence || 0) * 100)}%
              </span>
            </div>

            {response.contextUsed && response.contextUsed.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Context:</span>
                <div className="flex gap-1">
                  {response.contextUsed.map((context: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {context}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {response.suggestions && response.suggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-sm">
                  Actionable Suggestions:
                </span>
              </div>
              <div className="space-y-2">
                {response.suggestions.map((suggestion: string, idx: number) => (
                  <div
                    key={idx}
                    className="bg-blue-50 p-3 rounded text-sm text-blue-800"
                  >
                    • {suggestion}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Escalation Path */}
          {response.escalationPath && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowUp className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-sm">Escalation Path:</span>
              </div>
              <div className="bg-orange-50 p-3 rounded text-sm text-orange-800">
                {response.escalationPath}
              </div>
            </div>
          )}

          {/* Related Issues */}
          {response.relatedIssues && response.relatedIssues.length > 0 && (
            <div>
              <span className="font-medium text-sm block mb-2">
                Related Issues:
              </span>
              <div className="flex flex-wrap gap-2">
                {response.relatedIssues.map((issue: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {issue}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {response.sources && response.sources.length > 0 && (
            <div>
              <span className="font-medium text-sm block mb-2">
                Knowledge Sources:
              </span>
              <div className="grid gap-2">
                {response.sources
                  .slice(0, 3)
                  .map((source: any, idx: number) => (
                    <div key={idx} className="bg-gray-100 p-2 rounded text-xs">
                      <div className="font-medium">{source.title}</div>
                      <div className="text-gray-600">
                        Category: {source.category}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#003A70]">
            Enhanced Authority RAG System 🇮🇳
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered Infrastructure Assistant for Indian Municipal Governance
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>India-Specific Context</span>
            </div>
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>Municipal Governance</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Citizen-Authority Bridge</span>
            </div>
          </div>
        </div>

        {/* Context Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic & Administrative Context
            </CardTitle>
            <CardDescription>
              Configure your location and administrative context for better
              responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  State/UT
                </label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="West Bengal">West Bengal</SelectItem>
                    <SelectItem value="Gujarat">Gujarat</SelectItem>
                    <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                    <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Ward Number
                </label>
                <Input
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  placeholder="Enter ward number"
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleContextUpdate} className="w-full">
                  Update Context
                </Button>
              </div>
            </div>

            {context && (
              <Alert>
                <AlertDescription>
                  <strong>Current Context:</strong> {context.state}, Ward{" "}
                  {context.ward}({context.governanceLevel}) • Season:{" "}
                  {context.seasonalContext}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Query Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Query Testing Interface</CardTitle>
            <CardDescription>
              Test different types of RAG queries with Indian infrastructure
              context
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Query Input */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Test Query
                </label>
                <Textarea
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="Enter your infrastructure-related question..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleBasicQuery}
                  disabled={basicLoading || !testQuery.trim()}
                  variant="outline"
                >
                  {basicLoading ? "Processing..." : "Basic RAG Query"}
                </Button>

                <Button
                  onClick={handleContextQuery}
                  disabled={contextLoading || !testQuery.trim()}
                >
                  {contextLoading ? "Processing..." : "Context-Aware Query"}
                </Button>
              </div>
            </div>

            {/* Example Queries */}
            <div>
              <span className="text-sm font-medium block mb-2">
                Example Queries:
              </span>
              <div className="grid gap-2">
                {exampleQueries.map((example, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    size="sm"
                    onClick={() => setTestQuery(example)}
                    className="justify-start text-left h-auto p-3"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specialized Queries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seasonal Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Seasonal Infrastructure Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleSeasonalQuery}
                disabled={seasonalLoading}
                className="w-full"
                variant="outline"
              >
                {seasonalLoading
                  ? "Analyzing..."
                  : "Get Current Seasonal Issues"}
              </Button>

              <Button
                onClick={handlePreventiveQuery}
                disabled={seasonalLoading}
                className="w-full"
              >
                {seasonalLoading ? "Analyzing..." : "Get Preventive Measures"}
              </Button>
            </CardContent>
          </Card>

          {/* Emergency Guidance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Emergency Response Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Emergency Type
                </label>
                <Select value={emergencyType} onValueChange={setEmergencyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drainage_overflow">
                      Drainage Overflow
                    </SelectItem>
                    <SelectItem value="road_cave_in">Road Cave-in</SelectItem>
                    <SelectItem value="electrical_hazard">
                      Electrical Hazard
                    </SelectItem>
                    <SelectItem value="tree_fall">Tree Fall</SelectItem>
                    <SelectItem value="water_contamination">
                      Water Contamination
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleEmergencyQuery}
                disabled={emergencyLoading}
                className="w-full"
                variant="destructive"
              >
                {emergencyLoading
                  ? "Getting Guidance..."
                  : "Get Emergency Guidance"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {(basicError || basicError) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {basicError?.message || "An error occurred"}
            </AlertDescription>
          </Alert>
        )}

        {/* Response Displays */}
        {basicResponse && (
          <ResponseDisplay
            response={basicResponse}
            title="Basic RAG Response"
          />
        )}

        {contextResponse && (
          <ResponseDisplay
            response={contextResponse}
            title="Context-Aware Response"
          />
        )}

        {seasonalResponse && (
          <ResponseDisplay
            response={seasonalResponse}
            title="Seasonal Insights"
          />
        )}

        {emergencyResponse && (
          <ResponseDisplay
            response={emergencyResponse}
            title="Emergency Guidance"
          />
        )}

        {/* Enhanced Chatbot */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-center mb-4">
            Try the Enhanced Chatbot Interface
          </h3>
          <p className="text-center text-gray-600 mb-8">
            Click the chat button in the bottom-right corner to experience the
            full interactive interface
          </p>
        </div>
      </div>

      {/* Enhanced Chatbot Component */}
      <EnhancedAuthorityRAGChatBot
        initialContext={{
          state: selectedState,
          ward: selectedWard,
          governanceLevel: "municipal",
        }}
      />
    </div>
  );
}
